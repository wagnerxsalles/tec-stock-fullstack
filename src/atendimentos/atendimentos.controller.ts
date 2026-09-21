// src/atendimentos/atendimentos.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AtendimentosService } from './atendimentos.service.js';
import { CreateAtendimentoDto } from './dto/create-atendimento.dto.js';

@Controller('atendimentos')
export class AtendimentosController {
  constructor(private readonly atendimentosService: AtendimentosService) {}

  @Post()
  create(@Body() createAtendimentoDto: CreateAtendimentoDto) {
    return this.atendimentosService.create(createAtendimentoDto);
  }

  @Get()
  findAll() {
    return this.atendimentosService.findAll();
  }

  @Get('cliente/:codigo')
  findByClienteCodigo(@Param('codigo') codigo: string) {
    return this.atendimentosService.findByClienteCodigo(codigo);
  }
}''