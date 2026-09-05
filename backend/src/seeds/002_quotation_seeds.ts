import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Clear Atharva tables
  await knex("deal_alerts").del();
  await knex("deal_health_metrics").del();
  await knex("recommendation_history").del();
  await knex("promotions").del();
  await knex("product_recommendation_rules").del();
  await knex("product_pairings").del();
  await knex("pipeline_records").del();
  await knex("quotation_revisions").del();
  await knex("quotation_lines").del();
  await knex("quotations").del();
  await knex("deal_stages").del();

  // 1. Deal Stages
  const stages = [
    { name: "Draft", display_order: 1, is_active: true },
    { name: "Under Review", display_order: 2, is_active: true },
    { name: "Approved", display_order: 3, is_active: true },
    { name: "Customer Negotiation", display_order: 4, is_active: true },
    { name: "Confirmed", display_order: 5, is_active: true },
    { name: "Lost", display_order: 6, is_active: true },
  ];
  const insertedStages = await knex("deal_stages").insert(stages).returning("*");
  const stageMap = new Map(insertedStages.map((s: any) => [s.name, s.id]));

  // Get existing products and users
  const products = await knex("products").select("*");
  const users = await knex("users").select("*");
  const customers = await knex("customers").select("*");

  const serverProduct = products.find((p: any) => p.sku === "HW-PE-R750");
  const switchProduct = products.find((p: any) => p.sku === "HW-OS-100G");
  const saasProduct = products.find((p: any) => p.sku === "SW-DF360-ENT");
  const sprintProduct = products.find((p: any) => p.sku === "PS-ARCH-SPRINT");

  const salesRep = users.find((u: any) => u.email === "neeraj.rep@dealflow360.com") || users[0];
  const customer = customers[0];

  // 2. Product Pairings (Historical co-purchase affinity for Upsell & Cross-sell)
  if (serverProduct && switchProduct) {
    await knex("product_pairings").insert([
      {
        base_product_id: serverProduct.id,
        paired_product_id: switchProduct.id,
        co_purchase_count: 42,
        affinity_score: 0.92,
      },
    ]);
  }

  if (saasProduct && sprintProduct) {
    await knex("product_pairings").insert([
      {
        base_product_id: saasProduct.id,
        paired_product_id: sprintProduct.id,
        co_purchase_count: 28,
        affinity_score: 0.85,
      },
    ]);
  }

  // 3. Promotions (Rule 13: +20% bonus ranking weight)
  if (switchProduct) {
    await knex("promotions").insert([
      {
        name: "Q1 Data Center Switch Accelerator",
        product_id: switchProduct.id,
        discount_bonus_percent: 5.0,
        rank_bonus_multiplier: 1.20,
        is_active: true,
      },
    ]);
  }

  // 4. Sample Quotation (Low-Risk / Healthy)
  if (customer && salesRep && serverProduct) {
    const [quote1] = await knex("quotations")
      .insert({
        quote_number: "QT-2026-0001",
        customer_id: customer.id,
        sales_rep_id: salesRep.id,
        current_stage_id: stageMap.get("Draft")!,
        total_amount: 13000.0,
        margin_percent: 35.38,
        blended_risk_score: 0.0,
        approval_status: "DRAFT",
        current_version: 1,
      })
      .returning("*");

    await knex("quotation_lines").insert([
      {
        quotation_id: quote1.id,
        product_id: serverProduct.id,
        quantity: 2,
        unit_price: 6500.0,
        unit_cost: 4200.0,
        discount_percent: 0.0,
        line_total: 13000.0,
        calculated_margin_percent: 35.38,
        is_upsell: false,
      },
    ]);

    await knex("pipeline_records").insert({
      quotation_id: quote1.id,
      stage_id: stageMap.get("Draft")!,
    });

    await knex("deal_health_metrics").insert({
      quotation_id: quote1.id,
      sales_rep_id: salesRep.id,
      days_in_current_stage: 3,
      days_since_last_activity: 1,
      rep_90day_avg_discount: 7.5,
      current_discount_delta: 0,
      health_status: "HEALTHY",
    });
  }

  // 5. Sample Quotation (Stalled / High-Risk Anomaly)
  if (customers[1] && salesRep && serverProduct) {
    const [quote2] = await knex("quotations")
      .insert({
        quote_number: "QT-2026-0002",
        customer_id: customers[1].id,
        sales_rep_id: salesRep.id,
        current_stage_id: stageMap.get("Under Review")!,
        total_amount: 21125.0,
        margin_percent: 20.47,
        blended_risk_score: 72.0,
        approval_status: "UNDER_REVIEW",
        current_version: 1,
      })
      .returning("*");

    await knex("quotation_lines").insert([
      {
        quotation_id: quote2.id,
        product_id: serverProduct.id,
        quantity: 5,
        unit_price: 6500.0,
        unit_cost: 4200.0,
        discount_percent: 35.0, // Major violation
        line_total: 21125.0,
        calculated_margin_percent: 20.47,
        is_upsell: false,
      },
    ]);

    await knex("pipeline_records").insert({
      quotation_id: quote2.id,
      stage_id: stageMap.get("Under Review")!,
      days_in_stage: 18,
    });

    await knex("deal_health_metrics").insert({
      quotation_id: quote2.id,
      sales_rep_id: salesRep.id,
      days_in_current_stage: 18,
      days_since_last_activity: 18,
      rep_90day_avg_discount: 8.0,
      current_discount_delta: 27.0,
      health_status: "STALLED",
    });

    await knex("deal_alerts").insert({
      quotation_id: quote2.id,
      alert_type: "STALLED_DEAL",
      severity: "HIGH",
      message: "Quotation QT-2026-0002 has been inactive for 18 days in Under Review.",
      status: "OPEN",
    });
  }

  console.log("Atharva quotation & deal intelligence seed data created successfully!");
}
