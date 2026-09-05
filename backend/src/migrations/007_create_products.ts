import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("products", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("name").notNullable();
    table.string("sku").notNullable().unique();
    table.uuid("category_id").references("id").inTable("product_categories").onDelete("RESTRICT");
    table.string("product_type").notNullable().defaultTo("ONE_TIME");
    table.decimal("base_price", 14, 2).notNullable();
    table.decimal("unit_cost", 14, 2).notNullable();
    table.text("description").nullable();
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("products");
}
