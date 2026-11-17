-- Configuración de anuncios por tipo y fechas de vigencia (columnas nuevas, opcionales).
ALTER TABLE "ad" ADD COLUMN "config" JSONB,
ADD COLUMN "starts_at" TIMESTAMP(3),
ADD COLUMN "ends_at" TIMESTAMP(3);
