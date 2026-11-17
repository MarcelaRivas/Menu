import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RestaurantService } from './restaurant.service';

@UseGuards(AuthGuard('jwt'))
@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly service: RestaurantService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findById(@Param('id') id: string) { return this.service.findById(Number(id)); }

  @Get(':id/design')
  getDesign(@Param('id') id: string) { return this.service.getDesign(Number(id)); }

  @Put(':id/design')
  updateDesign(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    return this.service.updateDesign(Number(id), data);
  }

  @Post()
  create(@Body() data: { name: string; slug: string }) { return this.service.create(data); }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: { name?: string; slug?: string; active?: boolean }) {
    return this.service.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(Number(id)); }
}