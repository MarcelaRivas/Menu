import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MenuService } from './menu.service';
import { MenuDto } from './menu.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('menus')
export class MenuController {
  constructor(private readonly service: MenuService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findById(@Param('id') id: string) { return this.service.findById(Number(id)); }

  @Post()
  create(@Body() data: MenuDto) {
    return this.service.create(data as any);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: MenuDto) {
    return this.service.update(Number(id), data as any);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(Number(id)); }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string) { return this.service.duplicate(Number(id)); }

  @Post(':id/copy-to-page')
  copyToPage(@Param('id') id: string, @Body() data: { pageId: number }) {
    return this.service.copyToPage(Number(id), data.pageId);
  }

  @Post(':id/replace')
  replace(@Param('id') id: string, @Body() data: { sourceId: number }) {
    return this.service.replace(data.sourceId, Number(id));
  }
}