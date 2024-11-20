import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { Prisma, Shift } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { getNextPage, queryParameters } from "../shared/pagination";
import { Page, PaginatedData } from "../shared/shared.types";
import { CreateShift } from "./shifts.schemas";

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateShift): Promise<Shift> {
    return await this.prisma.shift.create({
      data: data as Prisma.ShiftUncheckedCreateInput,
    });
  }

  async getById(id: number): Promise<Shift | null> {
    return await this.prisma.shift.findUnique({ where: { id } });
  }

  async get(parameters: { page: Page }): Promise<PaginatedData<Shift>> {
    const { page } = parameters;

    const shifts = await this.prisma.shift.findMany({
      ...queryParameters({ page }),
      orderBy: { id: "asc" },
    });

    const nextPage = await getNextPage({
      currentPage: page,
      collection: this.prisma.shift,
    });

    return { data: shifts, nextPage };
  }

  async claim(id: number, workerId: number): Promise<Shift> {
    // Ensure the shift is unclaimed
    const shift = await this.prisma.shift.findUnique({ where: { id } });
    if (!shift) {
      throw new NotFoundException(`Shift ID ${id} not found.`);
    }
    if (shift.workerId) {
      throw new BadRequestException(`Shift ID ${id} is already claimed.`);
    }

    return await this.prisma.shift.update({
      where: { id },
      data: { workerId, cancelledAt: null },
    });
  }

  async cancel(id: number): Promise<Shift> {
    // Ensure the shift is claimed
    const shift = await this.prisma.shift.findUnique({ where: { id } });
    if (!shift) {
      throw new NotFoundException(`Shift ID ${id} not found.`);
    }
    if (!shift.workerId) {
      throw new BadRequestException(`Shift ID ${id} is not claimed.`);
    }

    return await this.prisma.shift.update({
      where: { id },
      data: {
        cancelledAt: new Date(),
        workerId: null,
      },
    });
  }
}
