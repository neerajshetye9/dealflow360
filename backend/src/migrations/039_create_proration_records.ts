import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("proration_records", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("subscription_id").notNullable().references("id").inTable("active_subscriptions").onDelete("CASCADE");
    table.string("adjustment_type").notNullable(); // TIER_UPGRADE, SEAT_ADDITION, DOWNGRADE
    table.decimal("old_price", 12, 2).notNullable();
    table.decimal("new_price", 12, 2).notNullable();
    table.integer("days_remaining").notNullable();
    table.integer("total_days_in_cycle").notNullable();
    table.decimal("prorated_amount", 12, 2).notNullable();
    table.timestamp("effective_date", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("proration_records");
}
