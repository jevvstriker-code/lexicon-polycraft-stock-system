export class RoundVerificationModel {
  static validate(productId: string): { valid: boolean; error?: string } {
    if (!productId || !productId.trim()) {
      return { valid: false, error: 'Product ID is required for verification.' };
    }
    return { valid: true };
  }
}
