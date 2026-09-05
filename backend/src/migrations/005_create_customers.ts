import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("customers", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("name").notNullable();
    table.string("company_name").notNullable();
    table.string("email").notNullable().unique();
    table.uuid("tier_id").references("id").inTable("customer_tiers").onDelete("RESTRICT");
    table.string("credit_rating").nullable().defaultTo("AAA");
    table.decimal("credit_limit", 14, 2).nullable().defaultTo(100000.00);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("customers");
}
