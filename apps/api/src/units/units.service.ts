import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UnitOrderItem } from './dto/update-order.dto';

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.unit.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { userUnits: true } },
      },
    });
  }

  async findEnabled(userId?: string) {
    const units = await this.prisma.unit.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        userUnits: userId ? { where: { userId } } : false,
      },
    });

    if (!userId) {
      return units;
    }

    return units.filter((unit) => {
      if (unit.userUnits.length === 0) {
        return true;
      }
      return unit.userUnits.some((uu) => uu.userId === userId);
    });
  }

  async findOne(id: string) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: {
        userUnits: {
          include: {
            user: { select: { id: true, email: true, name: true } },
          },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException('单元不存在');
    }

    return unit;
  }

  async create(dto: CreateUnitDto) {
    const existing = await this.prisma.unit.findUnique({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException('该 slug 已存在');
    }

    return this.prisma.unit.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        icon: dto.icon,
        route: dto.route,
        enabled: dto.enabled ?? true,
        sortOrder: dto.sortOrder ?? 0,
        points: dto.points ?? [],
        cta: dto.cta,
        eyebrow: dto.eyebrow,
      },
    });
  }

  async update(id: string, dto: UpdateUnitDto) {
    const unit = await this.prisma.unit.findUnique({ where: { id } });
    if (!unit) {
      throw new NotFoundException('单元不存在');
    }

    if (dto.slug && dto.slug !== unit.slug) {
      const existing = await this.prisma.unit.findUnique({ where: { slug: dto.slug } });
      if (existing) {
        throw new ConflictException('该 slug 已存在');
      }
    }

    return this.prisma.unit.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.route !== undefined && { route: dto.route }),
        ...(dto.enabled !== undefined && { enabled: dto.enabled }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.points !== undefined && { points: dto.points }),
        ...(dto.cta !== undefined && { cta: dto.cta }),
        ...(dto.eyebrow !== undefined && { eyebrow: dto.eyebrow }),
      },
    });
  }

  async toggle(id: string) {
    const unit = await this.prisma.unit.findUnique({ where: { id } });
    if (!unit) {
      throw new NotFoundException('单元不存在');
    }

    return this.prisma.unit.update({
      where: { id },
      data: { enabled: !unit.enabled },
    });
  }

  async remove(id: string) {
    const unit = await this.prisma.unit.findUnique({ where: { id } });
    if (!unit) {
      throw new NotFoundException('单元不存在');
    }

    return this.prisma.unit.delete({ where: { id } });
  }

  async updateOrder(items: UnitOrderItem[]) {
    const updates = items.map((item) =>
      this.prisma.unit.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    );

    return this.prisma.$transaction(updates);
  }

  async getAccessUsers(unitId: string) {
    const unit = await this.prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        userUnits: {
          include: {
            user: { select: { id: true, email: true, name: true } },
          },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException('单元不存在');
    }

    return unit.userUnits.map((uu) => ({
      ...uu.user,
      grantedAt: uu.grantedAt,
    }));
  }

  async grantAccess(unitId: string, userId: string) {
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) {
      throw new NotFoundException('单元不存在');
    }

    const existing = await this.prisma.userUnit.findUnique({
      where: { userId_unitId: { userId, unitId } },
    });

    if (existing) {
      throw new ConflictException('该用户已有此单元的访问权限');
    }

    return this.prisma.userUnit.create({
      data: { userId, unitId },
    });
  }

  async revokeAccess(unitId: string, userId: string) {
    const existing = await this.prisma.userUnit.findUnique({
      where: { userId_unitId: { userId, unitId } },
    });

    if (!existing) {
      throw new NotFoundException('该用户无此单元的访问权限');
    }

    return this.prisma.userUnit.delete({
      where: { userId_unitId: { userId, unitId } },
    });
  }
}
