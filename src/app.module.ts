import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ClientesModule } from './clientes/clientes.module.js';
import { TecnicosModule } from './tecnicos/tecnicos.module.js';

@Module({
  imports: [PrismaModule, ClientesModule, TecnicosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
