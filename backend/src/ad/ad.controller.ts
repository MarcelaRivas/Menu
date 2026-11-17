import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdService } from './ad.service';
import { AdDto } from './ad.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('ads')
export class AdController {
  constructor(private readonly service: AdService) {}

  @Get()
  findAll(@Query('restaurantId') restaurantId?: string) {
    return this.service.findAll(restaurantId ? Number(restaurantId) : undefined);
  }

  @Get(':id')
  findById(@Param('id') id: string) { return this.service.findById(Number(id)); }

  @Post()
  create(@Body() data: AdDto) {
    return this.service.create(data as any);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: AdDto) {
    return this.service.update(Number(id), data as any);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(Number(id)); }

  @Post(':id/publish')
  publish(@Param('id') id: string, @Body() data: { pageId: number; sortOrder?: number; showAfterSeconds?: number }) {
    return this.service.publish(Number(id), data);
  }

  @Post(':id/unpublish')
  unpublish(@Param('id') id: string, @Body() data: { publishedAdId: number }) {
    return this.service.unpublish(data.publishedAdId);
  }
}