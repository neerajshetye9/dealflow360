import { db } from "../config/database";
import path from "path";

async function run() {
  try {
    console.log("Running migrations...");
    const [batchNo, log] = await db.migrate.latest({
      directory: path.resolve(__dirname, "../migrations"),
      extension: "ts",
      loadExtensions: [".ts", ".js"],
    });

    if (log.length === 0) {
      console.log("Database is already up to date.");
    } else {
      console.log(`Batch ${batchNo} ran ${log.length} migrations:`);
      log.forEach((file: string) => console.log(` - ${file}`));
    }
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

run();
