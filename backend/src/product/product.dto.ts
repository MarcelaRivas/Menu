import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

/**
 * Datos aceptados al crear o editar un producto. La validación global (whitelist)
 * rechaza cualquier campo que no esté aquí. Las listas anidadas (precios, modificadores,
 * imágenes) se normalizan en el servicio.
 */
export class ProductDto {
  @IsOptional() @IsInt() categoryId?: number;
  @IsOptional() @IsString() @MaxLength(30) code?: string | null;
  @IsOptional() @IsString() @MaxLength(40) name?: string;
  @IsOptional() @IsString() @MaxLength(10000) description?: string;
  @IsOptional() @IsIn(['SINGLE', 'COMBO']) type?: string;
  @IsOptional() @IsIn(['VISIBLE', 'HIDDEN']) visibility?: string;
  @IsOptional() @IsBoolean() hidePrices?: boolean;
  @IsOptional() @IsBoolean() recommended?: boolean;
  @IsOptional() @IsBoolean() isNew?: boolean;
  @IsOptional() @IsBoolean() soldOut?: boolean;
  @IsOptional() @IsBoolean() timePerUnit?: boolean;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100000) preparationTime?: number | null;
  @IsOptional() @IsString() @MaxLength(60) productType1?: string | null;
  @IsOptional() @IsString() @MaxLength(60) productType2?: string | null;
  @IsOptional() @IsString() @MaxLength(60) productType3?: string | null;
  @IsOptional() @IsString() @MaxLength(60) productType4?: string | null;
  @IsOptional() @IsString() @MaxLength(500) link?: string | null;
  @IsOptional() @IsArray() prices?: any[];
  @IsOptional() @IsArray() priceRanges?: any[];
  @IsOptional() @IsArray() modifiers?: any[];
  @IsOptional() @IsArray() productMedia?: any[];
  @IsOptional() @IsArray() tagIds?: number[];
}
