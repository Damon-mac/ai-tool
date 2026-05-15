import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AnalyzeStockDto } from './dto/analyze-stock.dto';
import { CompareStocksDto } from './dto/compare-stocks.dto';
import { StocksService } from './stocks.service';

@ApiTags('stocks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get('search')
  search(@Query('keyword') keyword: string) {
    return this.stocksService.search(keyword);
  }

  @Get('tracked')
  tracked(@CurrentUser() user: JwtUser) {
    return this.stocksService.tracked(user.sub);
  }

  @Get('compare-history')
  compareHistory(@CurrentUser() user: JwtUser) {
    return this.stocksService.recentCompares(user.sub);
  }

  @Post('analyze')
  analyze(@CurrentUser() user: JwtUser, @Body() dto: AnalyzeStockDto) {
    return this.stocksService.analyze(user.sub, dto);
  }

  @Post('compare')
  compare(@CurrentUser() user: JwtUser, @Body() dto: CompareStocksDto) {
    return this.stocksService.compare(user.sub, dto);
  }

  @Delete('tracked/:trackedId')
  removeTracked(@CurrentUser() user: JwtUser, @Param('trackedId') trackedId: string) {
    return this.stocksService.removeTracked(user.sub, trackedId);
  }
}
