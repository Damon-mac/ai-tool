import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AiService } from '../ai/ai.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UpdateModelConfigDto } from './dto/update-model-config.dto';
import { ModelConfigService } from './model-config.service';

@ApiTags('model-config')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('model-config')
export class ModelConfigController {
  constructor(
    private readonly modelConfigService: ModelConfigService,
    private readonly aiService: AiService,
  ) {}

  @Get()
  getConfig() {
    return this.modelConfigService.getManagerState();
  }

  @Post('models')
  createModel(@Body() dto: UpdateModelConfigDto) {
    return this.modelConfigService.createModel(dto);
  }

  @Put('models/:modelId')
  updateModel(@Param('modelId') modelId: string, @Body() dto: UpdateModelConfigDto) {
    return this.modelConfigService.updateModel(modelId, dto);
  }

  @Put('active/:modelId')
  setActiveModel(@Param('modelId') modelId: string) {
    return this.modelConfigService.setActiveModel(modelId);
  }

  @Delete('active')
  clearActiveModel() {
    return this.modelConfigService.clearActiveModel();
  }

  @Delete('models/:modelId')
  deleteModel(@Param('modelId') modelId: string) {
    return this.modelConfigService.deleteModel(modelId);
  }

  @Post('models/:modelId/test')
  async testModel(@Param('modelId') modelId: string) {
    const runtimeConfig = await this.modelConfigService.getRuntimeConfigForModel(modelId);
    return this.aiService.testConnection(runtimeConfig);
  }
}
