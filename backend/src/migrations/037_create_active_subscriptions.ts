import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("active_subscriptions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("customer_id").notNullable().references("id").inTable("customers").onDelete("RESTRICT");
    table.uuid("plan_id").notNullable().references("id").inTable("subscription_plans").onDelete("RESTRICT");
    table.string("status").notNullable().defaultTo("ACTIVE"); // ACTIVE, PAUSED, CANCELLED
    table.timestamp("starts_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("current_period_start", { useTz: true }).notNullable();
    table.timestamp("current_period_end", { useTz: true }).notNullable();
    table.timestamp("next_billing_date", { useTz: true }).notNullable();
    table.integer("seat_count").notNullable().defaultTo(1);
    table.decimal("unit_price", 12, 2).notNullable();
    table.boolean("is_cancelled").notNullable().defaultTo(false);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("active_subscriptions");
}
