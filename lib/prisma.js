import { PrismaClient } from "@prisma/client";


export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

// globalThis.prisma: this global variable ensure that the Prisma Client instance is resused across hot reloads during development .
// without this, reach time your application reloads , a new instance of the Prisma Client would be created ,
//  which could lead to exhausting your database connections.
