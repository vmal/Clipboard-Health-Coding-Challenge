import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UsePipes,
} from "@nestjs/common";
import { Request } from "express";

import { ZodValidationPipe } from "../../pipes/zod-validation-pipe";
import { nextLink, omitShard, PaginationPage } from "../shared/pagination";
import {
  type Page,
  PaginatedResponse,
  type Response,
} from "../shared/shared.types";
import { ShiftDTO } from "../shifts/shifts.schemas";
import {
  type CreateWorker,
  createWorkerSchema,
  WorkerDTO,
} from "./workers.schemas";
import { WorkersService } from "./workers.service";

@Controller("workers")
export class WorkersController {
  constructor(private readonly service: WorkersService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createWorkerSchema))
  async create(@Body() data: CreateWorker): Promise<Response<WorkerDTO>> {
    return { data: await this.service.create(data) };
  }

  @Get("/claims")
  async getClaims(
    @Req() request: Request,
    @Query("workerId", ParseIntPipe) id: number,
    @PaginationPage() page: Page,
  ): Promise<PaginatedResponse<ShiftDTO>> {
    const { data, nextPage } = await this.service.getClaims({ id, page });

    return {
      data: data.map(omitShard),
      links: { next: nextLink({ nextPage, request }) },
    };
  }

  @Get("/:id")
  async getById(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<Response<WorkerDTO>> {
    const data = await this.service.getById(id);
    if (!data) {
      throw new Error(`ID ${id} not found.`);
    }

    return { data: omitShard(data) };
  }

  @Get()
  async get(
    @Req() request: Request,
    @PaginationPage() page: Page,
  ): Promise<PaginatedResponse<WorkerDTO>> {
    const { data, nextPage } = await this.service.get({ page });

    return {
      data: data.map(omitShard),
      links: { next: nextLink({ nextPage, request }) },
    };
  }
}
