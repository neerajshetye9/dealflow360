import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("quotation_revisions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("quotation_id").notNullable().references("id").inTable("quotations").onDelete("CASCADE");
    table.integer("revision_number").notNullable();
    table.jsonb("snapshot_data").notNullable();
    table.text("reason_for_change").nullable();
    table.uuid("created_by").nullable().references("id").inTable("users").onDelete("SET NULL");
    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("quotation_revisions");
}
