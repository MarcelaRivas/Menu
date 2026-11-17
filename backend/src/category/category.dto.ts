import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

/** Datos aceptados al crear o editar una categoría (la validación global rechaza lo demás). */
export class CategoryDto {
  @IsOptional() @IsInt() menuId?: number;
  @IsOptional() @IsInt() parentId?: number | null;
  @IsOptional() @IsString() @MaxLength(40) name?: string;
  @IsOptional() @IsString() @MaxLength(10000) description?: string;
  @IsOptional() @IsInt() imageMediaId?: number | null;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsIn(['VISIBLE', 'HIDDEN']) visibility?: string;
  @IsOptional() @IsIn(['WITH_IMAGES', 'LIST', 'BANNER']) style?: string;
  @IsOptional() @IsInt() @Min(1) @Max(3) columns?: number;
  @IsOptional() @IsIn(['VERTICAL', 'HORIZONTAL']) navigation?: string;
  @IsOptional() @IsBoolean() centerContent?: boolean;
  @IsOptional() @IsBoolean() hideTitle?: boolean;
  @IsOptional() @IsBoolean() hideProductTitles?: boolean;
  @IsOptional() @IsBoolean() descriptionEllipsis?: boolean;
  @IsOptional() @IsArray() products?: any[];
}
