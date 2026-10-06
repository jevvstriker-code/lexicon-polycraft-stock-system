import { Product, ActivityLog, ProductFormData, StockAdjustmentData } from '@/types/inventory';
import { InventoryService } from '@/services/supabase/inventoryService';

export class InventoryController {
  private service: InventoryService;

  constructor() {
    this.service = new InventoryService();
  }

  async loadInitialData(): Promise<{
    products: Product[];
    logs: ActivityLog[];
    verifications: Record<string, boolean>;
  }> {
    const [products, logs, verifications] = await Promise.all([
      this.service.getProducts(),
      this.service.getActivityLogs(),
      this.service.getRoundVerifications(),
    ]);

    return { products, logs, verifications };
  }

  async handleSaveProduct(formData: ProductFormData, isEditing: boolean, existingId?: string): Promise<Product> {
    if (isEditing && existingId) {
      return await this.service.updateProduct(existingId, formData);
    } else {
      return await this.service.createProduct(formData);
    }
  }

  async handleDeleteProduct(id: string): Promise<void> {
    await this.service.deleteProduct(id);
  }

  async handleStockAdjustment(data: StockAdjustmentData): Promise<Product> {
    return await this.service.adjustStock(data);
  }

  async handleVerifyRoundItem(product: Product, unitCount: number): Promise<{ product: Product; verified: boolean }> {
    const result = await this.service.verifyMobileRound(product, unitCount);
    return { product: result.product, verified: result.verification.verified };
  }

  async handleResetRound(): Promise<void> {
    await this.service.resetRoundVerifications();
  }

  async handleResetCatalog(): Promise<Product[]> {
    return await this.service.seedDefaultCatalog();
  }

  async handleBulkImport(products: Array<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<number> {
    return await this.service.bulkImportProducts(products);
  }
}
