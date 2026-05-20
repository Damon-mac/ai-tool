import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultUnits = [
  {
    name: '文案推荐',
    slug: 'copywriting',
    description: '输入主题、平台和内容类型，一次生成 10 条不同风格的爆款开头，支持复制、收藏与历史回看。',
    route: '/copywriting',
    enabled: true,
    sortOrder: 0,
    cta: '进入文案推荐',
    eyebrow: 'Copywriting Lab',
    icon: 'copywriting',
    points: ['10 条不同风格结果', '支持收藏与历史', '适配小红书 / 抖音 / 朋友圈'],
  },
  {
    name: '股票诊断',
    slug: 'stocks',
    description: '搜索股票代码或名称，获得趋势、估值、情绪、预测区间与仓位建议，并持续跟踪分析。',
    route: '/stocks',
    enabled: true,
    sortOrder: 1,
    cta: '进入股票诊断',
    eyebrow: 'Stock Lab',
    icon: 'stocks',
    points: ['单股诊断与跟踪', '2-3 只股票仓位对比', '后续可继续扩展更多功能卡片'],
  },
  {
    name: '模型配置',
    slug: 'model-config',
    description: '统一管理当前生效的大模型地址、API Key、模型名称和 Provider，避免混用多份 env。',
    route: '/model-config',
    enabled: true,
    sortOrder: 2,
    cta: '进入模型配置',
    eyebrow: 'Model Config',
    icon: 'config',
    points: ['页面配置优先于 env', '支持恢复 env 默认值', '适合切换 DeepSeek / Anthropic / OpenAI 兼容模型'],
  },
];

async function main() {
  console.log('Seeding units...');

  for (const unit of defaultUnits) {
    const existing = await prisma.unit.findUnique({ where: { slug: unit.slug } });
    if (!existing) {
      await prisma.unit.create({ data: unit });
      console.log(`  Created unit: ${unit.name}`);
    } else {
      await prisma.unit.update({
        where: { slug: unit.slug },
        data: {
          name: unit.name,
          description: unit.description,
          route: unit.route,
          cta: unit.cta,
          eyebrow: unit.eyebrow,
          icon: unit.icon,
          points: unit.points,
        },
      });
      console.log(`  Updated unit: ${unit.name}`);
    }
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
