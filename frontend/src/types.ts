
export type UserRole = 'sales_rep' | 'sales_manager' | 'finance_director' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface QuotationLine {
  id?: string;
  productId: string;
  productName: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  discountPercent: number;
  effectiveCeiling: number;
  isOverCeiling: boolean;
  netPrice: number;
  grossMarginPercent: number;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  customerTier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'STANDARD';
  stage: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'CUSTOMER_REVIEW' | 'ACCEPTED' | 'REJECTED';
  totalValue: number;
  blendedRiskScore: number;
  blendedMarginPercent: number;
  version: number;
  lines: QuotationLine[];
  createdAt: string;
}

export interface ApprovalDecision {
  id: string;
  quotationId: string;
  quoteNumber: string;
  customerName: string;
  requestedBy: string;
  stepName: string;
  blendedRiskScore: number;
  maxDiscountPercent: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';
  violations: Array<{
    lineItem: string;
    categoryCeiling: number;
    tierCeiling: number;
    effectiveCeiling: number;
    requestedDiscount: number;
    overage: number;
  }>;
  submittedAt: string;
}

export interface WarehouseInventory {
  warehouseId: string;
  warehouseName: string;
  code: string;
  location: string;
  transitCostPerUnit: number;
  availableStock: number;
  reservedStock: number;
}

export interface Subscription {
  id: string;
  customerName: string;
  planName: string;
  mrr: number;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  seats: number;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  currentPeriodEnd: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  oneTimeTotal: number;
  subscriptionTotal: number;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'VOID' | 'CREDITED';
  dueDate: string;
  createdAt: string;
}

export interface DealHealthAlert {
  id: string;
  quoteNumber: string;
  customerName: string;
  salesRepName: string;
  alertType: 'STALLED_DEAL' | 'DISCOUNT_ANOMALY' | 'MARGIN_EROSION';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  inactivityDays: number;
  description: string;
  status: 'ACTIVE' | 'NUDGED' | 'ESCALATED' | 'RESOLVED';
}
