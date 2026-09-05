import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("product_recommendation_rules", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("source_category_id").notNullable().references("id").inTable("product_categories").onDelete("CASCADE");
    table.uuid("target_product_id").notNullable().references("id").inTable("products").onDelete("CASCADE");
    table.string("rule_type").notNullable().defaultTo("UPSELL"); // UPSELL or CROSS_SELL
    table.decimal("priority_boost", 5, 2).notNullable().defaultTo(1.00);
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("product_recommendation_rules");
}
