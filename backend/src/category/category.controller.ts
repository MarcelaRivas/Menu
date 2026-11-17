import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CategoryService } from './category.service';
import { CategoryDto } from './category.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('categories')
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  @Get()
  findAll(@Query('menuId') menuId?: string, @Query('trashed') trashed?: string) {
    return this.service.findAll(menuId ? Number(menuId) : undefined, trashed === 'true');
  }

  @Get(':id')
  findById(@Param('id') id: string) { return this.service.findById(Number(id)); }

  @Post()
  create(@Body() data: CategoryDto) { return this.service.create(data as any); }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: CategoryDto) { return this.service.update(Number(id), data as any); }

  /** Mueve la categoría (con sus subcategorías y productos) a la papelera. */
  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(Number(id)); }

  @Post(':id/restore')
  restore(@Param('id') id: string) { return this.service.restore(Number(id)); }

  /** Borrado definitivo: solo si la categoría ya está en la papelera. */
  @Delete(':id/permanent')
  permanentRemove(@Param('id') id: string) { return this.service.permanentRemove(Number(id)); }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string) { return this.service.duplicate(Number(id)); }

  @Post(':id/copy-to-menu')
  copyToMenu(@Param('id') id: string, @Body() data: { menuId: number }) {
    return this.service.copyToMenu(Number(id), data.menuId);
  }

  @Post('bulk')
  bulk(@Body() data: { ids: number[]; action: string; value?: any }) {
    switch (data.action) {
      case 'show':
        return this.service.bulkUpdate(data.ids, { visibility: 'VISIBLE' });
      case 'hide':
        return this.service.bulkUpdate(data.ids, { visibility: 'HIDDEN' });
      case 'style':
        return this.service.bulkUpdate(data.ids, { style: data.value });
      case 'columns':
        return this.service.bulkUpdate(data.ids, { columns: Number(data.value) });
      case 'ellipsis':
        return this.service.bulkUpdate(data.ids, { descriptionEllipsis: Boolean(data.value) });
      case 'centerTitle':
        return this.service.bulkUpdate(data.ids, { centerContent: Boolean(data.value) });
      case 'hideTitle':
        return this.service.bulkUpdate(data.ids, { hideTitle: Boolean(data.value) });
      case 'hideProductTitles':
        return this.service.bulkUpdate(data.ids, { hideProductTitles: Boolean(data.value) });
      case 'delete':
        return this.service.bulkDelete(data.ids);
      default:
        return { error: `Unknown action: ${data.action}` };
    }
  }
}