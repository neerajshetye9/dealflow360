import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("negotiation_requests", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("quotation_id").notNullable();
    table.string("portal_token").notNullable().unique();
    table.timestamp("token_expires_at", { useTz: true }).notNullable();
    table.string("status").notNullable().defaultTo("ACTIVE");
    table.decimal("proposed_discount_percent", 5, 2).nullable();
    table.text("customer_notes").nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("negotiation_requests");
}
