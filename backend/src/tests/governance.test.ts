import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { DiscountGovernanceService } from "../services/DiscountGovernanceService";
import { AuthService } from "../services/AuthService";
import { db } from "../config/database";

describe("Neeraj's Domain — Core Governance & Auth Tests", () => {
  afterAll(async () => {
    await db.destroy();
  });

  it("Rule 1: should login successfully with seeded sales rep credentials", async () => {
    const result = await AuthService.loginWithEmailAndPassword("neeraj.rep@dealflow360.com", "Password@123");
    expect(result).toBeDefined();
    expect(result.accessToken).toBeDefined();
    expect(result.user.email).toBe("neeraj.rep@dealflow360.com");
    expect(result.user.role).toBe("sales_rep");
  });

  it("Rule 4 & 5: should compute effective discount ceiling taking the strictest between customer tier and category ceiling", async () => {
    // Platinum tier (20% ceiling), Hardware category (15% ceiling)
    const platinum = await db("customer_tiers").where({ name: "Platinum" }).first();
    const hardware = await db("product_categories").where({ code: "HW_INFRA" }).first();

    const effectiveCeiling = await DiscountGovernanceService.computeEffectiveDiscountCeiling(platinum.id, hardware.id);
    // Strictest ceiling must be 15% (Hardware cap)
    expect(effectiveCeiling).toBe(15.0);
  });

  it("Rule 6: should evaluate zero risk when requested discounts are within ceiling", async () => {
    const customer = await db("customers").first();
    const hardware = await db("product_categories").where({ code: "HW_INFRA" }).first();
    const product = await db("products").where({ category_id: hardware.id }).first();

    const lines = [
      {
        productId: product.id,
        categoryId: hardware.id,
        quantity: 2,
        unitPrice: 5000,
        unitCost: 3000,
        requestedDiscountPercent: 10, // Under 15% ceiling
      },
    ];

    const result = await DiscountGovernanceService.computeBlendedRiskScore(customer.id, lines);
    expect(result.blendedRiskScore).toBe(0);
    expect(result.riskLabel).toBe("LOW");
    expect(result.approvalRoute).toBe("AUTO_APPROVED");
    expect(result.violations.length).toBe(0);
  });

  it("Rule 6 & 7: should flag violation and route to Sales Manager or Sequential Two Level when discount exceeds ceiling", async () => {
    const customer = await db("customers").first();
    const hardware = await db("product_categories").where({ code: "HW_INFRA" }).first();
    const product = await db("products").where({ category_id: hardware.id }).first();

    const highDiscountLines = [
      {
        productId: product.id,
        categoryId: hardware.id,
        quantity: 5,
        unitPrice: 6500,
        unitCost: 4200,
        requestedDiscountPercent: 35, // 20% over 15% ceiling!
      },
    ];

    const result = await DiscountGovernanceService.computeBlendedRiskScore(customer.id, highDiscountLines);
    expect(result.blendedRiskScore).toBeGreaterThanOrEqual(30);
    expect(result.violations.length).toBe(1);
    expect(result.violations[0].overByPoints).toBe(20);
    expect(["SALES_MANAGER", "SEQUENTIAL_TWO_LEVEL"]).toContain(result.approvalRoute);
  });
});
