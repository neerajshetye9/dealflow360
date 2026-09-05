import { Knex } from "knex";
import bcrypt from "bcryptjs";

export async function seed(knex: Knex): Promise<void> {
  // Clear existing in reverse dependency order
  await knex("negotiation_comments").del();
  await knex("negotiation_requests").del();
  await knex("approval_decisions").del();
  await knex("approval_steps").del();
  await knex("approval_chains").del();
  await knex("discount_rules").del();
  await knex("price_list_items").del();
  await knex("price_lists").del();
  await knex("product_variants").del();
  await knex("products").del();
  await knex("product_categories").del();
  await knex("customers").del();
  await knex("customer_tiers").del();
  await knex("user_roles").del();
  await knex("role_permissions").del();
  await knex("permissions").del();
  await knex("roles").del();
  await knex("users").del();

  // 1. Roles
  const roles = [
    { name: "admin", description: "System Administrator" },
    { name: "sales_rep", description: "Sales Operations Representative" },
    { name: "sales_manager", description: "Sales Team Manager / L1 Approver" },
    { name: "finance_director", description: "Finance Director / L2 Approver" },
    { name: "warehouse_manager", description: "Fulfillment & Warehouse Manager" },
    { name: "customer", description: "External Customer for Negotiation Portal" },
  ];
  const insertedRoles = await knex("roles").insert(roles).returning("*");
  const roleMap = new Map(insertedRoles.map((r: any) => [r.name, r.id]));

  // 2. Users (Password: Password@123)
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("Password@123", salt);

  const users = [
    { email: "admin@dealflow360.com", password_hash: passwordHash, full_name: "Admin User", is_active: true },
    { email: "neeraj.rep@dealflow360.com", password_hash: passwordHash, full_name: "Neeraj Shetye (Sales Rep)", is_active: true },
    { email: "atharva.mgr@dealflow360.com", password_hash: passwordHash, full_name: "Atharva Shirke (Sales Manager)", is_active: true },
    { email: "vignesh.fin@dealflow360.com", password_hash: passwordHash, full_name: "Vignesh Shetty (Finance Director)", is_active: true },
  ];
  const insertedUsers = await knex("users").insert(users).returning("*");
  const userMap = new Map(insertedUsers.map((u: any) => [u.email, u.id]));

  // User Roles
  await knex("user_roles").insert([
    { user_id: userMap.get("admin@dealflow360.com")!, role_id: roleMap.get("admin")! },
    { user_id: userMap.get("neeraj.rep@dealflow360.com")!, role_id: roleMap.get("sales_rep")! },
    { user_id: userMap.get("atharva.mgr@dealflow360.com")!, role_id: roleMap.get("sales_manager")! },
    { user_id: userMap.get("vignesh.fin@dealflow360.com")!, role_id: roleMap.get("finance_director")! },
  ]);

  // 3. Customer Tiers
  const tiers = [
    { name: "Platinum", discount_ceiling_percent: 20.0, description: "Enterprise tier with up to 20% discount ceiling" },
    { name: "Gold", discount_ceiling_percent: 15.0, description: "Mid-market tier with up to 15% discount ceiling" },
    { name: "Silver", discount_ceiling_percent: 10.0, description: "Growth tier with up to 10% discount ceiling" },
    { name: "Standard", discount_ceiling_percent: 5.0, description: "Standard commercial tier with up to 5% ceiling" },
  ];
  const insertedTiers = await knex("customer_tiers").insert(tiers).returning("*");
  const tierMap = new Map(insertedTiers.map((t: any) => [t.name, t.id]));

  // 4. Customers
  const customers = [
    {
      name: "Arthur Pendelton",
      company_name: "Acme Global Enterprises",
      email: "procurement@acmeglobal.com",
      tier_id: tierMap.get("Platinum")!,
      credit_rating: "AAA",
      credit_limit: 500000.0,
    },
    {
      name: "Sarah Chen",
      company_name: "Nexus Dynamics",
      email: "contact@nexusdynamics.io",
      tier_id: tierMap.get("Gold")!,
      credit_rating: "AA",
      credit_limit: 250000.0,
    },
    {
      name: "Marcus Aurelius",
      company_name: "Starlight Retail Ltd",
      email: "orders@starlightretail.com",
      tier_id: tierMap.get("Silver")!,
      credit_rating: "A",
      credit_limit: 100000.0,
    },
    {
      name: "Elena Rostova",
      company_name: "Apex Logistics Corp",
      email: "purchasing@apexlogistics.com",
      tier_id: tierMap.get("Standard")!,
      credit_rating: "BBB",
      credit_limit: 50000.0,
    },
  ];
  await knex("customers").insert(customers);

  // 5. Product Categories
  const categories = [
    {
      name: "Hardware Infrastructure",
      code: "HW_INFRA",
      discount_ceiling_percent: 15.0,
      description: "Physical enterprise servers, storage, and networking units",
    },
    {
      name: "SaaS Software Licenses",
      code: "SAAS_LIC",
      discount_ceiling_percent: 30.0,
      description: "Cloud-native annual/monthly subscription licenses",
    },
    {
      name: "Professional Services",
      code: "PROF_SVC",
      discount_ceiling_percent: 10.0,
      description: "Architectural design, deployment, implementation and custom integration hours",
    },
  ];
  const insertedCategories = await knex("product_categories").insert(categories).returning("*");
  const categoryMap = new Map(insertedCategories.map((c: any) => [c.code, c.id]));

  // 6. Products
  const products = [
    {
      name: "PowerEdge R750 Rack Server",
      sku: "HW-PE-R750",
      category_id: categoryMap.get("HW_INFRA")!,
      product_type: "ONE_TIME",
      base_price: 6500.0,
      unit_cost: 4200.0,
      description: "Enterprise 2U dual-socket server optimized for performance and acceleration",
      is_active: true,
    },
    {
      name: "OptiSwitch 100GbE Managed Switch",
      sku: "HW-OS-100G",
      category_id: categoryMap.get("HW_INFRA")!,
      product_type: "ONE_TIME",
      base_price: 3800.0,
      unit_cost: 2300.0,
      description: "High-density 32-port 100GbE data center switch",
      is_active: true,
    },
    {
      name: "DealFlow360 Enterprise SaaS Seat",
      sku: "SW-DF360-ENT",
      category_id: categoryMap.get("SAAS_LIC")!,
      product_type: "SUBSCRIPTION",
      base_price: 120.0,
      unit_cost: 25.0,
      description: "Per-user monthly subscription for DealFlow360 Intelligent Revenue Suite",
      is_active: true,
    },
    {
      name: "Enterprise Architecture Deployment Sprint",
      sku: "PS-ARCH-SPRINT",
      category_id: categoryMap.get("PROF_SVC")!,
      product_type: "ONE_TIME",
      base_price: 15000.0,
      unit_cost: 9500.0,
      description: "Two-week dedicated architectural review and CI/CD pipeline integration",
      is_active: true,
    },
  ];
  const insertedProducts = await knex("products").insert(products).returning("*");
  const productMap = new Map(insertedProducts.map((p: any) => [p.sku, p.id]));

  // 7. Product Variants
  await knex("product_variants").insert([
    {
      product_id: productMap.get("HW-PE-R750")!,
      variant_name: "PowerEdge R750 - 64GB RAM / 2TB NVMe",
      sku: "HW-PE-R750-64G",
      price_adjustment: 0.0,
      attributes: JSON.stringify({ ram: "64GB", storage: "2TB NVMe" }),
      is_active: true,
    },
    {
      product_id: productMap.get("HW-PE-R750")!,
      variant_name: "PowerEdge R750 - 128GB RAM / 4TB NVMe",
      sku: "HW-PE-R750-128G",
      price_adjustment: 1800.0,
      attributes: JSON.stringify({ ram: "128GB", storage: "4TB NVMe" }),
      is_active: true,
    },
  ]);

  // 8. Price Lists
  const [priceList] = await knex("price_lists")
    .insert({
      name: "Global Commercial Master Price List 2026",
      currency: "USD",
      is_active: true,
    })
    .returning("*");

  await knex("price_list_items").insert([
    {
      price_list_id: priceList.id,
      product_id: productMap.get("HW-PE-R750")!,
      custom_price: 6500.0,
    },
    {
      price_list_id: priceList.id,
      product_id: productMap.get("HW-OS-100G")!,
      custom_price: 3800.0,
    },
    {
      price_list_id: priceList.id,
      product_id: productMap.get("SW-DF360-ENT")!,
      custom_price: 120.0,
    },
    {
      price_list_id: priceList.id,
      product_id: productMap.get("PS-ARCH-SPRINT")!,
      custom_price: 15000.0,
    },
  ]);

  // 9. Approval Chains Configuration (Rules 6 & 7)
  const chains = [
    {
      name: "Low Risk Chain (< 30)",
      min_risk_score: 0.0,
      max_risk_score: 29.99,
      route_type: "AUTO_APPROVED",
      is_active: true,
    },
    {
      name: "Medium Risk Chain (30 - 69)",
      min_risk_score: 30.0,
      max_risk_score: 69.99,
      route_type: "SALES_MANAGER",
      is_active: true,
    },
    {
      name: "High Risk Chain (>= 70)",
      min_risk_score: 70.0,
      max_risk_score: 100.0,
      route_type: "SEQUENTIAL_TWO_LEVEL",
      is_active: true,
    },
  ];
  const insertedChains = await knex("approval_chains").insert(chains).returning("*");
  const chainMap = new Map(insertedChains.map((c: any) => [c.route_type, c.id]));

  // Steps
  await knex("approval_steps").insert([
    {
      chain_id: chainMap.get("SALES_MANAGER")!,
      step_order: 1,
      required_role_id: roleMap.get("sales_manager")!,
      step_name: "Sales Manager Review",
    },
    {
      chain_id: chainMap.get("SEQUENTIAL_TWO_LEVEL")!,
      step_order: 1,
      required_role_id: roleMap.get("sales_manager")!,
      step_name: "Level 1: Sales Manager Review",
    },
    {
      chain_id: chainMap.get("SEQUENTIAL_TWO_LEVEL")!,
      step_order: 2,
      required_role_id: roleMap.get("finance_director")!,
      step_name: "Level 2: Finance Director High-Risk Authorization",
    },
  ]);

  console.log("Database seeded successfully with core Neeraj catalog, governance rules, and test users!");
}
