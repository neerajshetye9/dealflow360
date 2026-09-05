import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("deal_health_metrics", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("quotation_id").notNullable().references("id").inTable("quotations").onDelete("CASCADE").unique();
    table.uuid("sales_rep_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.integer("days_in_current_stage").notNullable().defaultTo(0);
    table.integer("days_since_last_activity").notNullable().defaultTo(0);
    table.decimal("rep_90day_avg_discount", 5, 2).notNullable().defaultTo(8.00);
    table.decimal("current_discount_delta", 5, 2).notNullable().defaultTo(0.00);
    table.string("health_status").notNullable().defaultTo("HEALTHY"); // HEALTHY, STALLED, ANOMALY, SLIPPAGE
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("deal_health_metrics");
}
