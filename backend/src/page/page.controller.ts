import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PageService } from './page.service';
import { PageDto } from './page.dto';
import { DesignDto } from './design.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('pages')
export class PageController {
  constructor(private readonly service: PageService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findById(@Param('id') id: string) { return this.service.findById(Number(id)); }

  @Post()
  create(@Body() data: PageDto) {
    return this.service.create(data as any);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: PageDto,
  ) { return this.service.update(Number(id), data as any); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(Number(id)); }

  @Put(':id/design')
  updateDesign(
    @Param('id') id: string,
    @Body() data: DesignDto,
  ) {
    // id, pageId y updatedAt vienen de la lectura del diseño: se descartan.
    const { id: _id, pageId: _pageId, updatedAt: _updatedAt, ...design } = data;
    return this.service.updateDesign(Number(id), design as any);
  }
}
