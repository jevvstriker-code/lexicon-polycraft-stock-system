export type FSNType = 'Runner' | 'Repeater' | 'Stranger';
export type PackagingType = 'set' | 'bundle' | 'inner' | 'loose';
export type TransactionType = 'production' | 'delivery' | 'physical_audit';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  fsn: FSNType;
  packaging_type: PackagingType;
  pack_size: number;
  min_stock: number;
  max_stock: number;
  stock: number;
  photo?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ActivityLog {
  id: string;
  product_id?: string;
  code: string;
  name: string;
  type: TransactionType;
  change: number;
  new_stock: number;
  remarks: string;
  created_at: string;
}

export interface RoundVerification {
  id: string;
  product_id: string;
  verified: boolean;
  verified_at: string;
}

export interface ProductFormData {
  id?: string;
  code: string;
  name: string;
  category: string;
  fsn: FSNType;
  packaging_type: PackagingType;
  pack_size: number;
  min_stock: number;
  max_stock: number;
  stock: number;
  photo?: string;
}

export interface StockAdjustmentData {
  productId: string;
  type: TransactionType;
  qtyInput: number;
  mode: 'sets' | 'pieces';
  remarks?: string;
}
