import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CopywritingService } from './copywriting.service';
import { FavoriteCopywritingDto } from './dto/favorite-copywriting.dto';
import { GenerateCopywritingDto } from './dto/generate-copywriting.dto';

@ApiTags('copywriting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('copywriting')
export class CopywritingController {
  constructor(private readonly copywritingService: CopywritingService) {}

  @Post('generate')
  generate(@CurrentUser() user: JwtUser, @Body() dto: GenerateCopywritingDto) {
    return this.copywritingService.generate(user.sub, dto);
  }

  @Get('history')
  history(@CurrentUser() user: JwtUser) {
    return this.copywritingService.history(user.sub);
  }

  @Get('favorites')
  favorites(@CurrentUser() user: JwtUser) {
    return this.copywritingService.favorites(user.sub);
  }

  @Post('favorites')
  addFavorite(@CurrentUser() user: JwtUser, @Body() dto: FavoriteCopywritingDto) {
    return this.copywritingService.addFavorite(user.sub, dto);
  }

  @Delete('favorites/:favoriteId')
  removeFavorite(@CurrentUser() user: JwtUser, @Param('favoriteId') favoriteId: string) {
    return this.copywritingService.removeFavorite(user.sub, favoriteId);
  }
}
