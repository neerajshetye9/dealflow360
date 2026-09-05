import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("quotations", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("quote_number").notNullable().unique();
    table.uuid("customer_id").notNullable().references("id").inTable("customers").onDelete("RESTRICT");
    table.uuid("sales_rep_id").notNullable().references("id").inTable("users").onDelete("RESTRICT");
    table.uuid("price_list_id").nullable().references("id").inTable("price_lists").onDelete("SET NULL");
    table.uuid("current_stage_id").notNullable().references("id").inTable("deal_stages").onDelete("RESTRICT");
    table.decimal("total_amount", 14, 2).notNullable().defaultTo(0.00);
    table.decimal("blended_risk_score", 5, 2).notNullable().defaultTo(0.00);
    table.decimal("margin_percent", 5, 2).notNullable().defaultTo(0.00);
    table.string("approval_status").notNullable().defaultTo("DRAFT"); // DRAFT, UNDER_REVIEW, APPROVED, REJECTED
    table.integer("current_version").notNullable().defaultTo(1);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("quotations");
}
