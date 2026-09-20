import { PartialType } from '@nestjs/mapped-types';
import { CreateTecnicoDto } from './create-tecnico.dto.js';

export class UpdateTecnicoDto extends PartialType(CreateTecnicoDto) {}
