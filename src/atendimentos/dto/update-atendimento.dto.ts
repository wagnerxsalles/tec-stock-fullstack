import { PartialType } from '@nestjs/mapped-types';
import { CreateAtendimentoDto } from './create-atendimento.dto.js';

export class UpdateAtendimentoDto extends PartialType(CreateAtendimentoDto) {}
