import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

/** Datos aceptados al crear o editar un anuncio. La configuración por tipo se valida en el servicio. */
export class AdDto {
  @IsOptional() @IsInt() @Min(1) restaurantId?: number;
  @IsOptional() @IsString() @MaxLength(80) name?: string | null;
  @IsOptional() @IsIn(['STORY', 'LINK', 'SUBSCRIBE', 'PRODUCT']) type?: string;
  @IsOptional() @IsInt() @Min(1) mediaId?: number | null;
  @IsOptional() @IsString() @MaxLength(500) videoUrl?: string | null;
  @IsOptional() @IsString() @MaxLength(1000) text?: string | null;
  @IsOptional() config?: Record<string, unknown> | null;
  @IsOptional() @IsString() startsAt?: string | null;
  @IsOptional() @IsString() endsAt?: string | null;
  @IsOptional() @IsBoolean() active?: boolean;
}
