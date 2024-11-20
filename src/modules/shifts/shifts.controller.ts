import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
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
import {
  type CreateShift,
  createShiftSchema,
  ShiftDTO,
} from "./shifts.schemas";
import { ShiftsService } from "./shifts.service";

@Controller("shifts")
export class ShiftsController {
  constructor(private readonly service: ShiftsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createShiftSchema))
  async create(@Body() data: CreateShift): Promise<Response<ShiftDTO>> {
    return { data: omitShard(await this.service.create(data)) };
  }

  @Get("/:id")
  async getById(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<Response<ShiftDTO>> {
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
  ): Promise<PaginatedResponse<ShiftDTO>> {
    const { data, nextPage } = await this.service.get({ page });

    return {
      data: data.map(omitShard),
      links: { next: nextLink({ nextPage, request }) },
    };
  }

  @Post("/:id/claim")
  async claim(
    @Param("id", ParseIntPipe) id: number,
    @Body("workerId", ParseIntPipe) workerId: number,
  ): Promise<Response<ShiftDTO>> {
    return { data: omitShard(await this.service.claim(id, workerId)) };
  }

  @Post("/:id/cancel")
  async cancel(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<Response<ShiftDTO>> {
    const data = await this.service.getById(id);

    if (!data) {
      throw new Error(`ID ${id} not found.`);
    }

    if (!data.workerId) {
      throw new Error(`Shift ${id} is not claimed.`);
    }

    return { data: omitShard(await this.service.cancel(id)) };
  }
}
