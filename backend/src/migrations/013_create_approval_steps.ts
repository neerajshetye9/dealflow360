import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("approval_steps", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("chain_id").references("id").inTable("approval_chains").onDelete("CASCADE");
    table.integer("step_order").notNullable();
    table.uuid("required_role_id").references("id").inTable("roles").onDelete("RESTRICT");
    table.string("step_name").notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("approval_steps");
}
