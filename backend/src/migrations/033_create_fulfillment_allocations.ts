import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("fulfillment_allocations", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("fulfillment_order_id").notNullable().references("id").inTable("fulfillment_orders").onDelete("CASCADE");
    table.uuid("warehouse_id").notNullable().references("id").inTable("warehouses").onDelete("RESTRICT");
    table.uuid("product_id").notNullable().references("id").inTable("products").onDelete("RESTRICT");
    table.integer("allocated_quantity").notNullable();
    table.boolean("is_manual_override").notNullable().defaultTo(false);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("fulfillment_allocations");
}
