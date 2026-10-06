import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Product } from '@/types/inventory';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const products: Array<Omit<Product, 'id' | 'created_at' | 'updated_at'>> = body.products;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'No products provided for import' }, { status: 400 });
    }

    const supabase = await createClient();
    const chunkSize = 50;
    let totalImported = 0;

    for (let i = 0; i < products.length; i += chunkSize) {
      const chunk = products.slice(i, i + chunkSize);
      const { data, error } = await supabase
        .from('products')
        .upsert(chunk, { onConflict: 'code' })
        .select('id');

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      if (data) {
        totalImported += data.length;
      }
    }

    await supabase.from('activity_logs').insert([
      {
        code: 'EXCEL-IMPORT',
        name: 'Spreadsheet Import',
        type: 'physical_audit',
        change: totalImported,
        new_stock: totalImported,
        remarks: `Imported ${totalImported} items into database`,
      },
    ]);

    return NextResponse.json({ success: true, count: totalImported });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Import failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
