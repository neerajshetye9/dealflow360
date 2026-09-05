import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("product_pairings", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("base_product_id").notNullable().references("id").inTable("products").onDelete("CASCADE");
    table.uuid("paired_product_id").notNullable().references("id").inTable("products").onDelete("CASCADE");
    table.integer("co_purchase_count").notNullable().defaultTo(1);
    table.decimal("affinity_score", 5, 2).notNullable().defaultTo(0.85);
    table.timestamps(true, true);
    table.unique(["base_product_id", "paired_product_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("product_pairings");
}
