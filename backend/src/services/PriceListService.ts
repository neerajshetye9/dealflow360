import { priceListsTable, priceListItemsTable, PriceListRecord, PriceListItemRecord } from "../models/PriceList.model";
import { productsTable } from "../models/Product.model";
import { AuditLogService } from "./AuditLogService";

export class PriceListService {
  public static async listPriceLists(): Promise<PriceListRecord[]> {
    return priceListsTable().where({ is_active: true }).orderBy("created_at", "desc");
  }

  public static async getPriceListById(id: string): Promise<{
    priceList: PriceListRecord;
    items: PriceListItemRecord[];
  }> {
    const priceList = await priceListsTable().where({ id }).first();
    if (!priceList) {
      throw new Error("Price list not found");
    }
    const items = await priceListItemsTable().where({ price_list_id: id });
    return { priceList, items };
  }

  public static async createPriceList(
    data: Omit<PriceListRecord, "id" | "created_at" | "updated_at">,
    actorId?: string,
    actorIp?: string
  ): Promise<PriceListRecord> {
    const [created] = await priceListsTable().insert(data).returning("*");
    await AuditLogService.recordEvent(actorId, actorIp, "PRICE_LIST", created.id, "PRICE_LIST_CREATED", null, created);
    return created;
  }

  public static async upsertPriceListItem(
    priceListId: string,
    productId: string,
    customPrice: number,
    variantId?: string | null,
    actorId?: string,
    actorIp?: string
  ): Promise<PriceListItemRecord> {
    const existing = await priceListItemsTable()
      .where({
        price_list_id: priceListId,
        product_id: productId,
        variant_id: variantId || null,
      })
      .first();

    if (existing) {
      const [updated] = await priceListItemsTable()
        .where({ id: existing.id })
        .update({ custom_price: customPrice, updated_at: new Date() })
        .returning("*");
      await AuditLogService.recordEvent(actorId, actorIp, "PRICE_LIST_ITEM", updated.id, "PRICE_LIST_ITEM_UPDATED", existing, updated);
      return updated;
    }

    const [created] = await priceListItemsTable()
      .insert({
        price_list_id: priceListId,
        product_id: productId,
        variant_id: variantId || null,
        custom_price: customPrice,
      })
      .returning("*");
    await AuditLogService.recordEvent(actorId, actorIp, "PRICE_LIST_ITEM", created.id, "PRICE_LIST_ITEM_CREATED", null, created);
    return created;
  }

  public static async getEffectiveProductPrice(
    productId: string,
    priceListId?: string,
    variantId?: string
  ): Promise<number> {
    if (priceListId) {
      const customItem = await priceListItemsTable()
        .where({
          price_list_id: priceListId,
          product_id: productId,
          variant_id: variantId || null,
        })
        .first();

      if (customItem) {
        return Number(customItem.custom_price);
      }
    }

    const product = await productsTable().where({ id: productId }).first();
    if (!product) {
      throw new Error("Product not found");
    }
    return Number(product.base_price);
  }
}
