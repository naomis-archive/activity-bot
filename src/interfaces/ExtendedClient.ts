import { PrismaClient } from "@prisma/client";
import { Client } from "discord.js";

export interface ExtendedClient extends Client {
  db: PrismaClient;
}
