import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("audit_logs", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("actor_id").nullable();
    table.string("actor_ip").nullable();
    table.string("entity_type").notNullable();
    table.string("entity_id").notNullable();
    table.string("action").notNullable();
    table.jsonb("before_state").nullable();
    table.jsonb("after_state").nullable();
    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("audit_logs");
}
