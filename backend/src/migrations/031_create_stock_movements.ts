import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("stock_movements", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("warehouse_id").notNullable().references("id").inTable("warehouses").onDelete("CASCADE");
    table.uuid("product_id").notNullable().references("id").inTable("products").onDelete("CASCADE");
    table.string("movement_type").notNullable(); // INBOUND, RESERVATION, DISPATCH, ADJUSTMENT
    table.integer("quantity").notNullable();
    table.string("reference_id").nullable();
    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("stock_movements");
}
