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

      async findAlertasEstoqueParado() {
    const equipamentosEmEstoque = await this.prisma.equipamento.findMany({
      where: { status: 'EM_ESTOQUE' },
    });

    const agora = new Date();

    return equipamentosEmEstoque
      .map((equipamento) => {
        const diasEmEstoque = Math.floor(
          (agora.getTime() - equipamento.dataRecebimento.getTime()) / (24 * 60 * 60 * 1000),
        );
        return { ...equipamento, diasEmEstoque };
      })
      .filter((equipamento) => equipamento.diasEmEstoque >= 30);
  }
}
