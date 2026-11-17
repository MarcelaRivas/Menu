-- Servicios de pedido por carta (columnas nuevas con valor por defecto).
ALTER TABLE "menu" ADD COLUMN "delivery_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "pickup_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "dine_in_enabled" BOOLEAN NOT NULL DEFAULT false;
