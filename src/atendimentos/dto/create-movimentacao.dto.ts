
import { IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { AcaoMovimentacao, StatusEquipamento } from '../../generated/prisma/enums.js';

export class CreateMovimentacaoDto {
  @IsString()
  @IsNotEmpty()
  equipamentoId: string;

  @IsEnum(AcaoMovimentacao)
  acao: AcaoMovimentacao;

  @IsOptional()
  @IsEnum(StatusEquipamento)
  novoStatus?: StatusEquipamento;

  @IsOptional()
  @IsEnum(StatusEquipamento)
  statusDoSubstituido?: StatusEquipamento;
}