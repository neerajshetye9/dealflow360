import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("discount_rules", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("tier_id").nullable().references("id").inTable("customer_tiers").onDelete("CASCADE");
    table.uuid("category_id").nullable().references("id").inTable("product_categories").onDelete("CASCADE");
    table.decimal("max_discount_percent", 5, 2).notNullable();
    table.decimal("min_margin_percent", 5, 2).notNullable().defaultTo(20.00);
    table.decimal("requires_approval_above", 5, 2).notNullable().defaultTo(15.00);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("discount_rules");
}
