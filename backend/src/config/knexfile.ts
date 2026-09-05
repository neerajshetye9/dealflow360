import type { Knex } from "knex";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const connectionString = process.env.DATABASE_URL || "postgresql://dealflow_user:dealflow_pass@localhost:5432/dealflow360";

const knexConfig: Knex.Config = {
  client: "pg",
  connection: connectionString,
  migrations: {
    directory: path.resolve(__dirname, "../migrations"),
    extension: "ts",
    loadExtensions: [".ts", ".js"],
  },
  seeds: {
    directory: path.resolve(__dirname, "../seeds"),
    extension: "ts",
    loadExtensions: [".ts", ".js"],
  },
};

export default knexConfig;
