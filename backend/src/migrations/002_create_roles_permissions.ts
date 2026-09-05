import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("roles", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("name").notNullable().unique();
    table.string("description").nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("permissions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("code").notNullable().unique();
    table.string("description").nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("role_permissions", (table) => {
    table.uuid("role_id").references("id").inTable("roles").onDelete("CASCADE");
    table.uuid("permission_id").references("id").inTable("permissions").onDelete("CASCADE");
    table.primary(["role_id", "permission_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("role_permissions");
  await knex.schema.dropTableIfExists("permissions");
  await knex.schema.dropTableIfExists("roles");
}
