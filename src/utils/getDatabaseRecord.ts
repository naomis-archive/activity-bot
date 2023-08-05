import { ExtendedClient } from "../interfaces/ExtendedClient";

/**
 * I'm too tired to write this shit.
 *
 * @param {ExtendedClient} bot Bot I guess.
 * @param {string} userId The user.
 * @returns {ExtendedClient["db"]["users"]} DB record.
 */
export const getDatabaseRecord = async (
  bot: ExtendedClient,
  userId: string
) => {
  const record = await bot.db.users.upsert({
    where: {
      userId,
    },
    update: {
      timestamp: new Date(),
    },
    create: {
      userId,
      timestamp: new Date(),
    },
  });
  return record;
};
