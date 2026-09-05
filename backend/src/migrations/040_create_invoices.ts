import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("invoices", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("invoice_number").notNullable().unique();
    table.uuid("customer_id").notNullable().references("id").inTable("customers").onDelete("RESTRICT");
    table.uuid("quotation_id").nullable().references("id").inTable("quotations").onDelete("SET NULL");
    table.uuid("subscription_id").nullable().references("id").inTable("active_subscriptions").onDelete("SET NULL");
    table.string("invoice_type").notNullable().defaultTo("ONE_TIME"); // ONE_TIME, SUBSCRIPTION, HYBRID
    table.string("status").notNullable().defaultTo("DRAFT"); // DRAFT, ISSUED, PAID, OVERDUE, VOID, CREDITED
    table.decimal("subtotal", 14, 2).notNullable().defaultTo(0.00);
    table.decimal("tax_amount", 14, 2).notNullable().defaultTo(0.00);
    table.decimal("total_amount", 14, 2).notNullable().defaultTo(0.00);
    table.timestamp("due_date", { useTz: true }).notNullable();
    table.timestamp("issued_at", { useTz: true }).nullable();
    table.timestamp("paid_at", { useTz: true }).nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("invoices");
}
