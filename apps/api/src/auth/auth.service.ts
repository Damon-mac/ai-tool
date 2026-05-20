import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = this.normalizeEmail(dto.email);
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('该邮箱已注册');
    }

    const passwordHash = await hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name: dto.name,
      },
    });

    return this.buildAuthResponse(user.id, user.email, user.name, user.role);
  }

  async login(dto: LoginDto) {
    const email = this.normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    let passwordMatched = false;
    try {
      passwordMatched = await compare(dto.password, user.passwordHash);
    } catch {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    if (!passwordMatched) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    return this.buildAuthResponse(user.id, user.email, user.name, user.role);
  }

  async profile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return user;
  }

  private buildAuthResponse(id: string, email: string, name?: string | null, role?: string) {
    const token = this.jwtService.sign({ sub: id, email, name, role });
    return {
      token,
      user: {
        id,
        email,
        name: name ?? null,
        role: role ?? 'user',
      },
    };
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }
}
