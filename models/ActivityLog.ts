import { TransactionType } from '@/types/inventory';

export class ActivityLogModel {
  static validate(data: {
    code: string;
    name: string;
    type: TransactionType;
    change: number;
    new_stock: number;
  }): { valid: boolean; error?: string } {
    if (!data.code || !data.code.trim()) {
      return { valid: false, error: 'Product code is required for log entry.' };
    }
    if (!['production', 'delivery', 'physical_audit'].includes(data.type)) {
      return { valid: false, error: 'Invalid transaction type.' };
    }
    return { valid: true };
  }
}
