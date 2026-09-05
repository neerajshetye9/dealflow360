import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("user_roles", (table) => {
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
    table.uuid("role_id").references("id").inTable("roles").onDelete("CASCADE");
    table.primary(["user_id", "role_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("user_roles");
}
