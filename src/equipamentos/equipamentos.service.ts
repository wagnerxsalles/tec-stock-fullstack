import { Injectable } from '@nestjs/common';
import { CreateEquipamentoDto } from './dto/create-equipamento.dto.js';
import { UpdateEquipamentoDto } from './dto/update-equipamento.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class EquipamentosService {
  constructor(private prisma: PrismaService) {}

  create(createEquipamentoDto: CreateEquipamentoDto) {
    return this.prisma.equipamento.create({
      data: createEquipamentoDto,
    });
  }

  findAll() {
    return this.prisma.equipamento.findMany();
  }

  findByIdentificador(identificador: string) {
    return this.prisma.equipamento.findMany({
      where: { identificador },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  update(id: string, updateEquipamentoDto: UpdateEquipamentoDto) {
    return this.prisma.equipamento.update({
      where: { id },
      data:  updateEquipamentoDto,
    });
  }

  remove(id: string) {
    return this.prisma.equipamento.delete({
      where: { id },
    });
  }
}
