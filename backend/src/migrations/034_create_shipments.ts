import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("shipments", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("fulfillment_order_id").notNullable().references("id").inTable("fulfillment_orders").onDelete("CASCADE");
    table.uuid("warehouse_id").notNullable().references("id").inTable("warehouses").onDelete("RESTRICT");
    table.string("carrier").notNullable();
    table.string("tracking_number").notNullable().unique();
    table.string("status").notNullable().defaultTo("DISPATCHED"); // DISPATCHED, IN_TRANSIT, DELIVERED
    table.timestamp("dispatched_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("estimated_delivery", { useTz: true }).nullable();
    table.timestamp("delivered_at", { useTz: true }).nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("shipments");
}
