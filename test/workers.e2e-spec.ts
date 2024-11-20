import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";

import { AppModule } from "../src/app.module";
import { WorkerDTO } from "../src/modules/workers/workers.schemas";
import { WorkerStatus } from "../src/modules/workers/workers.schemas";

const RESOURCE: WorkerDTO = {
  id: 1,
  name: "Dmitri David",
  status: WorkerStatus.ACTIVE,
};

describe("Workers", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("POST /workers invalid type", async () => {
    const actual = await request(app.getHttpServer())
      .post("/workers")
      .send({ name: 1 })
      .set("Accept", "application/json");

    expect(JSON.parse(actual.text)).toEqual({
      error: "Bad Request",
      message: "Expected string, received number: 'name'",
      statusCode: 400,
    });
  });

  it("POST /workers invalid field", async () => {
    const actual = await request(app.getHttpServer())
      .post("/workers")
      .send({ invalid: 1 })
      .set("Accept", "application/json");

    expect(JSON.parse(actual.text)).toEqual({
      error: "Bad Request",
      message: "Required: 'name'",
      statusCode: 400,
    });
  });

  it("GET /workers", async () => {
    const actual = await request(app.getHttpServer()).get("/workers");

    expect(actual.status).toBe(200);
    const data = actual.body.data;
    expect(data.length).toBe(10);
  });

  it("GET /workers/:id", async () => {
    const actual = await request(app.getHttpServer()).get("/workers/1");

    expect(actual.status).toBe(200);
    expect(actual.body.data).toEqual(RESOURCE);
  });

  it("GET /workers/:id invalid type", async () => {
    const actual = await request(app.getHttpServer()).get("/workers/invalid");

    expect(JSON.parse(actual.text)).toEqual({
      error: "Bad Request",
      message: "Validation failed (numeric string is expected)",
      statusCode: 400,
    });
  });

  it("GET /workers/:id not found", async () => {
    const actual = await request(app.getHttpServer()).get("/workers/0");

    expect(JSON.parse(actual.text)).toEqual({
      message: "Internal server error",
      statusCode: 500,
    });
  });
});
