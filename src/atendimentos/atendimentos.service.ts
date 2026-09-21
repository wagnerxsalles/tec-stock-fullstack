// src/atendimentos/atendimentos.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAtendimentoDto } from './dto/create-atendimento.dto.js';

@Injectable()
export class AtendimentosService {
  constructor(private prisma: PrismaService) {}

  async create(createAtendimentoDto: CreateAtendimentoDto) {
    const { movimentacoes, ...dadosAtendimento } = createAtendimentoDto;

   const movimentacoesComStatus: Prisma.MovimentacaoEquipamentoUncheckedCreateWithoutAtendimentoInput[] =
  (movimentacoes ?? []).map((mov) => {
    const statusNoMomento = mov.acao === 'INSTALADO' ? 'INSTALADO' : mov.novoStatus;

    if (mov.acao === 'REMOVIDO' && !statusNoMomento) {
      throw new BadRequestException(
        'Informe o novoStatus (EM_ESTOQUE ou COM_DEFEITO) ao remover um equipamento',
      );
    }

    return {
      equipamentoId: mov.equipamentoId,
      acao: mov.acao,
      statusNoMomento: statusNoMomento!,
    };
  });

    return this.prisma.$transaction(async (tx) => {
      const atendimentoCriado = await tx.atendimento.create({
        data: {
          ...dadosAtendimento,
          movimentacoes: {
            create: movimentacoesComStatus,
          },
        },
      });

      for (const mov of movimentacoesComStatus) {
        await tx.equipamento.update({
          where: { id: mov.equipamentoId },
          data: { status: mov.statusNoMomento },
        });
      }

      return tx.atendimento.findUnique({
        where: { id: atendimentoCriado.id },
        include: {
          movimentacoes: { include: { equipamento: true } },
        },
      });
    });
  }

  findAll() {
    return this.prisma.atendimento.findMany({
      include: { movimentacoes: { include: { equipamento: true } } },
    });
  }

  findByClienteCodigo(codigo: string) {
    return this.prisma.atendimento.findMany({
      where: { cliente: { codigo } },
      include: { cliente: true, movimentacoes: { include: { equipamento: true } } },
      orderBy: { data: 'desc' },
    });
  }
}