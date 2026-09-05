import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("refunds", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("payment_id").notNullable().references("id").inTable("payments").onDelete("RESTRICT");
    table.uuid("invoice_id").notNullable().references("id").inTable("invoices").onDelete("RESTRICT");
    table.decimal("amount", 14, 2).notNullable();
    table.text("reason").notNullable();
    table.uuid("approved_by").nullable().references("id").inTable("users").onDelete("SET NULL");
    table.string("status").notNullable().defaultTo("PROCESSED");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("refunds");
}
