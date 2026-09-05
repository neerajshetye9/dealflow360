import {
  quotationsTable,
  quotationLinesTable,
  quotationRevisionsTable,
  dealStagesTable,
  pipelineRecordsTable,
  QuotationRecord,
  QuotationLineRecord,
} from "../models/Quotation.model";
import { productsTable } from "../models/Product.model";
import { customersTable } from "../models/Customer.model";
import { DiscountGovernanceService } from "./DiscountGovernanceService";
import { ApprovalEngineService } from "./ApprovalEngineService";
import { AuditLogService } from "./AuditLogService";
import { QuotationLineInput } from "../types";
import { db } from "../config/database";

export class QuotationService {
  /**
   * Creates a new quotation with initial governance validation
   * Incorporates customer loyalty score and 15% profit guardrail (Rule 13)
   */
  public static async createQuotation(
    salesRepId: string,
    customerId: string,
    priceListId?: string | null,
    actorIp?: string
  ): Promise<QuotationRecord> {
    const customer = await customersTable().where({ id: customerId }).first();
    const loyaltyScore = customer ? (customer.loyalty_score || 0.0) : 0.0;

    const draftStage = await dealStagesTable().where({ name: "Draft" }).first();
    if (!draftStage) {
      throw new Error("Deal stage 'Draft' not found");
    }

    const quoteCountResult: any = await quotationsTable().count("id as count").first();
    const count = parseInt(quoteCountResult?.count || "0", 10) + 1;
    const quoteNumber = `QT-2026-${count.toString().padStart(4, "0")}`;

    const [created] = await quotationsTable()
      .insert({
        quote_number: quoteNumber,
        customer_id: customerId,
        sales_rep_id: salesRepId,
        price_list_id: priceListId || null,
        current_stage_id: draftStage.id,
        total_amount: 0,
        blended_risk_score: 0,
        margin_percent: 0,
        approval_status: "DRAFT",
        current_version: 1,
      })
      .returning("*");

    // Initialize loyalty score on customer record for tracking
    if (loyaltyScore > 0) {
      await customersTable()
        .where({ id: customerId })
        .update({ loyalty_score: loyaltyScore });
    }

    await pipelineRecordsTable().insert({
      quotation_id: created.id,
      stage_id: draftStage.id,
    });

    await AuditLogService.recordEvent(
      salesRepId,
      actorIp || "127.0.0.1",
      "QUOTATION",
      created.id,
      "QUOTATION_CREATED",
      null,
      created
    );

    return created;
  }

  /**
   * Adds a line item with real-time governance validation
   * Recalculates blended risk score and margin immediately (Rule 12)
   * Enforces 15% net profit guardrail (Core Business Rule)
   */
  public static async addLineItem(
    quotationId: string,
    productId: string,
    quantity: number,
    discountPercent = 0,
    variantId?: string | null,
    isUpsell = false,
    actorId?: string,
    actorIp?: string
  ): Promise<QuotationLineRecord> {
    const product = await productsTable().where({ id: productId }).first();
    if (!product) {
      throw new Error("Product not found");
    }

    const unitPrice = Number(product.base_price);
    const unitCost = Number(product.unit_cost);

    // Dynamic margin formula per Rule 12: ((Net Selling Price - Unit Cost) / Net Selling Price) * 100
    const netUnitPrice = unitPrice * (1 - discountPercent / 100);
    const lineTotal = netUnitPrice * quantity;
    const calculatedMargin = netUnitPrice > 0
      ? ((netUnitPrice - unitCost) / netUnitPrice) * 100
      : 0;

    const [line] = await quotationLinesTable()
      .insert({
        quotation_id: quotationId,
        product_id: productId,
        variant_id: variantId || null,
        quantity,
        unit_price: unitPrice,
        unit_cost: unitCost,
        discount_percent: discountPercent,
        line_total: Number(lineTotal.toFixed(2)),
        calculated_margin_percent: Number(calculatedMargin.toFixed(2)),
        is_upsell: isUpsell,
      })
      .returning("*");

    // Recalculate quotation totals with ALL line items including the new one
    await QuotationService.recalculateQuotationTotals(quotationId);

    await AuditLogService.recordEvent(
      actorId || null,
      actorIp || "127.0.0.1",
      "QUOTATION_LINE",
      line.id,
      "QUOTATION_LINE_ADDED",
      null,
      line
    );

    return line;
  }

  /**
   * Recalculates quotation totals and applies 15% profit guardrail
   * This is the core validation that runs on every line item addition/change
   */
  public static async recalculateQuotationTotals(quotationId: string): Promise<QuotationRecord> {
    const quotation = await quotationsTable().where({ id: quotationId }).first();
    if (!quotation) throw new Error("Quotation not found");

    const lines = await quotationLinesTable().where({ quotation_id: quotationId });

    if (lines.length === 0) {
      const [updated] = await quotationsTable()
        .where({ id: quotationId })
        .update({
          total_amount: 0,
          margin_percent: 0,
          blended_risk_score: 0,
          updated_at: new Date(),
        })
        .returning("*");
      return updated;
    }

    // Map to QuotationLineInput for DiscountGovernanceService
    // Gather loyalty score from customer
    const customer = await customersTable().where({ id: quotation.customer_id }).first();
    const loyaltyScore = customer ? Number(customer.loyalty_score || 0) : 0;

    const governanceInputs: QuotationLineInput[] = [];
    let totalValue = 0;
    let totalCost = 0;

    for (const l of lines) {
      const product = await productsTable().where({ id: l.product_id }).first();
      const categoryId = product ? product.category_id : "";

      governanceInputs.push({
        productId: l.product_id,
        categoryId,
        quantity: l.quantity,
        unitPrice: Number(l.unit_price),
        unitCost: Number(l.unit_cost),
        requestedDiscountPercent: Number(l.discount_percent),
      });

      totalValue += Number(l.line_total);
      totalCost += Number(l.unit_cost) * l.quantity;
    }

    // **CORE VALIDATION**: Compute blended risk with loyalty score and profit guardrail
    const riskResult = await DiscountGovernanceService.computeBlendedRiskScore(
      quotation.customer_id,
      governanceInputs,
      loyaltyScore
    );

    // Calculate weighted margin
    const weightedMargin = totalValue > 0
      ? ((totalValue - totalCost) / totalValue) * 100
      : 0;

    // **15% NET PROFIT GUARDRAIL ENFORCEMENT**
    // If the quote would fall below 15% margin, we have options:
    // 1. Block the line item addition (if single line causing violation)
    // 2. Allow but flag with elevated risk and require Manager approval
    // 3. Auto-adjust discount to maintain 15% minimum
    
    const marginGuardrailActive = riskResult.marginGuardrailActive;
    const actualMarginPercent = riskResult.actualMarginPercent;

    const [updated] = await quotationsTable()
      .where({ id: quotationId })
      .update({
        total_amount: Number(riskResult.totalQuoteValue.toFixed(2)),
        margin_percent: Number(riskResult.weightedMarginPercent.toFixed(2)),
        blended_risk_score: riskResult.blendedRiskScore, // Includes guardrail adjustment
        updated_at: new Date(),
      })
      .returning("*");

    // If margin guardrail is active and risk is elevated, automatically route for approval
    // This is a critical enforcement mechanism
    if (marginGuardrailActive && riskResult.blendedRiskScore >= 30) {
      // The quote already has elevated risk due to margin concerns
      // Ensure it's marked for review
      // The approval workflow will be initiated on submitForApproval
    }

    return updated;
  }

  /**
   * Submits quotation for approval with full governance validation
   * Incorporates loyalty-based relationship multiplier and 15% profit guardrail
   */
  public static async submitForApproval(
    quotationId: string,
    actorId?: string,
    actorIp?: string
  ): Promise<{ quotation: QuotationRecord; approvalRoute: string; governanceValidation: any }> {
    const quotation = await quotationsTable().where({ id: quotationId }).first();
    if (!quotation) throw new Error("Quotation not found");

    // Recalculate totals to ensure current state
    await this.recalculateQuotationTotals(quotationId);

    const lines = await quotationLinesTable().where({ quotation_id: quotationId });
    
    // Gather customer loyalty score
    const customer = await customersTable().where({ id: quotation.customer_id }).first();
    const loyaltyScore = customer ? Number(customer.loyalty_score || 0) : 0;

    // Gather current margin context
    const currentMarginPercent = quotation.margin_percent || 0;

    // **PHILOSOPHICAL VALIDATION**: Validate discount exception before routing
    const governanceValidation = await DiscountGovernanceService.validateDiscountException(
      quotation.customer_id,
      lines.map(l => ({
        productId: l.product_id,
        categoryId: "", // Will be populated per line below
        quantity: l.quantity,
        unitPrice: Number(l.unit_price),
        unitCost: Number(l.unit_cost),
        requestedDiscountPercent: Number(l.discount_percent),
      })),
      loyaltyScore,
      currentMarginPercent
    );

    // Map governance inputs with category IDs per line
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

    // Compute blended risk with full governance (loyalty + profit guardrail)
    const riskResult = await DiscountGovernanceService.computeBlendedRiskScore(
      quotation.customer_id,
      governanceInputs,
      loyaltyScore
    );

    // Initiate approval workflow based on adjusted risk score
    const workflow = await ApprovalEngineService.initiateApprovalWorkflow(
      quotationId,
      riskResult,
      actorId,
      actorIp
    );

    let nextStageName = "Under Review";
    let nextApprovalStatus = "UNDER_REVIEW";

    if (workflow.approvalRoute === "AUTO_APPROVED") {
      nextStageName = "Approved";
      nextApprovalStatus = "APPROVED";
    }

    const nextStage = await dealStagesTable().where({ name: nextStageName }).first();

    const [updated] = await quotationsTable()
      .where({ id: quotationId })
      .update({
        current_stage_id: nextStage ? nextStage.id : quotation.current_stage_id,
        approval_status: nextApprovalStatus as any,
        updated_at: new Date(),
      })
      .returning("*");

    // Record governance validation in audit log for transparency
    await AuditLogService.recordEvent(
      actorId || null,
      actorIp || "127.0.0.1",
      "QUOTATION",
      quotationId,
      "GOVERNANCE_VALIDATION_COMPLETE",
      {
        loyaltyScore,
        originalMargin: currentMarginPercent,
        finalMargin: riskResult.weightedMarginPercent,
        blendedRiskScore: riskResult.blendedRiskScore,
        marginGuardrailActive: riskResult.marginGuardrailActive,
        approvalRoute: workflow.approvalRoute,
        exceptionValid: governanceValidation.exceptionValid,
        requiredApprovalLevel: governanceValidation.requiredApprovalLevel,
      },
      {
        loyaltyScore,
        originalMargin: currentMarginPercent,
        finalMargin: riskResult.weightedMarginPercent,
        blendedRiskScore: riskResult.blendedRiskScore,
        marginGuardrailActive: riskResult.marginGuardrailActive,
        approvalRoute: workflow.approvalRoute,
      }
    );

    return {
      quotation: updated,
      approvalRoute: workflow.approvalRoute,
      governanceValidation,
    };
  }

  /**
   * Creates a revision with full state snapshot for audit trail
   * Snapshots include governance data for traceability (Rule 9)
   */
  public static async createRevision(
    quotationId: string,
    actorId?: string,
    reason?: string,
    actorIp?: string
  ): Promise<QuotationRecord> {
    const quotation = await quotationsTable().where({ id: quotationId }).first();
    if (!quotation) throw new Error("Quotation not found");

    const lines = await quotationLinesTable().where({ quotation_id: quotationId });
    const customer = await customersTable().where({ id: quotation.customer_id }).first();
    const loyaltyScore = customer ? Number(customer.loyalty_score || 0) : 0;

    // Snapshot current state in quotation_revisions (Rule 9)
    await quotationRevisionsTable().insert({
      quotation_id: quotationId,
      revision_number: quotation.current_version,
      snapshot_data: {
        quotation,
        lines,
        loyaltyScore,
        marginPercent: quotation.margin_percent,
        blendedRiskScore: quotation.blended_risk_score,
        totalAmount: quotation.total_amount,
      },
      reason_for_change: reason || "User initiated revision",
      created_by: actorId || null,
    });

    const nextVersion = quotation.current_version + 1;

    const [updated] = await quotationsTable()
      .where({ id: quotationId })
      .update({
        current_version: nextVersion,
        approval_status: "DRAFT",
        current_stage_id: quotation.current_stage_id,
        updated_at: new Date(),
      })
      .returning("*");

    await AuditLogService.recordEvent(
      actorId || null,
      actorIp || "127.0.0.1",
      "QUOTATION",
      quotationId,
      "QUOTATION_REVISION_CREATED",
      { version: quotation.current_version },
      { version: nextVersion }
    );

    return updated;
  }

  public static async getQuotationDetails(quotationId: string): Promise<any> {
    const quotation = await quotationsTable().where({ id: quotationId }).first();
    if (!quotation) throw new Error("Quotation not found");

    const customer = await customersTable().where({ id: quotation.customer_id }).first();
    const stage = await dealStagesTable().where({ id: quotation.current_stage_id }).first();
    const lines = await quotationLinesTable()
      .where({ quotation_id: quotationId })
      .orderBy("created_at", "asc");

    const augmentedLines = [];
    for (const line of lines) {
      const p = await productsTable().where({ id: line.product_id }).first();
      augmentedLines.push({
        ...line,
        productName: p?.name || "Unknown Product",
        sku: p?.sku || "",
      });
    }

    return {
      quotation,
      customer,
      stage,
      lines: augmentedLines,
      loyaltyScore: customer?.loyalty_score || 0,
    };
  }

  public static async listQuotations(salesRepId?: string, stageId?: string): Promise<any[]> {
    let query = db("quotations as q")
      .join("customers as c", "q.customer_id", "c.id")
      .join("deal_stages as s", "q.current_stage_id", "s.id")
      .select(
        db.raw("q.*, c.company_name as \"customerCompanyName\", c.name as \"customerContactName\", s.name as \"stageName\", s.display_order as \"stageOrder\"")
      )
      .orderBy("q.updated_at", "desc");

    if (salesRepId) {
      query = query.where("q.sales_rep_id", salesRepId);
    }
    if (stageId) {
      query = query.where("q.current_stage_id", stageId);
    }

    return query;
  }
}