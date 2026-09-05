import { db } from "../config/database";

async function main(): Promise<void> {
  const cols = await db.raw(\`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name='quotations' 
    ORDER BY ordinal_position
  \`);
  console.log("QUOTATIONS columns:", JSON.stringify(cols.rows.map((r: any) => r.column_name), null, 2));
  await db.destroy();
}

main().catch(e => { console.error(e); process.exit(1); });
