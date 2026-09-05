import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("approval_decisions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("quotation_id").notNullable();
    table.uuid("step_id").nullable().references("id").inTable("approval_steps").onDelete("SET NULL");
    table.uuid("approver_id").nullable().references("id").inTable("users").onDelete("SET NULL");
    table.string("status").notNullable().defaultTo("PENDING");
    table.text("decision_reason").nullable();
    table.string("reason_code").nullable();
    table.timestamp("decided_at", { useTz: true }).nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("approval_decisions");
}
