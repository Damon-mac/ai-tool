import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { AdminGuard } from '../common/guards/admin.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateUnitDto } from './dto/create-unit.dto';
import { ManageUnitAccessDto } from './dto/manage-unit-access.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UpdateUnitOrderDto } from './dto/update-order.dto';
import { UnitsService } from './units.service';

@ApiTags('units')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get('enabled')
  findEnabled(@CurrentUser() user: JwtUser) {
    return this.unitsService.findEnabled(user.sub);
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.unitsService.findAll();
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  findOne(@Param('id') id: string) {
    return this.unitsService.findOne(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreateUnitDto) {
    return this.unitsService.create(dto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateUnitDto) {
    return this.unitsService.update(id, dto);
  }

  @Patch(':id/toggle')
  @UseGuards(AdminGuard)
  toggle(@Param('id') id: string) {
    return this.unitsService.toggle(id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.unitsService.remove(id);
  }

  @Put('order/batch')
  @UseGuards(AdminGuard)
  updateOrder(@Body() dto: UpdateUnitOrderDto) {
    return this.unitsService.updateOrder(dto.items);
  }

  @Get(':id/access')
  @UseGuards(AdminGuard)
  getAccessUsers(@Param('id') id: string) {
    return this.unitsService.getAccessUsers(id);
  }

  @Post(':id/access')
  @UseGuards(AdminGuard)
  grantAccess(@Param('id') id: string, @Body() dto: ManageUnitAccessDto) {
    return this.unitsService.grantAccess(id, dto.userId);
  }

  @Delete(':id/access/:userId')
  @UseGuards(AdminGuard)
  revokeAccess(@Param('id') id: string, @Param('userId') userId: string) {
    return this.unitsService.revokeAccess(id, userId);
  }
}
