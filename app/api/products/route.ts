import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ProductModel } from '@/models/Product';
import { ProductFormData } from '@/types/inventory';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('code', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: data || [] });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch products';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ProductFormData = await req.json();
    const validation = ProductModel.validate(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const payload = ProductModel.formatForDb(body);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('products')
      .insert([payload])
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log addition
    await supabase.from('activity_logs').insert([
      {
        product_id: data.id,
        code: data.code,
        name: data.name,
        type: 'physical_audit',
        change: data.stock,
        new_stock: data.stock,
        remarks: 'New SKU added into system',
      },
    ]);

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create product';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body: ProductFormData & { id: string } = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Product ID is required for update' }, { status: 400 });
    }

    const validation = ProductModel.validate(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const payload = ProductModel.formatForDb(body);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('products')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update product';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete product';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
