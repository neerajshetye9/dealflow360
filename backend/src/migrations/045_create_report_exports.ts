import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("report_exports", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("report_type").notNullable(); // SALES_SUMMARY, INVENTORY_VALUATION, REVENUE_RECOGNITION
    table.string("format").notNullable(); // PDF or XLSX
    table.string("file_path").notNullable();
    table.uuid("generated_by").nullable().references("id").inTable("users").onDelete("SET NULL");
    table.jsonb("filters").nullable().defaultTo("{}");
    table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("report_exports");
}
