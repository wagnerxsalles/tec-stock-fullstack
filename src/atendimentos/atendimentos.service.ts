import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StatusEquipamento } from '../generated/prisma/enums.js';
import { CreateAtendimentoDto } from './dto/create-atendimento.dto.js';

function validarDestino(status: StatusEquipamento | undefined): StatusEquipamento {
  if (status !== 'EM_ESTOQUE' && status !== 'COM_DEFEITO') {
    throw new BadRequestException(
      'Informe o destino (EM_ESTOQUE ou COM_DEFEITO) ao remover um equipamento',
    );
  }
  return status;
}

@Injectable()
export class AtendimentosService {
  constructor(private prisma: PrismaService) {}

  async create(createAtendimentoDto: CreateAtendimentoDto) {
    const { movimentacoes, ...dadosAtendimento } = createAtendimentoDto;
    const { clienteId } = dadosAtendimento;

    return this.prisma.$transaction(async (tx) => {
      const atendimento = await tx.atendimento.create({ data: dadosAtendimento });

      for (const mov of movimentacoes ?? []) {
        const equipamento = await tx.equipamento.findUnique({
          where: { id: mov.equipamentoId },
        });

        if (!equipamento) {
          throw new BadRequestException('Equipamento não encontrado');
        }

        if (mov.acao === 'INSTALADO') {
          if (equipamento.status !== 'EM_ESTOQUE') {
            throw new BadRequestException(
              `O equipamento ${equipamento.identificador} não está em estoque`,
            );
          }

          // a vaga do cliente para esse tipo está ocupada? Libera primeiro.
          const ocupante = await tx.equipamento.findFirst({
            where: { clienteAtualId: clienteId, tipo: equipamento.tipo },
          });

          if (ocupante) {
            const destino = validarDestino(mov.statusDoSubstituido ?? 'EM_ESTOQUE');

            await tx.equipamento.update({
              where: { id: ocupante.id },
              data: { status: destino, clienteAtualId: null },
            });
            await tx.movimentacaoEquipamento.create({
              data: {
                atendimentoId: atendimento.id,
                equipamentoId: ocupante.id,
                acao: 'REMOVIDO',
                statusNoMomento: destino,
              },
            });
          }

          // depois ocupa a vaga com o equipamento novo
          await tx.equipamento.update({
            where: { id: equipamento.id },
            data: { status: 'INSTALADO', clienteAtualId: clienteId },
          });
          await tx.movimentacaoEquipamento.create({
            data: {
              atendimentoId: atendimento.id,
              equipamentoId: equipamento.id,
              acao: 'INSTALADO',
              statusNoMomento: 'INSTALADO',
            },
          });
        } else {
          if (equipamento.clienteAtualId !== clienteId) {
            throw new BadRequestException(
              `O equipamento ${equipamento.identificador} não está instalado neste cliente`,
            );
          }

          const destino = validarDestino(mov.novoStatus);

          await tx.equipamento.update({
            where: { id: equipamento.id },
            data: { status: destino, clienteAtualId: null },
          });
          await tx.movimentacaoEquipamento.create({
            data: {
              atendimentoId: atendimento.id,
              equipamentoId: equipamento.id,
              acao: 'REMOVIDO',
              statusNoMomento: destino,
            },
          });
        }
      }

      return tx.atendimento.findUnique({
        where: { id: atendimento.id },
        include: {
          cliente: true,
          movimentacoes: { orderBy: { data: 'asc' }, include: { equipamento: true } },
        },
      });
    }, { timeout: 15000 });
  }

  findAll() {
    return this.prisma.atendimento.findMany({
      include: {
        movimentacoes: { orderBy: { data: 'asc' }, include: { equipamento: true } },
      },
    });
  }

  findByClienteCodigo(codigo: string) {
    return this.prisma.atendimento.findMany({
      where: { cliente: { codigo } },
      include: {
        cliente: true,
        movimentacoes: { orderBy: { data: 'asc' }, include: { equipamento: true } },
      },
      orderBy: { data: 'desc' },
    });
  }
}