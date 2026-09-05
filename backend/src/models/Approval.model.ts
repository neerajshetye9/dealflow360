import { db } from "../config/database";
import { ApprovalDecisionStatus } from "../types";

export type ApprovalRouteType = "AUTO_APPROVED" | "SALES_MANAGER" | "SEQUENTIAL_TWO_LEVEL";

export interface ApprovalChainRecord {
  id: string;
  name: string;
  min_risk_score: number;
  max_risk_score: number;
  route_type: ApprovalRouteType;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ApprovalStepRecord {
  id: string;
  chain_id: string;
  step_order: number;
  required_role_id: string;
  step_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface ApprovalDecisionRecord {
  id: string;
  quotation_id: string;
  step_id?: string | null;
  approver_id?: string | null;
  status: ApprovalDecisionStatus;
  decision_reason?: string | null;
  reason_code?: string | null;
  decided_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export const approvalChainsTable = () => db<ApprovalChainRecord>("approval_chains");
export const approvalStepsTable = () => db<ApprovalStepRecord>("approval_steps");
export const approvalDecisionsTable = () => db<ApprovalDecisionRecord>("approval_decisions");
