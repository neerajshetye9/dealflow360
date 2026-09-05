import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("deal_alerts", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("quotation_id").notNullable().references("id").inTable("quotations").onDelete("CASCADE");
    table.string("alert_type").notNullable(); // STALLED_DEAL, DISCOUNT_ANOMALY, DELIVERY_SLIPPAGE
    table.string("severity").notNullable().defaultTo("MEDIUM"); // LOW, MEDIUM, HIGH
    table.text("message").notNullable();
    table.string("status").notNullable().defaultTo("OPEN"); // OPEN, RESOLVED, NUDGE_SENT
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("deal_alerts");
}
