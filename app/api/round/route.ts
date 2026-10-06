import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('round_verifications').select('*');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const map: Record<string, boolean> = {};
    (data || []).forEach((row) => {
      map[row.product_id] = row.verified;
    });

    return NextResponse.json({ verifications: map });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch round verifications';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, unitCount } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: product, error: fetchErr } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (fetchErr || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const packSize = product.packaging_type === 'loose' ? 1 : (product.pack_size || 1);
    const newTotal = product.packaging_type !== 'loose' ? unitCount * packSize : unitCount;
    const diff = newTotal - product.stock;

    // Update product stock
    const { data: updatedProduct, error: prodErr } = await supabase
      .from('products')
      .update({ stock: newTotal, updated_at: new Date().toISOString() })
      .eq('id', product.id)
      .select('*')
      .single();

    if (prodErr) {
      return NextResponse.json({ error: prodErr.message }, { status: 500 });
    }

    // Upsert round verification
    const { error: verifErr } = await supabase
      .from('round_verifications')
      .upsert(
        {
          product_id: product.id,
          verified: true,
          verified_at: new Date().toISOString(),
        },
        { onConflict: 'product_id' }
      );

    if (verifErr) {
      return NextResponse.json({ error: verifErr.message }, { status: 500 });
    }

    const unitName =
      product.packaging_type === 'set'
        ? 'sets'
        : product.packaging_type === 'bundle'
        ? 'bundles'
        : product.packaging_type === 'inner'
        ? 'inner boxes'
        : 'loose pieces';

    await supabase.from('activity_logs').insert([
      {
        product_id: product.id,
        code: product.code,
        name: product.name,
        type: 'physical_audit',
        change: diff,
        new_stock: newTotal,
        remarks: `Mobile Round Audit: ${unitCount} ${unitName} (${packSize} pcs/unit)`,
      },
    ]);

    return NextResponse.json({ product: updatedProduct });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to verify round item';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('round_verifications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Mobile round marks cleared' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to reset round verifications';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
