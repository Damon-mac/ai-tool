import { CopywritingItem } from '@ai-lab/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { FavoriteCopywritingDto } from './dto/favorite-copywriting.dto';
import { GenerateCopywritingDto } from './dto/generate-copywriting.dto';

@Injectable()
export class CopywritingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async generate(userId: string, dto: GenerateCopywritingDto) {
    const fallback = this.buildFallback(dto.topic, dto.platform, dto.contentType);
    const generated = await this.aiService.chatJson<{ items: CopywritingItem[] }>({
      systemPrompt:
        '你是中文内容运营专家。你必须返回严格 JSON，格式为 {"items":[{"content":"","styleTag":""}]}，共 10 条，内容必须是中文、风格互异、适合平台传播。',
      userPrompt: `主题：${dto.topic}\n平台：${dto.platform}\n内容类型：${dto.contentType}\n请生成 10 条爆款开头，每条包含文案和风格标签。`,
      fallback: { items: fallback },
    });

    const items = Array.isArray(generated.items) && generated.items.length > 0 ? generated.items.slice(0, 10) : fallback;

    const history = await this.prisma.copywritingHistory.create({
      data: {
        userId,
        topic: dto.topic,
        platform: dto.platform,
        contentType: dto.contentType,
        results: this.toJsonValue(items),
      },
    });

    return {
      historyId: history.id,
      topic: dto.topic,
      platform: dto.platform,
      contentType: dto.contentType,
      items,
      createdAt: history.createdAt,
    };
  }

  history(userId: string) {
    return this.prisma.copywritingHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }

  favorites(userId: string) {
    return this.prisma.copywritingFavorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async addFavorite(userId: string, dto: FavoriteCopywritingDto) {
    const history = await this.prisma.copywritingHistory.findFirst({
      where: { id: dto.historyId, userId },
    });
    if (!history) {
      throw new NotFoundException('历史记录不存在');
    }

    return this.prisma.copywritingFavorite.upsert({
      where: {
        userId_historyId_itemIndex: {
          userId,
          historyId: dto.historyId,
          itemIndex: dto.itemIndex,
        },
      },
      update: {
        content: dto.content,
        styleTag: dto.styleTag,
      },
      create: {
        userId,
        historyId: dto.historyId,
        itemIndex: dto.itemIndex,
        content: dto.content,
        styleTag: dto.styleTag,
      },
    });
  }

  async removeFavorite(userId: string, favoriteId: string) {
    const favorite = await this.prisma.copywritingFavorite.findFirst({
      where: { id: favoriteId, userId },
    });
    if (!favorite) {
      throw new NotFoundException('收藏不存在');
    }

    await this.prisma.copywritingFavorite.delete({ where: { id: favoriteId } });
    return { success: true };
  }

  private buildFallback(topic: string, platform: string, contentType: string): CopywritingItem[] {
    const styles = ['反差', '情绪共鸣', '权威干货', '真实故事', '结果导向', '悬念', '清单', '避坑', '高端质感', '强行动感'];
    return styles.map((style, index) => ({
      styleTag: style,
      content: `第${index + 1}种${style}风格：如果你正在做“${topic}”相关的${contentType}内容，这条适合发在${platform}，开头先抛出最有冲击力的结果，再迅速给出反常识观点。`,
    }));
  }

  private toJsonValue(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
  }
}
