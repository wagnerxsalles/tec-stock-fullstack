// src/tecnicos/tecnicos.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTecnicoDto } from './dto/create-tecnico.dto.js';
import { UpdateTecnicoDto } from './dto/update-tecnico.dto.js';

@Injectable()
export class TecnicosService {
  constructor(private prisma: PrismaService) {}

  async create(createTecnicoDto: CreateTecnicoDto) {
    const senhaHash = await bcrypt.hash(createTecnicoDto.senha, 10);

    return this.prisma.tecnico.create({
      data: {
        ...createTecnicoDto,
        senha: senhaHash,
      },
      omit: { senha: true },
    });
  }

    findOne(id: string) {
    return this.prisma.tecnico.findUnique({
      where: { id },
      omit: { senha: true },
    });
  }

  findAll() {
    return this.prisma.tecnico.findMany({
      omit: { senha: true },
    });
  }

  update(id: string, updateTecnicoDto: UpdateTecnicoDto) {
    return this.prisma.tecnico.update({
      where: { id },
      data: updateTecnicoDto,
      omit: { senha: true },
    });
  }

  remove(id: string) {
    return this.prisma.tecnico.delete({
      where: { id },
      omit: { senha: true },
    });
  }
}