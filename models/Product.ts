import { Product, ProductFormData } from '@/types/inventory';

export class ProductModel {
  static validate(data: Partial<ProductFormData>): { valid: boolean; error?: string } {
    if (!data.code || !data.code.trim()) {
      return { valid: false, error: 'Product Code / SKU is required.' };
    }
    if (!data.name || !data.name.trim()) {
      return { valid: false, error: 'Product Name is required.' };
    }
    if (!data.category || !data.category.trim()) {
      return { valid: false, error: 'Category is required.' };
    }
    if (data.min_stock !== undefined && data.min_stock < 0) {
      return { valid: false, error: 'Min stock cannot be negative.' };
    }
    if (data.max_stock !== undefined && data.max_stock < 0) {
      return { valid: false, error: 'Max stock cannot be negative.' };
    }
    if (data.stock !== undefined && data.stock < 0) {
      return { valid: false, error: 'Stock cannot be negative.' };
    }
    return { valid: true };
  }

  static formatForDb(data: ProductFormData): Omit<Product, 'id' | 'created_at' | 'updated_at'> {
    return {
      code: data.code.trim().toUpperCase(),
      name: data.name.trim(),
      category: data.category.trim(),
      fsn: data.fsn,
      packaging_type: data.packaging_type,
      pack_size: data.packaging_type === 'loose' ? 1 : Math.max(1, data.pack_size || 1),
      min_stock: Math.max(0, data.min_stock || 0),
      max_stock: Math.max(0, data.max_stock || 0),
      stock: Math.max(0, data.stock || 0),
      photo: data.photo?.trim() || '',
    };
  }
}
