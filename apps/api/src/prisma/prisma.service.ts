import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      if (process.env.REQUIRE_DATABASE === "true") {
        throw error;
      }

      const message = error instanceof Error ? error.message : "unknown error";
      console.warn(`Prisma database is unavailable; continuing with mock APIs. ${message}`);
    }
  }

}
