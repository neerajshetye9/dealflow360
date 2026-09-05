// ── Auth Types ─────────────────────────────────────────────────────────────
export type UserRole =
  | "admin"
  | "sales_rep"
  | "sales_manager"
  | "finance_director"
  | "warehouse_manager"
  | "customer";

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface JwtAccessPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ── Request Augmentation ────────────────────────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      auditContext?: {
        actorId: string;
        actorIp: string;
      };
    }
  }
}

// ── Discount & Risk Types ──────────────────────────────────────────────────
export interface QuotationLineInput {
  productId: string;
  categoryId: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  requestedDiscountPercent: number;
}

export interface LineViolation {
  lineIndex: number;
  productId: string;
  requestedDiscountPercent: number;
  effectiveCeilingPercent: number;
  overByPoints: number;
  lineTotal: number;
  lineMarginImpactWeight: number;
  lineRiskContribution: number;
}

export interface BlendedRiskResult {
  blendedRiskScore: number;           // 0–100
  riskLabel: "LOW" | "MEDIUM" | "HIGH";
  approvalRoute: "AUTO_APPROVED" | "SALES_MANAGER" | "SEQUENTIAL_TWO_LEVEL";
  violations: LineViolation[];
  totalQuoteValue: number;
  weightedMarginPercent: number;
}

// ── Approval Types ─────────────────────────────────────────────────────────
export type ApprovalAction = "APPROVE" | "REJECT" | "RETURN_FOR_REVISION";
export type ApprovalDecisionStatus = "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";

// ── API Response Wrappers ──────────────────────────────────────────────────
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
  statusCode: number;
}

// ── Pagination ─────────────────────────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}
