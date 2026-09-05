import { db } from "../config/database";
import path from "path";

async function run() {
  try {
    console.log("Running seeds...");
    const [log] = await db.seed.run({
      directory: path.resolve(__dirname, "../seeds"),
      extension: "ts",
      loadExtensions: [".ts", ".js"],
    });

    console.log(`Ran ${log.length} seed files:`);
    log.forEach((file: string) => console.log(` - ${file}`));
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

run();
