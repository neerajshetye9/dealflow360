import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("recommendation_history", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("quotation_id").notNullable().references("id").inTable("quotations").onDelete("CASCADE");
    table.uuid("product_id").notNullable().references("id").inTable("products").onDelete("CASCADE");
    table.string("recommendation_type").notNullable(); // UPSELL or CROSS_SELL
    table.decimal("calculated_score", 7, 4).notNullable();
    table.boolean("was_accepted").notNullable().defaultTo(false);
    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("recommendation_history");
}
