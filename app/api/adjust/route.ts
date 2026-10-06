import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { StockAdjustmentData } from '@/types/inventory';

export async function POST(req: NextRequest) {
  try {
    const body: StockAdjustmentData = await req.json();

    if (!body.productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: product, error: fetchErr } = await supabase
      .from('products')
      .select('*')
      .eq('id', body.productId)
      .single();

    if (fetchErr || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const currentStock = product.stock;
    const packSize = product.packaging_type === 'loose' ? 1 : (product.pack_size || 1);
    const calculatedQty =
      product.packaging_type !== 'loose' && body.mode === 'sets'
        ? body.qtyInput * packSize
        : body.qtyInput;

    let newStock = currentStock;
    let change = 0;

    if (body.type === 'production') {
      change = calculatedQty;
      newStock = currentStock + calculatedQty;
    } else if (body.type === 'delivery') {
      change = -calculatedQty;
      newStock = Math.max(0, currentStock - calculatedQty);
    } else if (body.type === 'physical_audit') {
      change = calculatedQty - currentStock;
      newStock = calculatedQty;
    }

    const { data: updatedProduct, error: updateErr } = await supabase
      .from('products')
      .update({
        stock: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq('id', product.id)
      .select('*')
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
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
      product.packaging_type !== 'loose' && body.mode === 'sets'
        ? ` (${body.qtyInput} ${unitName} × ${packSize} pcs)`
        : ` (${calculatedQty} loose pieces)`;

    await supabase.from('activity_logs').insert([
      {
        product_id: product.id,
        code: product.code,
        name: product.name,
        type: body.type,
        change,
        new_stock: newStock,
        remarks: `${body.remarks ? body.remarks + ' - ' : ''}${body.type === 'production' ? 'Production' : body.type === 'delivery' ? 'Delivery' : 'Physical Audit'}${countDesc}`,
      },
    ]);

    return NextResponse.json({ product: updatedProduct });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Stock adjustment failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
