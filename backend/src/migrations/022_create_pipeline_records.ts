import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("pipeline_records", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("quotation_id").notNullable().references("id").inTable("quotations").onDelete("CASCADE");
    table.uuid("stage_id").notNullable().references("id").inTable("deal_stages").onDelete("RESTRICT");
    table.timestamp("entered_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("exited_at", { useTz: true }).nullable();
    table.integer("days_in_stage").nullable().defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("pipeline_records");
}
