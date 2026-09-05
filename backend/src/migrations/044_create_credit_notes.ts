import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("credit_notes", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("customer_id").notNullable().references("id").inTable("customers").onDelete("RESTRICT");
    table.uuid("original_invoice_id").nullable().references("id").inTable("invoices").onDelete("SET NULL");
    table.decimal("amount", 14, 2).notNullable();
    table.string("reason").notNullable();
    table.string("status").notNullable().defaultTo("ACTIVE"); // ACTIVE, APPLIED
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("credit_notes");
}
