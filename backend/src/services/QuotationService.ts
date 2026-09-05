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
  public static async createQuotation(
    salesRepId: string,
    customerId: string,
    priceListId?: string | null,
    actorIp?: string
  ): Promise<QuotationRecord> {
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

    await this.recalculateQuotationTotals(quotationId);

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

  public static async updateLineItem(
    lineId: string,
    quantity?: number,
    discountPercent?: number,
    actorId?: string,
    actorIp?: string
  ): Promise<QuotationLineRecord> {
    const line = await quotationLinesTable().where({ id: lineId }).first();
    if (!line) throw new Error("Quotation line not found");

    const newQty = quantity !== undefined ? Math.max(1, quantity) : line.quantity;
    const newDiscount = discountPercent !== undefined ? Math.max(0, Math.min(100, discountPercent)) : Number(line.discount_percent);

    const unitPrice = Number(line.unit_price);
    const unitCost = Number(line.unit_cost);
    const netUnitPrice = unitPrice * (1 - newDiscount / 100);
    const lineTotal = netUnitPrice * newQty;
    const calculatedMargin = netUnitPrice > 0 ? ((netUnitPrice - unitCost) / netUnitPrice) * 100 : 0;

    const [updated] = await quotationLinesTable()
      .where({ id: lineId })
      .update({
        quantity: newQty,
        discount_percent: newDiscount,
        line_total: Number(lineTotal.toFixed(2)),
        calculated_margin_percent: Number(calculatedMargin.toFixed(2)),
      })
      .returning("*");

    await this.recalculateQuotationTotals(line.quotation_id);

    await AuditLogService.recordEvent(
      actorId || null,
      actorIp || "127.0.0.1",
      "QUOTATION_LINE",
      lineId,
      "QUOTATION_LINE_UPDATED",
      line,
      updated
    );

    return updated;
  }

  public static async deleteLineItem(
    lineId: string,
    actorId?: string,
    actorIp?: string
  ): Promise<{ success: boolean; quotationId: string }> {
    const line = await quotationLinesTable().where({ id: lineId }).first();
    if (!line) throw new Error("Quotation line not found");

    const quotationId = line.quotation_id;
    await quotationLinesTable().where({ id: lineId }).delete();

    await this.recalculateQuotationTotals(quotationId);

    await AuditLogService.recordEvent(
      actorId || null,
      actorIp || "127.0.0.1",
      "QUOTATION_LINE",
      lineId,
      "QUOTATION_LINE_DELETED",
      line,
      null
    );

    return { success: true, quotationId };
  }

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

    const riskResult = await DiscountGovernanceService.computeBlendedRiskScore(
      quotation.customer_id,
      governanceInputs
    );

    const weightedMargin = totalValue > 0
      ? ((totalValue - totalCost) / totalValue) * 100
      : 0;

    const [updated] = await quotationsTable()
      .where({ id: quotationId })
      .update({
        total_amount: Number(totalValue.toFixed(2)),
        margin_percent: Number(weightedMargin.toFixed(2)),
        blended_risk_score: riskResult.blendedRiskScore,
        updated_at: new Date(),
      })
      .returning("*");

    return updated;
  }

  public static async submitForApproval(
    quotationId: string,
    actorId?: string,
    actorIp?: string
  ): Promise<{ quotation: QuotationRecord; approvalRoute: string }> {
    const quotation = await quotationsTable().where({ id: quotationId }).first();
    if (!quotation) throw new Error("Quotation not found");

    await this.recalculateQuotationTotals(quotationId);

    const lines = await quotationLinesTable().where({ quotation_id: quotationId });
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

    const riskResult = await DiscountGovernanceService.computeBlendedRiskScore(
      quotation.customer_id,
      governanceInputs
    );

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

    return { quotation: updated, approvalRoute: workflow.approvalRoute };
  }

  public static async createRevision(
    quotationId: string,
    actorId?: string,
    reason?: string,
    actorIp?: string
  ): Promise<QuotationRecord> {
    const quotation = await quotationsTable().where({ id: quotationId }).first();
    if (!quotation) throw new Error("Quotation not found");

    const lines = await quotationLinesTable().where({ quotation_id: quotationId });
    const draftStage = await dealStagesTable().where({ name: "Draft" }).first();

    // Snapshot current state in quotation_revisions (Rule 9)
    await quotationRevisionsTable().insert({
      quotation_id: quotationId,
      revision_number: quotation.current_version,
      snapshot_data: { quotation, lines },
      reason_for_change: reason || "User initiated revision",
      created_by: actorId || null,
    });

    const nextVersion = quotation.current_version + 1;

    const [updated] = await quotationsTable()
      .where({ id: quotationId })
      .update({
        current_version: nextVersion,
        approval_status: "DRAFT",
        current_stage_id: draftStage ? draftStage.id : quotation.current_stage_id,
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
