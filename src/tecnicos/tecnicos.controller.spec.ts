import { Test, TestingModule } from '@nestjs/testing';
import { TecnicosController } from './tecnicos.controller.js';
import { TecnicosService } from './tecnicos.service.js';

describe('TecnicosController', () => {
  let controller: TecnicosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TecnicosController],
      providers: [TecnicosService],
    }).compile();

    controller = module.get<TecnicosController>(TecnicosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
