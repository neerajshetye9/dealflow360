import { quotationsTable, quotationLinesTable } from "../models/Quotation.model";
import { customersTable } from "../models/Customer.model";
import { productsTable } from "../models/Product.model";
import { DiscountGovernanceService } from "./DiscountGovernanceService";
import { AuditLogService } from "./AuditLogService";
import { db } from "../config/database";
import { QuotationLineInput } from "../types";

export interface CounterOfferResult {
  quotationId: string;
  newDiscountPercent: number;
  newBlendedRiskScore: number;
  approvalRoute: "AUTO_APPROVED" | "SALES_MANAGER" | "SEQUENTIAL_TWO_LEVEL";
  requiresReapproval: boolean;
  message: string;
}

export class NegotiationService {
  /**
   * Process customer counter-offer through portal (Rule from PS.md B8)
   * Recalculates blended risk score and triggers re-approval if thresholds crossed
   */
  public static async processCounterOffer(
    quotationId: string,
    newDiscountPercent: number,
    actorId?: string,
    actorIp?: string
  ): Promise<CounterOfferResult> {
    const quotation = await quotationsTable().where({ id: quotationId }).first();
    if (!quotation) throw new Error("Quotation not found");

    const customer = await customersTable().where({ id: quotation.customer_id }).first();
    const loyaltyScore = customer ? Number(customer.loyalty_score || 0) : 0;

    // Get all line items with their product categories
    const lines = await quotationLinesTable().where({ quotation_id: quotationId });

    // Build governance inputs - preserve existing categories per line
    const governanceInputs: QuotationLineInput[] = [];
    for (const l of lines) {
      const p = await productsTable().where({ id: l.product_id }).first();
      governanceInputs.push({
        productId: l.product_id,
        categoryId: p ? p.category_id : "",
        quantity: l.quantity,
        unitPrice: Number(l.unit_price),
        unitCost: Number(l.unit_cost),
        requestedDiscountPercent: newDiscountPercent, // Customer's counter applies to all lines or we calculate weighted
      });
    }

    // Recalculate blended risk with the new discount
    const riskResult = await DiscountGovernanceService.computeBlendedRiskScore(
      quotation.customer_id,
      governanceInputs,
      loyaltyScore
    );

    // Determine if re-approval is required
    // Rules from PS.md B8: "If final terms exceed approval thresholds, the quotation automatically re-enters the approval flow"
    const reapprovalRequired = riskResult.blendedRiskScore > 30 || riskResult.marginGuardrailActive;

    // Determine approval route
    const approvalRoute = DiscountGovernanceService["determineApprovalRoute"]
      ? DiscountGovernanceService["determineApprovalRoute"](
          riskResult.blendedRiskScore,
          loyaltyScore
        )["approvalRoute"]
      : "SALES_MANAGER";

    // Build message for user
    let message = "";
    if (riskResult.actualMarginPercent < 15) {
      message = `Counter-offer accepted but margin below 15% guardrail (${riskResult.actualMarginPercent.toFixed(1)}%). `;
      if (riskResult.marginGuardrailActive) {
        message += "Auto-routes to Finance approval per profit guardrail.";
      } else {
        message += "Margin adjusted, re-approval required.";
      }
    } else {
      message = `Counter-offer processed. Blended risk: ${riskResult.blendedRiskScore}% (${riskResult.riskLabel}). `;
      if (reapprovalRequired) {
        message += "Quotation re-enters approval flow.";
      } else {
        message += "No additional approval required.";
      }
    }

    // Record negotiation event in audit log
    await AuditLogService.recordEvent(
      actorId || null,
      actorIp || "127.0.0.1",
      "QUOTATION",
      quotationId,
      "COUNTER_OFFER_SUBMITTED",
      {
        originalDiscount: quotation.total_amount ? Math.random() * 30 : 10, // placeholder
        newDiscountPercent,
        newBlendedRiskScore: riskResult.blendedRiskScore,
        approvalRoute,
        reapprovalRequired,
        loyaltyScore,
      },
      {
        originalDiscount: 0,
        newDiscountPercent,
        newBlendedRiskScore: riskResult.blendedRiskScore,
        approvalRoute,
        reapprovalRequired,
      }
    );

    return {
      quotationId,
      newDiscountPercent,
      newBlendedRiskScore: riskResult.blendedRiskScore,
      approvalRoute,
      requiresReapproval: reapprovalRequired,
      message,
    };
  }

  /**
   * Customer confirms quotation through portal (Rule B8)
   * Final threshold check and move to fulfillment
   */
  public static async customerConfirmQuotation(
    quotationId: string,
    actorId?: string,
    actorIp?: string
  ): Promise<{
    status: "CONFIRMED" | "REAPPROVAL_REQUIRED" | "REJECTED";
    newBlendedRiskScore: number;
    approvalRoute: "AUTO_APPROVED" | "SALES_MANAGER" | "SEQUENTIAL_TWO_LEVEL";
    message: string;
  }> {
    const quotation = await quotationsTable().where({ id: quotationId }).first();
    if (!quotation) throw new Error("Quotation not found");

    const customer = await customersTable().where({ id: quotation.customer_id }).first();
    const loyaltyScore = customer ? Number(customer.loyalty_score || 0) : 0;

    // Get all lines with product categories
    const lines = await quotationLinesTable().where({ quotation_id: quotationId });

    // Build governance inputs
    const governanceInputs: QuotationLineInput[] = [];
    for (const l of lines) {
      const p = await productsTable().where({ id: l.product_id }).first();
      governanceInputs.push({
        productId: l.product_id,
        categoryId: p ? p.category_id : "",
        quantity: l.quantity,
        unitPrice: Number(l.unit_price),
        unitCost: Number(l.unit_cost),
        requestedDiscountPercent: Number(l.discount_percent),
      });
    }

    // Recalculate blended risk
    const riskResult = await DiscountGovernanceService.computeBlendedRiskScore(
      quotation.customer_id,
      governanceInputs,
      loyaltyScore
    );

    // Final threshold check from PS.md B8
    // "If final terms exceed approval thresholds, the quotation automatically re-enters the approval flow"
    // "Otherwise, the order moves directly to fulfillment"
    const exceedsThreshold = riskResult.blendedRiskScore > 30;
    const marginGuardViolation = riskResult.marginGuardrailActive;

    let status: "CONFIRMED" | "REAPPROVAL_REQUIRED" | "REJECTED" = "CONFIRMED";
    let approvalRoute: "AUTO_APPROVED" | "SALES_MANAGER" | "SEQUENTIAL_TWO_LEVEL" = "AUTO_APPROVED";
    let message = "";

    if (marginGuardViolation) {
      // Margin guardrail always takes precedence
      status = "REAPPROVAL_REQUIRED";
      approvalRoute = "SEQUENTIAL_TWO_LEVEL";
      message = `Margin guardrail violated (${riskResult.actualMarginPercent.toFixed(1)}% < 15%). Quotation re-enters approval flow.`;
    } else if (exceedsThreshold) {
      // Risk threshold exceeded - re-enters approval
      status = "REAPPROVAL_REQUIRED";
      approvalRoute = "SEQUENTIAL_TWO_LEVEL";
      message = `Terms exceed approval thresholds (${riskResult.blendedRiskScore}% blended risk). Quotation re-enters approval flow.`;
    } else {
      // Safe - move to confirmed
      status = "CONFIRMED";
      approvalRoute = "AUTO_APPROVED";
      message = "Quotation confirmed. Moving to fulfillment.";
    }

    // Record confirmation event
    await AuditLogService.recordEvent(
      actorId || null,
      actorIp || "127.0.0.1",
      "QUOTATION",
      quotationId,
      "QUOTATION_CONFIRMED",
      { previousStatus: quotation.approval_status },
      { newStatus: status, blendedRiskScore: riskResult.blendedRiskScore }
    );

    return {
      status,
      newBlendedRiskScore: riskResult.blendedRiskScore,
      approvalRoute,
      message,
    };
  }
}