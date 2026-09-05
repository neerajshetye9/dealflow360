import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("subscription_plans", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("product_id").notNullable().references("id").inTable("products").onDelete("CASCADE");
    table.string("name").notNullable();
    table.string("billing_cadence").notNullable().defaultTo("MONTHLY"); // MONTHLY, QUARTERLY, ANNUAL
    table.decimal("price", 12, 2).notNullable();
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("subscription_plans");
}
