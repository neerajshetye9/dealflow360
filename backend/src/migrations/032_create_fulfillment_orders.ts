import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("fulfillment_orders", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("quotation_id").notNullable().references("id").inTable("quotations").onDelete("CASCADE");
    table.string("status").notNullable().defaultTo("PENDING"); // PENDING, ALLOCATED, PARTIALLY_FULFILLED, SHIPPED, DELIVERED
    table.decimal("total_shipping_cost", 10, 2).notNullable().defaultTo(0.00);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("fulfillment_orders");
}
