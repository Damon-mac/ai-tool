import { Module } from '@nestjs/common';
import { StockMarketService } from './stock-market.service';
import { StocksController } from './stocks.controller';
import { StocksService } from './stocks.service';

@Module({
  controllers: [StocksController],
  providers: [StocksService, StockMarketService],
})
export class StocksModule {}
