-- Papelera: fecha de borrado lógico en categorías y productos (columnas nuevas, opcionales).
ALTER TABLE "category" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "product" ADD COLUMN "deleted_at" TIMESTAMP(3);
