import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from "@nestjs/common";
import { Workplace } from "@prisma/client";
import { Request } from "express";

import { nextLink, omitShard, PaginationPage } from "../shared/pagination";
import {
  type Page,
  PaginatedResponse,
  type Response,
} from "../shared/shared.types";
import { type CreateWorkplace } from "./workplaces.schemas";
import { WorkplaceDTO } from "./workplaces.schemas";
import { WorkplacesService } from "./workplaces.service";

@Controller("workplaces")
export class WorkplacesController {
  constructor(private readonly service: WorkplacesService) {}

  @Post()
  async create(@Body() data: CreateWorkplace): Promise<Response<Workplace>> {
    return { data: await this.service.create(data) };
  }

  @Get("/:id")
  async getById(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<Response<WorkplaceDTO>> {
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
  ): Promise<PaginatedResponse<WorkplaceDTO>> {
    const { data, nextPage } = await this.service.get({ page });

    return {
      data: data.map(omitShard),
      links: { next: nextLink({ nextPage, request }) },
    };
  }
}
