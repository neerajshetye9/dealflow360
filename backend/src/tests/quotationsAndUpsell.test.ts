import { describe, it, expect, afterAll } from "vitest";
import { QuotationService } from "../services/QuotationService";
import { UpsellCrossSellService } from "../services/UpsellCrossSellService";
import { DealHealthMonitorService } from "../services/DealHealthMonitorService";
import { db } from "../config/database";

describe("Atharva's Domain — Quotations, Upsell Engine & Deal Health Tests", () => {
  afterAll(async () => {
    await db.destroy();
  });

  it("Rule 12: should accurately compute dynamic gross margin % for added lines", async () => {
    const customer = await db("customers").first();
    const user = await db("users").where({ email: "neeraj.rep@dealflow360.com" }).first();
    const product = await db("products").where({ sku: "HW-PE-R750" }).first();

    const quote = await QuotationService.createQuotation(user.id, customer.id);
    expect(quote).toBeDefined();

    // Base price = 6500, Unit cost = 4200. With 10% discount:
    // Net price = 5850. Margin = ((5850 - 4200) / 5850) * 100 = 28.21%
    const line = await QuotationService.addLineItem(quote.id, product.id, 2, 10);
    expect(line.calculated_margin_percent).toBeCloseTo(28.21, 1);

    const refreshed = await db("quotations").where({ id: quote.id }).first();
    expect(refreshed.margin_percent).toBeCloseTo(28.21, 1);
  });

  it("Rule 13 & 14: should generate smart upsell suggestions incorporating affinity & promotion boost", async () => {
    const quote = await db("quotations").where({ quote_number: "QT-2026-0001" }).first();
    const suggestions = await UpsellCrossSellService.generateSuggestions(quote.id);

    expect(suggestions.length).toBeGreaterThan(0);
    const switchSuggestion = suggestions.find((s) => s.sku === "HW-OS-100G");
    expect(switchSuggestion).toBeDefined();
    // Verify promotion boost was applied (+20% rank bonus)
    expect(switchSuggestion?.hasActivePromotion).toBe(true);
    expect(switchSuggestion?.promotionBonusMultiplier).toBe(1.2);
  });

  it("Rule 15: should suppress recommendations that dilute overall quote margin below 20%", async () => {
    // A quotation near the 20% margin floor should not receive suggestions that plunge margin < 20%
    const lowMarginQuote = await db("quotations").where({ quote_number: "QT-2026-0002" }).first();
    const suggestions = await UpsellCrossSellService.generateSuggestions(lowMarginQuote.id);

    // Any returned suggestion must have projected margin impact >= 20%
    for (const s of suggestions) {
      expect(Number(lowMarginQuote.margin_percent) + s.projectedMarginImpact).toBeGreaterThanOrEqual(20.0);
    }
  });

  it("Rule 27 & 28: should identify stalled deals (>14 days inactivity) and generate alerts", async () => {
    const evalResult = await DealHealthMonitorService.evaluateAllDeals();
    expect(evalResult.evaluated).toBeGreaterThanOrEqual(2);

    const summary = await DealHealthMonitorService.getDealHealthSummary();
    expect(summary.summary.stalledCount).toBeGreaterThanOrEqual(1);

    const stalledAlert = summary.alerts.find((a: any) => a.alert_type === "STALLED_DEAL");
    expect(stalledAlert).toBeDefined();
    expect(stalledAlert.status).toBe("OPEN");
  });
});
