<h1 align="center">Red Planet Staffing</h1>
<img src="./assets/red-planet.webp" alt="Red Planet Staffing" >

Welcome to the red planet! At just over one million people as of the 2050 census, Martian settlements are flourishing. As the leading staffing marketplace on Mars, Red Planet connects workplaces with workers to fill shifts.

### Business context

Our primary customers are Martian workplaces. While they have full-time staff, they occasionally need short-term flexible staff to fill gaps in their operations (for example, when a worker is sick or on a vacation to the Moon).

When they need a worker, workplaces post a "shift" on our marketplace. Workers on our marketplace then claim these shifts and are assigned to them. Once assigned, workers perform the work at the shift's start time until it's end time, and are paid based on the hours worked.

## Getting started

This microservice uses technologies that have stood the test of time.

- [TypeScript](https://www.typescriptlang.org/)
- [NestJS](https://docs.nestjs.com/)
- [Prisma](https://www.prisma.io/docs/concepts/components/prisma-client)

### Local development commands

```bash
# Install dependencies
npm install

# Create and migrate the database, and then apply seed data located at `./prisma/seed`
npx prisma migrate dev --name init

# Drop and re-seed the database
npx prisma migrate reset

# Start the server in watch mode with hot-reloading
npm run start:dev
```

## Submission

Submit your solution by creating a pull request (PR) on this repository. Please **do not** merge your PR. Instead, return to your Hatchways assessment page to confirm your submission.

## API

### Workers

- `POST /workers`: Create a worker.
  - Body: [`createWorkerSchema`](./src/modules/workers/workers.schemas.ts).
- `GET /workers/:id`: Get a worker by ID.
  - Path parameters:
    - `:id`: Worker ID.
- `GET /workers`: Get workers.
  - Query parameters:
    - `page` (optional): Page number.
- `GET /workers/claims`: Get worker claims.
  - Query parameters:
    - `:workerId`: Worker ID.
    - `page` (optional): Page number.

### Workplaces

- `POST /workplaces`: Create a workplace.
  - Body: [`createWorkplaceSchema`](./src/modules/workplaces/workplaces.schemas.ts).
- `GET /workplaces/:id`: Get a workplace by ID.
  - Path parameters:
    - `:id`: Workplace ID.
- `GET /workplaces`: Get workplaces.
  - Query parameters:
    - `page` (optional): Page number.

### Shifts

- `POST /shifts`: Create a shift.
  - Body: [`createShiftSchema`](./src/modules/shifts/shifts.schemas.ts).
- `GET /shifts/:id`: Get a shift by ID.
  - Path parameters:
    - `:id`: Shift ID.
- `POST /shifts/:id/claim`: Claim a shift.
  - Path parameters:
    - `:id`: Shift ID.
  - Body:
    - `workerId`: Worker ID.
- `POST /shifts/:id/cancel`: Cancel a claimed shift.
  - Path parameters:
    - `:id`: Shift ID.
- `GET /shifts`: Get shifts.
  - Query parameters:
    - `page` (optional): Page number.
