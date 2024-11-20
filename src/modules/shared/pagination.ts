import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

import { MAX_SHARDS } from "./constants";
import { Page } from "./shared.types";

interface CountableCollection {
  count(parameters: {
    skip: number;
    take: number;
    where: { shard: number };
  }): Promise<number>;
}

const FIRST_PAGE = 1;
const PAGE_SIZE = 10;
const PAGE_QUERY_PARAM = "page";
const SHARD_QUERY_PARAM = "shard";
const DEFAULT_SHARD = 0;

function parseOptionalInt(value?: string): number | undefined {
  return value ? parseInt(value, 10) : undefined;
}

function urlWithoutQueryParameters(request: Request): string {
  const protocolAndHost = `${request.protocol}://${request.get("Host")}`;
  const pathname = new URL(`${protocolAndHost}${request.originalUrl}`).pathname;
  return `${protocolAndHost}${pathname}`;
}

export function getPage(pageNum?: number, shard?: number): Page {
  return { num: pageNum ? pageNum : FIRST_PAGE, size: PAGE_SIZE, shard };
}

export function nextLink(parameters: {
  nextPage?: Page;
  request: Request;
}): string | undefined {
  const { nextPage, request } = parameters;
  return nextPage
      ? `${urlWithoutQueryParameters(request)}?${PAGE_QUERY_PARAM}=${nextPage.num}${nextPage.shard !== undefined ? `&${SHARD_QUERY_PARAM}=${nextPage.shard}` : ""}`
      : undefined;
}

export function queryParameters(parameters: { page: Page }): {
  skip: number;
  take: number;
  where: { shard: number };
} {
  const { page } = parameters;
  return {
    take: page.size,
    skip: (page.num - 1) * page.size,
    where: { shard: page.shard ?? DEFAULT_SHARD },
  };
}

async function countOnPage(
    page: Page,
    collection: CountableCollection,
): Promise<number> {
  return collection.count(queryParameters({ page }));
}

export async function getNextPage(parameters: {
  currentPage: Page;
  collection: CountableCollection;
}): Promise<Page | undefined> {
  const { currentPage, collection } = parameters;
  const nextPageNum = currentPage.num + 1;
  const nextPageInShard = getPage(nextPageNum, currentPage.shard);

  const countRemainingInShard = await countOnPage(nextPageInShard, collection);

  if (countRemainingInShard > 0) {
    return nextPageInShard;
  }

  const nextShard = (currentPage.shard ?? DEFAULT_SHARD) + 1;

  if (nextShard > MAX_SHARDS) {
    return undefined;
  }

  const pageInNextShard = getPage(FIRST_PAGE, nextShard);

  const countInNextShard = await countOnPage(pageInNextShard, collection);

  if (countInNextShard > 0) {
    return pageInNextShard;
  }

  return undefined;
}

export function omitShard<T extends { shard: number }>(
    obj: T,
): Omit<T, "shard"> {
  const { shard: _, ...rest } = obj;
  return rest;
}

// NestJS Decorator
export const PaginationPage = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      const page = parseOptionalInt(request.query[PAGE_QUERY_PARAM]);
      const shard = parseOptionalInt(request.query[SHARD_QUERY_PARAM]);

      return getPage(page, shard);
    },
);
