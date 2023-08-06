import { PrismaClient } from "@prisma/client";
import { Client, Events, GatewayIntentBits } from "discord.js";

import { ExtendedClient } from "./interfaces/ExtendedClient";
import { getDatabaseRecord } from "./utils/getDatabaseRecord";
import { logHandler } from "./utils/logHandler";

(async () => {
  const bot = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
    ],
  }) as ExtendedClient;
  bot.db = new PrismaClient();
  await bot.db.$connect();

  bot.on(Events.ClientReady, () => {
    logHandler.info("Bot ready.");
  });

  bot.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) {
      return;
    }

    if (
      message.author.id === "465650873650118659" &&
      message.content === "~prune"
    ) {
      const records = await bot.db.users.findMany();
      const guildMembers = await message.guild.members.fetch();
      let count = 0;
      for (const user of guildMembers.values()) {
        const record = records.find((r) => r.userId === user.id);
        if (!record) {
          await getDatabaseRecord(bot, user.id);
          continue;
        }
        // check if user.timestamp is older than 30 days
        if (record.timestamp < new Date(Date.now() - 2592000000)) {
          await user
            .kick("Failed activity requirement.")
            .catch(() => logHandler.error(`Failed to kick ${user.id}`));
          await bot.db.users.delete({
            where: {
              userId: user.id,
            },
          });
          count++;
        }
      }
      await message.reply(`Kicked ${count} inactive users.`);
      return;
    }

    await getDatabaseRecord(bot, message.author.id);
  });

  await bot.login(process.env.TOKEN);
})();
