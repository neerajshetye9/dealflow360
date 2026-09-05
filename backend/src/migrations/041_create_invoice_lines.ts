import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("invoice_lines", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("invoice_id").notNullable().references("id").inTable("invoices").onDelete("CASCADE");
    table.uuid("product_id").notNullable().references("id").inTable("products").onDelete("RESTRICT");
    table.string("line_type").notNullable().defaultTo("ONE_TIME"); // ONE_TIME or SUBSCRIPTION
    table.string("description").notNullable();
    table.integer("quantity").notNullable().defaultTo(1);
    table.decimal("unit_price", 14, 2).notNullable();
    table.decimal("line_total", 14, 2).notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("invoice_lines");
}
