import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ClientesModule } from './clientes/clientes.module.js';
import { EquipamentosModule } from './equipamentos/equipamentos.module.js';

@Module({
  imports: [PrismaModule, ClientesModule, EquipamentosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
