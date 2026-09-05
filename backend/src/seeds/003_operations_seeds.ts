import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  const existingWarehouses = await knex("warehouses").select("id");
  if (existingWarehouses.length > 0) {
    console.log("Warehouses already seeded, skipping 003_operations_seeds...");
    return;
  }

  console.log("Seeding Warehouses, Inventory, and Subscription Plans...");

  // 1. Warehouses (Rule 16: Multi-facility split, transit cost factor)
  const [whEast] = await knex("warehouses").insert({
    code: "WH-EAST",
    name: "Primary US-East Logistics Hub",
    location: "Newark, NJ",
    transit_cost_multiplier: 1.00,
    is_active: true,
  }).returning("*");

  const [whWest] = await knex("warehouses").insert({
    code: "WH-WEST",
    name: "Secondary US-West Logistics Center",
    location: "Reno, NV",
    transit_cost_multiplier: 1.30,
    is_active: true,
  }).returning("*");

  // 2. Fetch products to seed inventory and subscription plans
  const products = await knex("products").select("id", "sku", "product_type");
  const srv = products.find(p => p.sku === "HW-SRV-001");
  const sec = products.find(p => p.sku === "SEC-GW-001");
  const subProd = products.find(p => p.product_type === "SUBSCRIPTION") || products[0];

  if (srv && sec) {
    await knex("warehouse_inventory").insert([
      {
        warehouse_id: whEast.id,
        product_id: srv.id,
        quantity_available: 50,
        quantity_reserved: 0,
        quantity_backordered: 0,
      },
      {
        warehouse_id: whWest.id,
        product_id: srv.id,
        quantity_available: 30,
        quantity_reserved: 0,
        quantity_backordered: 0,
      },
      {
        warehouse_id: whEast.id,
        product_id: sec.id,
        quantity_available: 15,
        quantity_reserved: 0,
        quantity_backordered: 0,
      },
      {
        warehouse_id: whWest.id,
        product_id: sec.id,
        quantity_available: 40,
        quantity_reserved: 0,
        quantity_backordered: 0,
      },
    ]);
  }

  // 3. Subscription Plans (Rule 21: Proration, Hybrid Billing)
  if (subProd) {
    await knex("subscription_plans").insert([
      {
        product_id: subProd.id,
        name: "Enterprise Cloud Suite Annual",
        billing_cadence: "ANNUAL",
        price: 12000.00,
        is_active: true,
      },
      {
        product_id: subProd.id,
        name: "Growth Cloud Suite Monthly",
        billing_cadence: "MONTHLY",
        price: 1000.00,
        is_active: true,
      },
    ]);
  }

  console.log("Phase 3 operations seed completed successfully.");
}
