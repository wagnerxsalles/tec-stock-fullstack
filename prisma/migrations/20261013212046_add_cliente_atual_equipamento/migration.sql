/*
  Warnings:

  - A unique constraint covering the columns `[clienteAtualId,tipo]` on the table `Equipamento` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Equipamento" ADD COLUMN     "clienteAtualId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Equipamento_clienteAtualId_tipo_key" ON "Equipamento"("clienteAtualId", "tipo");

-- AddForeignKey
ALTER TABLE "Equipamento" ADD CONSTRAINT "Equipamento_clienteAtualId_fkey" FOREIGN KEY ("clienteAtualId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
