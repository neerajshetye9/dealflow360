import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("quotation_lines", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("quotation_id").notNullable().references("id").inTable("quotations").onDelete("CASCADE");
    table.uuid("product_id").notNullable().references("id").inTable("products").onDelete("RESTRICT");
    table.uuid("variant_id").nullable().references("id").inTable("product_variants").onDelete("SET NULL");
    table.integer("quantity").notNullable().defaultTo(1);
    table.decimal("unit_price", 14, 2).notNullable();
    table.decimal("unit_cost", 14, 2).notNullable();
    table.decimal("discount_percent", 5, 2).notNullable().defaultTo(0.00);
    table.decimal("line_total", 14, 2).notNullable();
    table.decimal("calculated_margin_percent", 5, 2).notNullable();
    table.boolean("is_upsell").notNullable().defaultTo(false);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("quotation_lines");
}
