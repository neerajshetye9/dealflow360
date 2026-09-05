import { db } from "../config/database";

export type QuotationApprovalStatus = "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

export interface DealStageRecord {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface QuotationRecord {
  id: string;
  quote_number: string;
  customer_id: string;
  sales_rep_id: string;
  price_list_id?: string | null;
  current_stage_id: string;
  total_amount: number;
  blended_risk_score: number;
  margin_percent: number;
  approval_status: QuotationApprovalStatus;
  current_version: number;
  created_at: Date;
  updated_at: Date;
}

export interface QuotationLineRecord {
  id: string;
  quotation_id: string;
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  discount_percent: number;
  line_total: number;
  calculated_margin_percent: number;
  is_upsell: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface QuotationRevisionRecord {
  id: string;
  quotation_id: string;
  revision_number: number;
  snapshot_data: Record<string, any>;
  reason_for_change?: string | null;
  created_by?: string | null;
  created_at: Date;
}

export interface PipelineRecord {
  id: string;
  quotation_id: string;
  stage_id: string;
  entered_at: Date;
  exited_at?: Date | null;
  days_in_stage?: number;
}

export const dealStagesTable = () => db<DealStageRecord>("deal_stages");
export const quotationsTable = () => db<QuotationRecord>("quotations");
export const quotationLinesTable = () => db<QuotationLineRecord>("quotation_lines");
export const quotationRevisionsTable = () => db<QuotationRevisionRecord>("quotation_revisions");
export const pipelineRecordsTable = () => db<PipelineRecord>("pipeline_records");
