import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("price_lists", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("name").notNullable();
    table.string("currency", 3).notNullable().defaultTo("USD");
    table.timestamp("effective_from", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("effective_to", { useTz: true }).nullable();
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("price_lists");
}
