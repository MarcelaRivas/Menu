import {
  Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BadRequestException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { ProductImportService } from './product-import.service';
import { ProductDto } from './product.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('products')
export class ProductController {
  constructor(
    private readonly service: ProductService,
    private readonly importService: ProductImportService,
  ) {}

  /** Importación masiva desde .xlsx o .csv. Con dryRun=true solo valida y muestra el resultado. */
  @Post('import')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  importProducts(@UploadedFile() file: Express.Multer.File, @Query('dryRun') dryRun?: string) {
    if (!file) throw new BadRequestException('Sube un archivo .xlsx o .csv');
    return this.importService.run(file.buffer, file.originalname, dryRun !== 'false');
  }

  @Get('import/template')
  template() {
    return this.importService.template();
  }

  @Get()
  findAll(@Query('categoryId') categoryId?: string, @Query('trashed') trashed?: string) {
    return this.service.findAll(categoryId ? Number(categoryId) : undefined, trashed === 'true');
  }

  @Get(':id')
  findById(@Param('id') id: string) { return this.service.findById(Number(id)); }

  @Post()
  // La validación de ProductDto (whitelist) corre antes de llegar aquí.
  create(@Body() data: ProductDto, @Req() req: any) { return this.service.create(data as any, req.user?.id); }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: ProductDto, @Req() req: any) {
    return this.service.update(Number(id), data as any, req.user?.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) { return this.service.remove(Number(id), req.user?.id); }

  /** Saca el producto de la papelera. */
  @Post(':id/restore')
  restore(@Param('id') id: string) { return this.service.restore(Number(id)); }

  /** Borrado definitivo: solo si el producto ya está en la papelera. */
  @Delete(':id/permanent')
  permanentRemove(@Param('id') id: string, @Req() req: any) { return this.service.permanentRemove(Number(id), req.user?.id); }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string) { return this.service.duplicate(Number(id)); }

  @Post(':id/move')
  move(@Param('id') id: string, @Body() data: { categoryId: number }) {
    return this.service.moveToCategory(Number(id), data.categoryId);
  }

  @Post(':id/copy')
  copy(@Param('id') id: string, @Body() data: { categoryId: number }) {
    return this.service.copyToCategory(Number(id), data.categoryId);
  }

  @Patch(':id/sold-out')
  setSoldOut(@Param('id') id: string, @Body() data: { soldOut: boolean }) {
    return this.service.setSoldOut(Number(id), data.soldOut);
  }
}