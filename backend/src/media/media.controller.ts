import {
  Controller, Get, Post, Delete, Param, UseGuards, UseInterceptors,
  UploadedFiles, BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';

@UseGuards(AuthGuard('jwt'))
@Controller('media')
export class MediaController {
  constructor(private readonly service: MediaService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('restaurantId') restaurantId?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se recibió ningún archivo');
    }
    const rid = restaurantId ? Number(restaurantId) : 1;
    return Promise.all(files.map((file) => this.service.upload(rid, file)));
  }

  @Get(':id')
  findById(@Param('id') id: string) { return this.service.findById(Number(id)); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(Number(id)); }
}