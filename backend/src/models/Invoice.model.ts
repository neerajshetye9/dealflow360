import { db } from "../config/database";

export type InvoiceType = "ONE_TIME" | "SUBSCRIPTION" | "HYBRID";
export type InvoiceStatus = "DRAFT" | "ISSUED" | "PAID" | "OVERDUE" | "VOID" | "CREDITED";

export interface InvoiceRecord {
  id: string;
  invoice_number: string;
  customer_id: string;
  quotation_id?: string | null;
  subscription_id?: string | null;
  invoice_type: InvoiceType;
  status: InvoiceStatus;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  due_date: Date;
  issued_at?: Date | null;
  paid_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface InvoiceLineRecord {
  id: string;
  invoice_id: string;
  product_id: string;
  line_type: "ONE_TIME" | "SUBSCRIPTION";
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentRecord {
  id: string;
  invoice_id: string;
  payment_method: string;
  gateway_reference: string;
  amount: number;
  status: "SUCCESS" | "FAILED" | "REFUNDED";
  processed_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface RefundRecord {
  id: string;
  payment_id: string;
  invoice_id: string;
  amount: number;
  reason: string;
  approved_by?: string | null;
  status: "PROCESSED" | "PENDING";
  created_at: Date;
  updated_at: Date;
}

export interface CreditNoteRecord {
  id: string;
  customer_id: string;
  original_invoice_id?: string | null;
  amount: number;
  reason: string;
  status: "ACTIVE" | "APPLIED";
  created_at: Date;
  updated_at: Date;
}

export const invoicesTable = () => db<InvoiceRecord>("invoices");
export const invoiceLinesTable = () => db<InvoiceLineRecord>("invoice_lines");
export const paymentsTable = () => db<PaymentRecord>("payments");
export const refundsTable = () => db<RefundRecord>("refunds");
export const creditNotesTable = () => db<CreditNoteRecord>("credit_notes");
