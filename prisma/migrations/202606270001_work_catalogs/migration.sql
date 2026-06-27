CREATE TABLE "work_catalogs" (
  "id" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "unit" TEXT NOT NULL,
  "unit_price" DECIMAL(14,2) NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "work_catalogs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "work_catalogs_active_idx" ON "work_catalogs"("active");
