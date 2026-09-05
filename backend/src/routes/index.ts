import { Express } from "express";
import { authRoutes } from "./authRoutes";
import { productRoutes } from "./productRoutes";
import { priceListRoutes } from "./priceListRoutes";
import { discountRuleRoutes } from "./discountRuleRoutes";
import { approvalRoutes } from "./approvalRoutes";
import { portalRoutes } from "./portalRoutes";
import { auditLogRoutes } from "./auditLogRoutes";
import { quotationRoutes } from "./quotationRoutes";
import { dealHealthRoutes } from "./dealHealthRoutes";
import { fulfillmentRoutes } from "./fulfillmentRoutes";
import { subscriptionRoutes } from "./subscriptionRoutes";
import { invoiceRoutes } from "./invoiceRoutes";
import { reportRoutes } from "./reportRoutes";

export function mountAllRoutes(app: Express): void {
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/price-lists", priceListRoutes);
  app.use("/api/discount-rules", discountRuleRoutes);
  app.use("/api/approvals", approvalRoutes);
  app.use("/api/portal", portalRoutes);
  app.use("/api/audit-logs", auditLogRoutes);
  app.use("/api/quotations", quotationRoutes);
  app.use("/api/deal-health", dealHealthRoutes);
  app.use("/api/fulfillment", fulfillmentRoutes);
  app.use("/api/subscriptions", subscriptionRoutes);
  app.use("/api/invoices", invoiceRoutes);
  app.use("/api/reports", reportRoutes);
}
