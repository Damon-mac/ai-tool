import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, RecommendationLevel, RiskLevel } from '@prisma/client';
import { StockAnalysisPayload } from '@ai-lab/shared';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyzeStockDto } from './dto/analyze-stock.dto';
import { CompareStocksDto } from './dto/compare-stocks.dto';
import { StockMarketService, StockSnapshotData } from './stock-market.service';

@Injectable()
export class StocksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly stockMarketService: StockMarketService,
  ) {}

  search(keyword: string) {
    return this.stockMarketService.search(keyword);
  }

  tracked(userId: string) {
    return this.prisma.trackedStock.findMany({
      where: { userId },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: [{ updatedAt: 'desc' }],
      take: 20,
    });
  }

  async analyze(userId: string, dto: AnalyzeStockDto) {
    const snapshot = await this.stockMarketService.getSnapshot(dto.symbol);
    if (!snapshot) {
      throw new NotFoundException('未找到该股票数据');
    }

    const tracked = await this.prisma.trackedStock.upsert({
      where: {
        userId_code: {
          userId,
          code: snapshot.symbol,
        },
      },
      update: {
        name: dto.displayName || snapshot.shortName,
        market: snapshot.market,
        secId: snapshot.symbol,
        latestPrice: snapshot.price,
        updatedAt: new Date(),
      },
      create: {
        userId,
        code: snapshot.symbol,
        name: dto.displayName || snapshot.shortName,
        market: snapshot.market,
        secId: snapshot.symbol,
        latestPrice: snapshot.price,
      },
    });

    await this.prisma.stockSnapshot.create({
      data: this.toSnapshotCreate(tracked.id, snapshot),
    });

    const analysis = await this.buildAnalysis(snapshot);
    const saved = await this.prisma.stockAnalysis.create({
      data: {
        trackedStockId: tracked.id,
        summary: analysis.summary,
        trend: analysis.trend,
        valuation: analysis.valuation,
        sentiment: analysis.sentiment,
        riskLevel: analysis.riskLevel as RiskLevel,
        recommendation: analysis.recommendation as RecommendationLevel,
        reasons: this.toJsonValue(analysis.reasons),
        weekPrediction: this.toJsonValue(analysis.weekPrediction),
        monthPrediction: this.toJsonValue(analysis.monthPrediction),
        yearPrediction: this.toJsonValue(analysis.yearPrediction),
        positionSuggestion: analysis.positionSuggestion,
        sourceData: this.toJsonValue(snapshot.raw),
      },
    });

    await this.prisma.trackedStock.update({
      where: { id: tracked.id },
      data: { lastAnalyzedAt: saved.createdAt },
    });

    return {
      trackedStock: tracked,
      analysis: saved,
    };
  }

  async compare(userId: string, dto: CompareStocksDto) {
    const snapshots = await Promise.all(dto.symbols.map((symbol) => this.stockMarketService.getSnapshot(symbol)));
    const validSnapshots = snapshots.filter((item): item is StockSnapshotData => Boolean(item));
    if (validSnapshots.length < 2) {
      throw new NotFoundException('至少需要两只可分析的股票');
    }

    const fallback = {
      overview: '对比完成，建议优先配置走势更稳、估值更合理的标的。',
      allocations: validSnapshots.map((item, index) => ({
        symbol: item.symbol,
        name: item.shortName,
        ratio: index === 0 ? 0.45 : index === 1 ? 0.35 : 0.2,
        reason: `${item.shortName} 当前价格 ${item.price.toFixed(2)}，涨跌幅 ${item.changePercent.toFixed(2)}%。`,
      })),
      conclusion: '仓位分配应结合你的风险承受能力和止损纪律。',
    };

    const comparison = await this.aiService.chatJson<typeof fallback>({
      systemPrompt:
        '你是专业中文投研助手。必须返回 JSON：{"overview":"","allocations":[{"symbol":"","name":"","ratio":0.3,"reason":""}],"conclusion":""}。ratio 总和约等于 1。',
      userPrompt: `请对以下股票做配置建议：${JSON.stringify(validSnapshots)}`,
      fallback,
    });

    const saved = await this.prisma.stockCompareHistory.create({
      data: {
        userId,
        codes: validSnapshots.map((item) => item.symbol),
        result: comparison,
      },
    });

    return {
      id: saved.id,
      ...comparison,
    };
  }

  async removeTracked(userId: string, trackedId: string) {
    const tracked = await this.prisma.trackedStock.findFirst({ where: { id: trackedId, userId } });
    if (!tracked) {
      throw new NotFoundException('跟踪股票不存在');
    }

    await this.prisma.trackedStock.delete({ where: { id: trackedId } });
    return { success: true };
  }

  async recentCompares(userId: string) {
    return this.prisma.stockCompareHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async refreshTrackedStocks() {
    const trackedStocks = await this.prisma.trackedStock.findMany({ take: 50 });
    for (const tracked of trackedStocks) {
      const snapshot = await this.stockMarketService.getSnapshot(tracked.code);
      if (!snapshot) {
        continue;
      }
      await this.prisma.stockSnapshot.create({
        data: this.toSnapshotCreate(tracked.id, snapshot),
      });
      await this.prisma.trackedStock.update({
        where: { id: tracked.id },
        data: {
          latestPrice: snapshot.price,
          updatedAt: new Date(),
        },
      });
    }
  }

  private async buildAnalysis(snapshot: StockSnapshotData): Promise<StockAnalysisPayload> {
    const fallback = this.buildFallbackAnalysis(snapshot);
    const aiResult = await this.aiService.chatJson<StockAnalysisPayload>({
      systemPrompt:
        '你是专业中文股票分析师。必须严格输出 JSON，字段为 summary, trend, valuation, sentiment, riskLevel, recommendation, reasons, weekPrediction, monthPrediction, yearPrediction, positionSuggestion。riskLevel 只能是 low/medium/high，recommendation 只能是 buy/hold/sell。',
      userPrompt: `请基于以下快照给出 A 股诊断：${JSON.stringify(snapshot)}`,
      fallback,
    });

    return {
      ...fallback,
      ...aiResult,
      reasons: Array.isArray(aiResult.reasons) && aiResult.reasons.length > 0 ? aiResult.reasons : fallback.reasons,
    };
  }

  private buildFallbackAnalysis(snapshot: StockSnapshotData): StockAnalysisPayload {
    const price = snapshot.price || 0;
    const weekLow = Number((price * 0.96).toFixed(2));
    const weekHigh = Number((price * 1.05).toFixed(2));
    const monthLow = Number((price * 0.9).toFixed(2));
    const monthHigh = Number((price * 1.12).toFixed(2));
    const yearLow = Number((price * 0.78).toFixed(2));
    const yearHigh = Number((price * 1.35).toFixed(2));
    const rising = snapshot.changePercent >= 0;

    return {
      summary: `${snapshot.shortName} 当前价格 ${price.toFixed(2)}，短线${rising ? '偏强' : '承压'}，建议结合仓位分批应对。`,
      trend: `近期涨跌幅 ${snapshot.changePercent.toFixed(2)}%，量能${snapshot.volume ? '有数据可参考' : '暂缺完整数据'}。`,
      valuation: `市值${snapshot.marketCap ? `约 ${(snapshot.marketCap / 100000000).toFixed(2)} 亿元` : '数据待补充'}，PE ${snapshot.peRatio?.toFixed(2) ?? '暂无'}，PB ${snapshot.pbRatio?.toFixed(2) ?? '暂无'}。`,
      sentiment: `市场情绪偏${rising ? '积极' : '谨慎'}，需要继续跟踪量价配合与消息面。`,
      riskLevel: rising ? 'medium' : 'high',
      recommendation: rising ? 'hold' : 'sell',
      reasons: [
        '当前分析基于公开行情快照与通用估值框架生成',
        '缺少更完整资金流与财报明细时，结论需保守使用',
        '建议结合止损位与仓位纪律执行',
      ],
      weekPrediction: { low: weekLow, high: weekHigh, confidence: 0.52 },
      monthPrediction: { low: monthLow, high: monthHigh, confidence: 0.46 },
      yearPrediction: { low: yearLow, high: yearHigh, confidence: 0.38 },
      positionSuggestion: rising ? '若已持有，可维持 20%-35% 仓位观察突破延续。' : '若要参与，建议轻仓试探，不超过 15%-20%。',
    };
  }

  private toSnapshotCreate(trackedStockId: string, snapshot: StockSnapshotData) {
    return {
      trackedStockId,
      price: snapshot.price,
      changePercent: snapshot.changePercent,
      volume: snapshot.volume,
      turnover: snapshot.turnover,
      high: snapshot.high,
      low: snapshot.low,
      open: snapshot.open,
      previousClose: snapshot.previousClose,
      marketCap: snapshot.marketCap,
      peRatio: snapshot.peRatio,
      pbRatio: snapshot.pbRatio,
      mainFundFlow: snapshot.mainFundFlow,
      rawJson: this.toJsonValue(snapshot.raw),
    };
  }

  private toJsonValue(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
  }
}
