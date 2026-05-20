import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { CopywritingModule } from './copywriting/copywriting.module';
import { ModelConfigModule } from './model-config/model-config.module';
import { PrismaModule } from './prisma/prisma.module';
import { StocksModule } from './stocks/stocks.module';
import { UnitsModule } from './units/units.module';

const workspaceEnvFiles = [resolve(process.cwd(), '..', '..', '.env.local'), resolve(process.cwd(), '..', '..', '.env')].filter((filePath) => existsSync(filePath));

const appEnvFiles = [resolve(process.cwd(), '.env.local'), resolve(process.cwd(), '.env')].filter((filePath) => existsSync(filePath));

const envFilePath = workspaceEnvFiles.length ? workspaceEnvFiles : appEnvFiles;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    ModelConfigModule,
    AiModule,
    AuthModule,
    CopywritingModule,
    StocksModule,
    UnitsModule,
  ],
})
export class AppModule {}
