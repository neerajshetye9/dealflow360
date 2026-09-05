import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("product_variants", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("product_id").references("id").inTable("products").onDelete("CASCADE");
    table.string("variant_name").notNullable();
    table.string("sku").notNullable().unique();
    table.decimal("price_adjustment", 14, 2).notNullable().defaultTo(0.00);
    table.jsonb("attributes").nullable().defaultTo("{}");
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("product_variants");
}
