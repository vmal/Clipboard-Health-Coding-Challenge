import { Injectable, type OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  /* istanbul ignore next */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
