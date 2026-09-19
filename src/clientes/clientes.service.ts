import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  create(createClienteDto: CreateClienteDto) {
    return this.prisma.cliente.create({
      data: createClienteDto,
    });
  }

  findAll() {
    return this.prisma.cliente.findMany();
  }

  findByCodigo(codigo: string) {
    return this.prisma.cliente.findUnique({
      where: { codigo },
    });
  }

  update(id: string, updateClienteDto: UpdateClienteDto) {
    return this.prisma.cliente.update({
      where: { id },
      data: updateClienteDto,
    });
  }

  remove(id: string) {
    return this.prisma.cliente.delete({
      where: { id },
    });
  }
}
