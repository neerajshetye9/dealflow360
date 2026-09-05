import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("backorders", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("fulfillment_order_id").notNullable().references("id").inTable("fulfillment_orders").onDelete("CASCADE");
    table.uuid("product_id").notNullable().references("id").inTable("products").onDelete("RESTRICT");
    table.integer("pending_quantity").notNullable();
    table.timestamp("expected_arrival_date", { useTz: true }).nullable();
    table.string("status").notNullable().defaultTo("BACKORDER"); // BACKORDER, ARRIVED, ALLOCATED
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("backorders");
}
