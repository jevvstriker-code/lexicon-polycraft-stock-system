import { NextResponse } from 'next/server';
import { initial304CatalogSeed } from '@/lib/defaultCatalog';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();

    // Check existing count
    const { count, error: countErr } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countErr) {
      return NextResponse.json({ error: countErr.message }, { status: 500 });
    }

    if (count && count >= 304) {
      return NextResponse.json({
        message: 'Catalog already seeded with 304 products.',
        count,
      });
    }

    // Insert initial catalog in chunks of 50
    const chunkSize = 50;
    let inserted = 0;

    for (let i = 0; i < initial304CatalogSeed.length; i += chunkSize) {
      const chunk = initial304CatalogSeed.slice(i, i + chunkSize);
      const { error: insertErr } = await supabase
        .from('products')
        .upsert(chunk, { onConflict: 'code' });

      if (insertErr) {
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }
      inserted += chunk.length;
    }

    // Log the seed event
    await supabase.from('activity_logs').insert([
      {
        code: 'SEED-304',
        name: 'System Initial Seed',
        type: 'physical_audit',
        change: inserted,
        new_stock: inserted,
        remarks: 'Official Lexicon Polycraft 304 SKU Catalog initialized',
      },
    ]);

    return NextResponse.json({
      message: 'Successfully seeded 304 products.',
      inserted,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown seed error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
