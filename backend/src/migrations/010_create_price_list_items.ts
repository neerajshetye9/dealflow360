import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("price_list_items", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("price_list_id").references("id").inTable("price_lists").onDelete("CASCADE");
    table.uuid("product_id").references("id").inTable("products").onDelete("CASCADE");
    table.uuid("variant_id").nullable().references("id").inTable("product_variants").onDelete("SET NULL");
    table.decimal("custom_price", 14, 2).notNullable();
    table.timestamps(true, true);
    table.unique(["price_list_id", "product_id", "variant_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("price_list_items");
}
