import { Global, Module } from "@nestjs/common";

import { PrismaModule } from "./modules/prisma/prisma.module";
import { ShiftsModule } from "./modules/shifts/shifts.module";
import { WorkersModule } from "./modules/workers/workers.module";
import { WorkplacesModule } from "./modules/workplaces/workplaces.module";

@Global()
@Module({
  imports: [PrismaModule, ShiftsModule, WorkersModule, WorkplacesModule],
})
export class AppModule {}
