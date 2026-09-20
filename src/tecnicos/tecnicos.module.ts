import { Module } from '@nestjs/common';
import { TecnicosService } from './tecnicos.service.js';
import { TecnicosController } from './tecnicos.controller.js';

@Module({
  controllers: [TecnicosController],
  providers: [TecnicosService],
})
export class TecnicosModule {}
