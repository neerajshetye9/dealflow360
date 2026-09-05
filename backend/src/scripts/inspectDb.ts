import { db } from "../config/database";

async function main(): Promise<void> {
  const products = await db("products").select("sku", "name", "product_type");
  console.log("PRODUCTS:", JSON.stringify(products, null, 2));
  const plans = await db("subscription_plans").select("id", "name", "product_id");
  console.log("PLANS:", JSON.stringify(plans, null, 2));
  await db.destroy();
}

main().catch(e => { console.error(e); process.exit(1); });
