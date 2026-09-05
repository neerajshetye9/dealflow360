import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const environmentSchema = z.object({
  PORT: z.string().default("4000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 chars"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 chars"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("60m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CUSTOMER_PORTAL_TOKEN_EXPIRES_HOURS: z.string().default("72"),
  FRONTEND_ORIGIN: z.string().default("http://localhost:5173"),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  console.error("Invalid environment configuration:");
  console.error(parsedEnvironment.error.format());
  process.exit(1);
}

export const env = parsedEnvironment.data;
