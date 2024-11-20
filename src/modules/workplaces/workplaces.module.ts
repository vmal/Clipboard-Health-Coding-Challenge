import { Module } from "@nestjs/common";

import { WorkplacesController } from "./workplaces.controller";
import { WorkplacesService } from "./workplaces.service";

@Module({
  controllers: [WorkplacesController],
  providers: [WorkplacesService],
})
export class WorkplacesModule {}
