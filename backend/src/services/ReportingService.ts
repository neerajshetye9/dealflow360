import { quotationsTable } from "../models/Quotation.model";
import { invoicesTable } from "../models/Invoice.model";
import { warehousesTable, warehouseInventoryTable } from "../models/Warehouse.model";
import { db } from "../config/database";

export class ReportingService {
  public static async getExecutiveSummary(): Promise<any> {
    const totalQuotesResult: any = await quotationsTable().count("id as count").first();
    const approvedQuotesResult: any = await quotationsTable().where({ approval_status: "APPROVED" }).count("id as count").first();

    const revenueResult: any = await invoicesTable().where({ status: "PAID" }).sum("total_amount as sum").first();
    const totalRevenue = Number(revenueResult?.sum || 0);

    const avgMarginResult: any = await quotationsTable().avg("margin_percent as avg").first();
    const avgMargin = Number(avgMarginResult?.avg || 0);

    // Inventory status
    const inventoryValuation = await db("warehouse_inventory as wi")
      .join("products as p", "wi.product_id", "p.id")
      .select(
        db.raw('SUM(wi.quantity_available * p.base_price) as "availableValue", SUM(wi.quantity_reserved * p.base_price) as "reservedValue"')
      )
      .first();

    return {
      totalQuotations: parseInt(totalQuotesResult?.count || "0", 10),
      approvedQuotations: parseInt(approvedQuotesResult?.count || "0", 10),
      totalPaidRevenue: totalRevenue,
      averageGrossMargin: Number(avgMargin.toFixed(2)),
      inventory: {
        availableValue: Number((inventoryValuation as any)?.availableValue || 0),
        reservedValue: Number((inventoryValuation as any)?.reservedValue || 0),
      },
    };
  }
}
