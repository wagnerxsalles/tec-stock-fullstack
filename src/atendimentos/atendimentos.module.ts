import { Module } from '@nestjs/common';
import { AtendimentosService } from './atendimentos.service.js';
import { AtendimentosController } from './atendimentos.controller.js';

@Module({
  controllers: [AtendimentosController],
  providers: [AtendimentosService],
})
export class AtendimentosModule {}
