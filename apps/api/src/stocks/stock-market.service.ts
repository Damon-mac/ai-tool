import { Injectable } from '@nestjs/common';

export interface StockLookupResult {
  symbol: string;
  shortName: string;
  exchange?: string;
  market?: string;
}

export interface StockSnapshotData {
  symbol: string;
  shortName: string;
  market: string;
  price: number;
  changePercent: number;
  volume?: number;
  turnover?: number;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
  marketCap?: number;
  peRatio?: number;
  pbRatio?: number;
  mainFundFlow?: number;
  raw: Record<string, unknown>;
}

@Injectable()
export class StockMarketService {
  private yahooFinancePromise?: Promise<any>;

  async search(keyword: string): Promise<StockLookupResult[]> {
    const candidates = this.normalizeCandidates(keyword);
    const merged = new Map<string, StockLookupResult>();
    const yahooFinance = await this.getYahooFinance();

    for (const candidate of candidates) {
      try {
        const result = await yahooFinance.search(candidate, { quotesCount: 8, newsCount: 0 });
        for (const quote of result.quotes ?? []) {
          if (!quote.symbol || !quote.shortname) {
            continue;
          }
          if (!this.isSupportedQuote(quote.symbol, quote.exchange)) {
            continue;
          }
          merged.set(quote.symbol, {
            symbol: quote.symbol,
            shortName: quote.shortname,
            exchange: quote.exchange,
            market: this.detectMarket(quote.symbol, quote.exchange),
          });
        }
      } catch {
        continue;
      }
    }

    return Array.from(merged.values()).slice(0, 8);
  }

  async getSnapshot(symbol: string): Promise<StockSnapshotData | null> {
    const normalized = this.normalizeSymbol(symbol);
    const yahooFinance = await this.getYahooFinance();
    try {
      const quote = await yahooFinance.quote(normalized);
      const summary = await yahooFinance.quoteSummary(normalized, {
        modules: ['price', 'summaryDetail', 'financialData', 'defaultKeyStatistics'],
      });

      return {
        symbol: normalized,
        shortName: quote.shortName || quote.longName || normalized,
        market: this.detectMarket(normalized, quote.fullExchangeName),
        price: Number(quote.regularMarketPrice || 0),
        changePercent: Number(quote.regularMarketChangePercent || 0),
        volume: quote.regularMarketVolume ? Number(quote.regularMarketVolume) : undefined,
        turnover: summary.summaryDetail?.averageVolume ? Number(summary.summaryDetail.averageVolume) : undefined,
        high: quote.regularMarketDayHigh ? Number(quote.regularMarketDayHigh) : undefined,
        low: quote.regularMarketDayLow ? Number(quote.regularMarketDayLow) : undefined,
        open: quote.regularMarketOpen ? Number(quote.regularMarketOpen) : undefined,
        previousClose: quote.regularMarketPreviousClose ? Number(quote.regularMarketPreviousClose) : undefined,
        marketCap: summary.price?.marketCap ? Number(summary.price.marketCap) : undefined,
        peRatio: summary.summaryDetail?.trailingPE ? Number(summary.summaryDetail.trailingPE) : undefined,
        pbRatio: summary.defaultKeyStatistics?.priceToBook ? Number(summary.defaultKeyStatistics.priceToBook) : undefined,
        mainFundFlow: summary.financialData?.operatingCashflow ? Number(summary.financialData.operatingCashflow) : undefined,
        raw: {
          quote,
          summary,
        },
      };
    } catch {
      return null;
    }
  }

  private normalizeCandidates(keyword: string) {
    const cleaned = keyword.trim();
    if (/^\d{6}$/.test(cleaned)) {
      return [`${cleaned}.SS`, `${cleaned}.SZ`, cleaned];
    }
    return [cleaned];
  }

  private async getYahooFinance(): Promise<any> {
    if (!this.yahooFinancePromise) {
      this.yahooFinancePromise = import('yahoo-finance2').then((module) => module.default || module);
    }
    return this.yahooFinancePromise;
  }

  private normalizeSymbol(symbol: string) {
    const cleaned = symbol.trim().toUpperCase();
    if (/^\d{6}$/.test(cleaned)) {
      if (cleaned.startsWith('6')) {
        return `${cleaned}.SS`;
      }
      return `${cleaned}.SZ`;
    }
    return cleaned;
  }

  private detectMarket(symbol: string, exchange?: string) {
    if (symbol.endsWith('.SS') || exchange?.includes('Shanghai')) {
      return 'A股·上证';
    }
    if (symbol.endsWith('.SZ') || exchange?.includes('Shenzhen')) {
      return 'A股·深证';
    }
    return exchange || '未知市场';
  }

  private isSupportedQuote(symbol: string, exchange?: string) {
    return symbol.endsWith('.SS') || symbol.endsWith('.SZ') || exchange?.includes('Shanghai') || exchange?.includes('Shenzhen');
  }
}
