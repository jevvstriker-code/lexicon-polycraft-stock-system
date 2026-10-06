import { createClient } from '@/lib/supabase/client';
import { Product, ActivityLog, RoundVerification, ProductFormData, StockAdjustmentData } from '@/types/inventory';
import { ProductModel } from '@/models/Product';
import { initial304CatalogSeed } from '@/lib/defaultCatalog';

export class InventoryService {
  private client;

  constructor() {
    this.client = createClient();
  }

  async getProducts(): Promise<Product[]> {
    const { data, error } = await this.client
      .from('products')
      .select('*')
      .order('code', { ascending: true });

    if (error) {
      throw new Error(`Failed to load products: ${error.message}`);
    }

    // If database is completely empty on first run, auto-seed with 304 products
    if (!data || data.length === 0) {
      return await this.seedDefaultCatalog();
    }

    return (data || []) as Product[];
  }

  async seedDefaultCatalog(): Promise<Product[]> {
    // Insert initial 304 products in chunks to avoid payload limits
    const chunkSize = 50;
    const allInserted: Product[] = [];

    for (let i = 0; i < initial304CatalogSeed.length; i += chunkSize) {
      const chunk = initial304CatalogSeed.slice(i, i + chunkSize);
      const { data, error } = await this.client
        .from('products')
        .upsert(chunk, { onConflict: 'code' })
        .select('*');

      if (error) {
        throw new Error(`Failed to seed catalog chunk: ${error.message}`);
      }
      if (data) {
        allInserted.push(...(data as Product[]));
      }
    }

    return allInserted;
  }

  async createProduct(formData: ProductFormData): Promise<Product> {
    const validation = ProductModel.validate(formData);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const payload = ProductModel.formatForDb(formData);
    const { data, error } = await this.client
      .from('products')
      .insert([payload])
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }

    // Record log
    await this.createActivityLog({
      product_id: data.id,
      code: data.code,
      name: data.name,
      type: 'physical_audit',
      change: data.stock,
      new_stock: data.stock,
      remarks: 'Product added to inventory master',
    });

    return data as Product;
  }

  async updateProduct(id: string, formData: ProductFormData): Promise<Product> {
    const validation = ProductModel.validate(formData);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const payload = ProductModel.formatForDb(formData);
    const { data, error } = await this.client
      .from('products')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }

    return data as Product;
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await this.client.from('products').delete().eq('id', id);
    if (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  async adjustStock(adjustment: StockAdjustmentData): Promise<Product> {
    const { data: product, error: fetchErr } = await this.client
      .from('products')
      .select('*')
      .eq('id', adjustment.productId)
      .single();

    if (fetchErr || !product) {
      throw new Error('Product not found.');
    }

    const currentStock = product.stock;
    const packSize = product.packaging_type === 'loose' ? 1 : (product.pack_size || 1);
    const calculatedQty =
      product.packaging_type !== 'loose' && adjustment.mode === 'sets'
        ? adjustment.qtyInput * packSize
        : adjustment.qtyInput;

    let newStock = currentStock;
    let change = 0;

    if (adjustment.type === 'production') {
      change = calculatedQty;
      newStock = currentStock + calculatedQty;
    } else if (adjustment.type === 'delivery') {
      change = -calculatedQty;
      newStock = Math.max(0, currentStock - calculatedQty);
    } else if (adjustment.type === 'physical_audit') {
      change = calculatedQty - currentStock;
      newStock = calculatedQty;
    }

    const { data: updated, error: updateErr } = await this.client
      .from('products')
      .update({ stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', product.id)
      .select('*')
      .single();

    if (updateErr) {
      throw new Error(`Failed to update stock: ${updateErr.message}`);
    }

    const unitName =
      product.packaging_type === 'set'
        ? 'sets'
        : product.packaging_type === 'bundle'
        ? 'bundles'
        : product.packaging_type === 'inner'
        ? 'inner boxes'
        : 'loose pieces';

    const countDesc =
      product.packaging_type !== 'loose' && adjustment.mode === 'sets'
        ? ` (${adjustment.qtyInput} ${unitName} × ${packSize} pcs)`
        : ` (${calculatedQty} loose pieces)`;

    await this.createActivityLog({
      product_id: product.id,
      code: product.code,
      name: product.name,
      type: adjustment.type,
      change,
      new_stock: newStock,
      remarks: `${adjustment.remarks ? adjustment.remarks + ' - ' : ''}${adjustment.type === 'production' ? 'Production' : adjustment.type === 'delivery' ? 'Delivery' : 'Audit'}${countDesc}`,
    });

    return updated as Product;
  }

  async verifyMobileRound(
    product: Product,
    unitCount: number
  ): Promise<{ product: Product; verification: RoundVerification }> {
    const packSize = product.packaging_type === 'loose' ? 1 : (product.pack_size || 1);
    const newTotal = product.packaging_type !== 'loose' ? unitCount * packSize : unitCount;
    const diff = newTotal - product.stock;

    // Update stock
    const { data: updatedProduct, error: prodErr } = await this.client
      .from('products')
      .update({ stock: newTotal, updated_at: new Date().toISOString() })
      .eq('id', product.id)
      .select('*')
      .single();

    if (prodErr) {
      throw new Error(`Failed to verify round count: ${prodErr.message}`);
    }

    // Upsert round verification
    const { data: verifData, error: verifErr } = await this.client
      .from('round_verifications')
      .upsert(
        {
          product_id: product.id,
          verified: true,
          verified_at: new Date().toISOString(),
        },
        { onConflict: 'product_id' }
      )
      .select('*')
      .single();

    if (verifErr) {
      throw new Error(`Failed to record verification: ${verifErr.message}`);
    }

    const unitName =
      product.packaging_type === 'set'
        ? 'sets'
        : product.packaging_type === 'bundle'
        ? 'bundles'
        : product.packaging_type === 'inner'
        ? 'inner boxes'
        : 'loose pieces';

    await this.createActivityLog({
      product_id: product.id,
      code: product.code,
      name: product.name,
      type: 'physical_audit',
      change: diff,
      new_stock: newTotal,
      remarks: `Mobile Round Audit: ${unitCount} ${unitName} (${packSize} pcs/unit)`,
    });

    return { product: updatedProduct as Product, verification: verifData as RoundVerification };
  }

  async resetRoundVerifications(): Promise<void> {
    const { error } = await this.client.from('round_verifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      throw new Error(`Failed to reset round verifications: ${error.message}`);
    }
  }

  async getRoundVerifications(): Promise<Record<string, boolean>> {
    const { data, error } = await this.client.from('round_verifications').select('*');
    if (error) {
      throw new Error(`Failed to load round verifications: ${error.message}`);
    }

    const map: Record<string, boolean> = {};
    (data || []).forEach((row) => {
      map[row.product_id] = row.verified;
    });
    return map;
  }

  async getActivityLogs(limit = 50): Promise<ActivityLog[]> {
    const { data, error } = await this.client
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to load logs: ${error.message}`);
    }

    return (data || []) as ActivityLog[];
  }

  async createActivityLog(log: Omit<ActivityLog, 'id' | 'created_at'>): Promise<ActivityLog> {
    const { data, error } = await this.client
      .from('activity_logs')
      .insert([
        {
          product_id: log.product_id || null,
          code: log.code,
          name: log.name,
          type: log.type,
          change: log.change,
          new_stock: log.new_stock,
          remarks: log.remarks || '',
        },
      ])
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to save activity log: ${error.message}`);
    }

    return data as ActivityLog;
  }

  async bulkImportProducts(products: Array<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<number> {
    const chunkSize = 50;
    let totalImported = 0;

    for (let i = 0; i < products.length; i += chunkSize) {
      const chunk = products.slice(i, i + chunkSize);
      const { data, error } = await this.client
        .from('products')
        .upsert(chunk, { onConflict: 'code' })
        .select('id');

      if (error) {
        throw new Error(`Error during bulk import: ${error.message}`);
      }
      if (data) {
        totalImported += data.length;
      }
    }

    await this.createActivityLog({
      code: 'BULK-IMPORT',
      name: 'Excel Import Operation',
      type: 'physical_audit',
      change: totalImported,
      new_stock: totalImported,
      remarks: `Imported ${totalImported} items from spreadsheet`,
    });

    return totalImported;
  }
}
