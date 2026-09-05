import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("warehouses", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("code").notNullable().unique();
    table.string("name").notNullable();
    table.string("location").notNullable();
    table.decimal("transit_cost_multiplier", 5, 2).notNullable().defaultTo(1.00);
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("warehouses");
}
