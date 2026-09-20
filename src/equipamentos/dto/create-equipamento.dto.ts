import { IsEnum, IsString, IsNotEmpty } from "class-validator";
import { TipoEquipamento } from "../../generated/prisma/enums.js";

export class CreateEquipamentoDto {
  @IsEnum(TipoEquipamento)
  tipo: TipoEquipamento;

  @IsString()
  @IsNotEmpty()
  identificador: string;

  @IsString()
  @IsNotEmpty()
  tecnicoId: string;
}