// src/tecnicos/dto/create-tecnico.dto.ts
import { IsString, IsNotEmpty, IsEmail, Matches, MinLength } from 'class-validator';

export class CreateTecnicoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  sobrenome: string;

  @Matches(/^\d{11}$/, { message: 'CPF deve conter exatamente 11 dígitos numéricos' })
  cpf: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;
}