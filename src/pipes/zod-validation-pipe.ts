import { BadRequestException, PipeTransform } from "@nestjs/common";
import { ZodSchema } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (result.success) {
      return result.data;
    }

    const issue = result.error.issues[0];
    throw new BadRequestException(
      issue
        ? `${issue.message}: '${issue.path.join(".")}'`
        : "Validation failed",
    );
  }
}
