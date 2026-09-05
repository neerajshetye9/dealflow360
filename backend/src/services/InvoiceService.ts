import {
  invoicesTable,
  invoiceLinesTable,
  paymentsTable,
  refundsTable,
  creditNotesTable,
  InvoiceRecord,
} from "../models/Invoice.model";
import { quotationsTable, quotationLinesTable } from "../models/Quotation.model";
import { productsTable } from "../models/Product.model";
import { AuditLogService } from "./AuditLogService";
import { db } from "../config/database";

export class InvoiceService {
  /**
   * Generates a Hybrid Invoice separating ONE_TIME and SUBSCRIPTION lines (Rule 25, Screens 12/13)
   */
  public static async generateInvoiceFromQuotation(
    quotationId: string,
    actorId?: string,
    actorIp?: string
  ): Promise<InvoiceRecord> {
    const quote = await quotationsTable().where({ id: quotationId }).first();
    if (!quote) throw new Error("Quotation not found");

    const lines = await quotationLinesTable().where({ quotation_id: quotationId });

    let subtotal = 0;
    let hasOneTime = false;
    let hasSubscription = false;

    const countResult: any = await invoicesTable().count("id as count").first();
    const count = parseInt(countResult?.count || "0", 10) + 1;
    const invoiceNumber = `INV-2026-${count.toString().padStart(4, "0")}`;

    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Net 30

    // Prepare line items
    const preparedLines: any[] = [];
    for (const l of lines) {
      const p = await productsTable().where({ id: l.product_id }).first();
      const lineType = p?.product_type === "SUBSCRIPTION" ? "SUBSCRIPTION" : "ONE_TIME";

      if (lineType === "SUBSCRIPTION") hasSubscription = true;
      if (lineType === "ONE_TIME") hasOneTime = true;

      const lineTotal = Number(l.line_total);
      subtotal += lineTotal;

      preparedLines.push({
        product_id: l.product_id,
        line_type: lineType,
        description: `${p?.name || "Product"} (SKU: ${p?.sku || ""})`,
        quantity: l.quantity,
        unit_price: Number(l.unit_price) * (1 - Number(l.discount_percent) / 100),
        line_total: lineTotal,
      });
    }

    const invoiceType = (hasOneTime && hasSubscription) ? "HYBRID" : (hasSubscription ? "SUBSCRIPTION" : "ONE_TIME");
    const taxRate = 0.08; // 8% tax
    const taxAmount = Number((subtotal * taxRate).toFixed(2));
    const totalAmount = Number((subtotal + taxAmount).toFixed(2));

    const [invoice] = await invoicesTable()
      .insert({
        invoice_number: invoiceNumber,
        customer_id: quote.customer_id,
        quotation_id: quotationId,
        invoice_type: invoiceType,
        status: "ISSUED",
        subtotal: Number(subtotal.toFixed(2)),
        tax_amount: taxAmount,
        total_amount: totalAmount,
        due_date: dueDate,
        issued_at: new Date(),
      })
      .returning("*");

    for (const pl of preparedLines) {
      await invoiceLinesTable().insert({
        invoice_id: invoice.id,
        ...pl,
      });
    }

    await AuditLogService.recordEvent(
      actorId || null,
      actorIp || "127.0.0.1",
      "INVOICE",
      invoice.id,
      "INVOICE_ISSUED",
      null,
      invoice
    );

    return invoice;
  }

  /**
   * Rule 25: Invoice state transitions (DRAFT -> ISSUED -> PAID / OVERDUE / VOID / CREDITED)
   */
  public static async recordPayment(
    invoiceId: string,
    paymentMethod: string,
    amount: number,
    actorId?: string,
    actorIp?: string
  ): Promise<any> {
    const invoice = await invoicesTable().where({ id: invoiceId }).first();
    if (!invoice) throw new Error("Invoice not found");

    const gatewayRef = `GW-TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const [payment] = await paymentsTable()
      .insert({
        invoice_id: invoiceId,
        payment_method: paymentMethod,
        gateway_reference: gatewayRef,
        amount,
        status: "SUCCESS",
        processed_at: new Date(),
      })
      .returning("*");

    // Check if fully paid
    const allPayments = await paymentsTable().where({ invoice_id: invoiceId, status: "SUCCESS" });
    const paidSum = allPayments.reduce((acc, p) => acc + Number(p.amount), 0);

    let updatedStatus = invoice.status;
    if (paidSum >= Number(invoice.total_amount)) {
      updatedStatus = "PAID";
      await invoicesTable()
        .where({ id: invoiceId })
        .update({ status: "PAID", paid_at: new Date(), updated_at: new Date() });
    }

    await AuditLogService.recordEvent(
      actorId || null,
      actorIp || "127.0.0.1",
      "PAYMENT",
      payment.id,
      "PAYMENT_CAPTURED",
      null,
      payment
    );

    return { payment, invoiceStatus: updatedStatus };
  }

  public static async listInvoices(): Promise<any[]> {
    return db("invoices as inv")
      .join("customers as c", "inv.customer_id", "c.id")
      .select(
        db.raw('inv.*, c.company_name as "customerCompanyName", c.email as "customerEmail"')
      )
      .orderBy("inv.created_at", "desc");
  }

  public static async getInvoiceDetails(id: string): Promise<any> {
    const invoice = await invoicesTable().where({ id }).first();
    if (!invoice) throw new Error("Invoice not found");

    const lines = await invoiceLinesTable().where({ invoice_id: id });
    const payments = await paymentsTable().where({ invoice_id: id });

    return { invoice, lines, payments };
  }
}
