import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("promotions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("name").notNullable();
    table.uuid("product_id").notNullable().references("id").inTable("products").onDelete("CASCADE");
    table.decimal("discount_bonus_percent", 5, 2).notNullable().defaultTo(5.00);
    table.decimal("rank_bonus_multiplier", 5, 2).notNullable().defaultTo(1.20); // +20% bonus rank per Rule 13
    table.timestamp("starts_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("ends_at", { useTz: true }).nullable();
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("promotions");
}
