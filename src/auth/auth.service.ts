// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, senha: string) {
    const tecnico = await this.prisma.tecnico.findUnique({
      where: { email },
    });

    if (!tecnico) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const senhaValida = await bcrypt.compare(senha, tecnico.senha);

    if (!senhaValida) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const payload = { sub: tecnico.id, email: tecnico.email, papel: tecnico.papel };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}