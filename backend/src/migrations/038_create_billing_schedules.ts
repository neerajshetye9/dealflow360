import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("billing_schedules", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("subscription_id").notNullable().references("id").inTable("active_subscriptions").onDelete("CASCADE");
    table.timestamp("scheduled_date", { useTz: true }).notNullable();
    table.decimal("amount", 12, 2).notNullable();
    table.string("status").notNullable().defaultTo("PENDING"); // PENDING, INVOICED, SKIPPED
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("billing_schedules");
}
