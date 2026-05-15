import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { CopywritingModule } from './copywriting/copywriting.module';
import { PrismaModule } from './prisma/prisma.module';
import { StocksModule } from './stocks/stocks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AiModule,
    AuthModule,
    CopywritingModule,
    StocksModule,
  ],
})
export class AppModule {}
