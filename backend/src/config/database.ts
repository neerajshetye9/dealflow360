import knex from "knex";
import { env } from "./environment";
import { logger } from "./logger";

export const db = knex({
  client: "pg",
  connection: {
    connectionString: env.DATABASE_URL,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: 2,
    max: 10,
    afterCreate: (conn: any, done: Function) => {
      conn.query("SET timezone = UTC;", (err: Error) => {
        done(err, conn);
      });
    },
  },
  acquireConnectionTimeout: 10000,
});

export async function verifyDatabaseConnection(): Promise<void> {
  try {
    await db.raw("SELECT 1");
    logger.info("Database connection established successfully");
  } catch (connectionError) {
    logger.error("Failed to connect to database:", connectionError);
    process.exit(1);
  }
}
