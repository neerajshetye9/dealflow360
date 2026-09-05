import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("payments", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("invoice_id").notNullable().references("id").inTable("invoices").onDelete("RESTRICT");
    table.string("payment_method").notNullable().defaultTo("BANK_TRANSFER");
    table.string("gateway_reference").notNullable().unique();
    table.decimal("amount", 14, 2).notNullable();
    table.string("status").notNullable().defaultTo("SUCCESS"); // SUCCESS, FAILED, REFUNDED
    table.timestamp("processed_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("payments");
}
