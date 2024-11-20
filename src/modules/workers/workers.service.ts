import { Injectable } from "@nestjs/common";
import { Shift, type Worker } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { getNextPage, queryParameters } from "../shared/pagination";
import { Page, PaginatedData } from "../shared/shared.types";
import { CreateWorker } from "./workers.schemas";

@Injectable()
export class WorkersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateWorker): Promise<Worker> {
    return await this.prisma.worker.create({ data });
  }

  async getById(id: number): Promise<Worker | null> {
    return await this.prisma.worker.findUnique({ where: { id } });
  }

  async get(parameters: { page: Page }): Promise<PaginatedData<Worker>> {
    const { page } = parameters;

    const workers = await this.prisma.worker.findMany({
      ...queryParameters({ page }),
      orderBy: { id: "asc" },
    });

    const nextPage = await getNextPage({
      currentPage: page,
      collection: this.prisma.worker,
    });

    return { data: workers, nextPage };
  }

  async getClaims(parameters: {
    id: number;
    page: Page;
  }): Promise<PaginatedData<Shift>> {
    const { page } = parameters;

    const { where, ...queryParams } = queryParameters({ page });

    const claims = await this.prisma.shift.findMany({
      ...queryParams,
      where: { ...where, workerId: parameters.id },
      orderBy: { id: "asc" },
    });

    const nextPage = await getNextPage({
      currentPage: page,
      collection: this.prisma.shift,
    });

    return { data: claims, nextPage };
  }
}
