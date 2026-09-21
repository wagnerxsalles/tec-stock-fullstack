// src/atendimentos/dto/create-atendimento.dto.ts
import { IsEnum, IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoServico } from '../../generated/prisma/enums.js';
import { CreateMovimentacaoDto } from './create-movimentacao.dto.js';

export class CreateAtendimentoDto {
  @IsString()
  @IsNotEmpty()
  clienteId: string;

  @IsString()
  @IsNotEmpty()
  tecnicoId: string;

  @IsEnum(TipoServico)
  tipoServico: TipoServico;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMovimentacaoDto)
  movimentacoes?: CreateMovimentacaoDto[];
}