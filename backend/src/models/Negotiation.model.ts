import { db } from "../config/database";

export type NegotiationStatus = "ACTIVE" | "SUBMITTED" | "EXPIRED" | "ACCEPTED" | "REJECTED";
export type NegotiationAuthorType = "CUSTOMER" | "SALES_REP";

export interface NegotiationRequestRecord {
  id: string;
  quotation_id: string;
  portal_token: string;
  token_expires_at: Date;
  status: NegotiationStatus;
  proposed_discount_percent?: number | null;
  customer_notes?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface NegotiationCommentRecord {
  id: string;
  negotiation_request_id: string;
  quotation_line_id?: string | null;
  author_type: NegotiationAuthorType;
  comment_text: string;
  created_at: Date;
  updated_at: Date;
}

export const negotiationRequestsTable = () => db<NegotiationRequestRecord>("negotiation_requests");
export const negotiationCommentsTable = () => db<NegotiationCommentRecord>("negotiation_comments");
