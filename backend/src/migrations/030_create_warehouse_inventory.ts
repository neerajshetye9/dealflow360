import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("warehouse_inventory", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("warehouse_id").notNullable().references("id").inTable("warehouses").onDelete("CASCADE");
    table.uuid("product_id").notNullable().references("id").inTable("products").onDelete("CASCADE");
    table.integer("quantity_available").notNullable().defaultTo(0);
    table.integer("quantity_reserved").notNullable().defaultTo(0);
    table.integer("quantity_backordered").notNullable().defaultTo(0);
    table.timestamps(true, true);
    table.unique(["warehouse_id", "product_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("warehouse_inventory");
}
