import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StatusEquipamento, TipoEquipamento, TipoServico } from '../generated/prisma/enums.js';
import { CreateAtendimentoDto } from './dto/create-atendimento.dto.js';

const EQUIPAMENTOS_EXIGIDOS: Record<TipoServico, TipoEquipamento[]> = {
  INSTALACAO: ['ONU', 'ROTEADOR'],
  ALTERACAO_ENDERECO: ['ONU', 'ROTEADOR'],
  TROCA_ROTEADOR: ['ROTEADOR'],
  TROCA_ONU: ['ONU'],
};

const ROTULO: Record<TipoEquipamento, string> = {
  ONU: 'ONU',
  ROTEADOR: 'roteador',
};

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
    const { clienteId, tipoServico } = dadosAtendimento;

    return this.prisma.$transaction(async (tx) => {
      // 1) descobrir o tipo (ONU ou roteador) de cada equipamento do pedido
      const idsDoPedido = movimentacoes.map((mov) => mov.equipamentoId);
      const equipamentosDoPedido = await tx.equipamento.findMany({
        where: { id: { in: idsDoPedido } },
      });
      const tipoPorId = new Map<string, TipoEquipamento>(
        equipamentosDoPedido.map((eq): [string, TipoEquipamento] => [eq.id, eq.tipo]),
      );

      for (const mov of movimentacoes) {
        if (!tipoPorId.has(mov.equipamentoId)) {
          throw new BadRequestException('Equipamento não encontrado');
        }
      }

      // 2) conferir o checklist do tipo de serviço, antes de gravar qualquer coisa
      const tiposInstalados = new Set(
        movimentacoes
          .filter((mov) => mov.acao === 'INSTALADO')
          .map((mov) => tipoPorId.get(mov.equipamentoId)),
      );
      const faltando = EQUIPAMENTOS_EXIGIDOS[tipoServico].filter(
        (tipo) => !tiposInstalados.has(tipo),
      );

      if (faltando.length > 0) {
        throw new BadRequestException(
          `Este tipo de serviço exige instalar: ${faltando.map((tipo) => ROTULO[tipo]).join(' e ')}`,
        );
      }

      // 3) agora sim, grava
      const atendimento = await tx.atendimento.create({ data: dadosAtendimento });

      for (const mov of movimentacoes) {
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
      orderBy: { data: 'desc' },
      include: {
        cliente: { select: { codigo: true, nome: true } },
        tecnico: { select: { nome: true, sobrenome: true } },
        movimentacoes: { orderBy: { data: 'asc' }, include: { equipamento: true } },
      },
    });
  }

   findByClienteCodigo(codigo: string) {
    return this.prisma.atendimento.findMany({
      where: { cliente: { codigo } },
      orderBy: { data: 'desc' },
      include: {
        cliente: true,
        tecnico: { select: { nome: true, sobrenome: true } },
        movimentacoes: { orderBy: { data: 'asc' }, include: { equipamento: true } },
      },
    });
  }
}