// src/tecnicos/tecnicos.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TecnicosService } from './tecnicos.service.js';
import { CreateTecnicoDto } from './dto/create-tecnico.dto.js';
import { UpdateTecnicoDto } from './dto/update-tecnico.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('tecnicos')
@UseGuards(JwtAuthGuard)
export class TecnicosController {
  constructor(private readonly tecnicosService: TecnicosService) {}

  @Post()
  create(@Body() createTecnicoDto: CreateTecnicoDto) {
    return this.tecnicosService.create(createTecnicoDto);
  }

  @Get()
  findAll() {
    return this.tecnicosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tecnicosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTecnicoDto: UpdateTecnicoDto) {
    return this.tecnicosService.update(id, updateTecnicoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tecnicosService.remove(id);
  }
}