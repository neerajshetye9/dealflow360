import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("negotiation_comments", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("negotiation_request_id").references("id").inTable("negotiation_requests").onDelete("CASCADE");
    table.uuid("quotation_line_id").nullable();
    table.string("author_type").notNullable();
    table.text("comment_text").notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("negotiation_comments");
}
