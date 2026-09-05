import { productsTable, productCategoriesTable, productVariantsTable, ProductRecord, ProductCategoryRecord, ProductVariantRecord } from "../models/Product.model";
import { AuditLogService } from "./AuditLogService";

export class ProductService {
  public static async listProducts(categoryId?: string, search?: string): Promise<ProductRecord[]> {
    let query = productsTable().where({ is_active: true }).orderBy("created_at", "desc");
    if (categoryId) {
      query = query.where({ category_id: categoryId });
    }
    if (search) {
      query = query.whereILike("name", `%${search}%`);
    }
    return query;
  }

  public static async getProductById(id: string): Promise<{
    product: ProductRecord;
    category: ProductCategoryRecord | null;
    variants: ProductVariantRecord[];
  }> {
    const product = await productsTable().where({ id }).first();
    if (!product) {
      throw new Error("Product not found");
    }

    const category = await productCategoriesTable().where({ id: product.category_id }).first() || null;
    const variants = await productVariantsTable().where({ product_id: id, is_active: true });

    return { product, category, variants };
  }

  public static async createProduct(
    data: Omit<ProductRecord, "id" | "created_at" | "updated_at">,
    actorId?: string,
    actorIp?: string
  ): Promise<ProductRecord> {
    const [created] = await productsTable().insert(data).returning("*");
    await AuditLogService.recordEvent(actorId, actorIp, "PRODUCT", created.id, "PRODUCT_CREATED", null, created);
    return created;
  }

  public static async updateProduct(
    id: string,
    data: Partial<Omit<ProductRecord, "id" | "created_at" | "updated_at">>,
    actorId?: string,
    actorIp?: string
  ): Promise<ProductRecord> {
    const before = await productsTable().where({ id }).first();
    if (!before) throw new Error("Product not found");

    const [updated] = await productsTable().where({ id }).update({ ...data, updated_at: new Date() }).returning("*");
    await AuditLogService.recordEvent(actorId, actorIp, "PRODUCT", id, "PRODUCT_UPDATED", before, updated);
    return updated;
  }

  public static async listCategories(): Promise<ProductCategoryRecord[]> {
    return productCategoriesTable().orderBy("name", "asc");
  }

  public static async createCategory(
    data: Omit<ProductCategoryRecord, "id" | "created_at" | "updated_at">,
    actorId?: string,
    actorIp?: string
  ): Promise<ProductCategoryRecord> {
    const [created] = await productCategoriesTable().insert(data).returning("*");
    await AuditLogService.recordEvent(actorId, actorIp, "CATEGORY", created.id, "CATEGORY_CREATED", null, created);
    return created;
  }

  public static async createVariant(
    productId: string,
    data: Omit<ProductVariantRecord, "id" | "product_id" | "created_at" | "updated_at">,
    actorId?: string,
    actorIp?: string
  ): Promise<ProductVariantRecord> {
    const [created] = await productVariantsTable()
      .insert({ ...data, product_id: productId })
      .returning("*");
    await AuditLogService.recordEvent(actorId, actorIp, "PRODUCT_VARIANT", created.id, "VARIANT_CREATED", null, created);
    return created;
  }
}
