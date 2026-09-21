/*
  Warnings:

  - Added the required column `statusNoMomento` to the `MovimentacaoEquipamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MovimentacaoEquipamento" ADD COLUMN     "statusNoMomento" "StatusEquipamento" NOT NULL;
