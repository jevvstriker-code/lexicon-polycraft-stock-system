-- Dedicated schema isolation for Lexicon Polycraft Stock Verification System
CREATE SCHEMA IF NOT EXISTS lexicon_polycraft_app;

-- PostgREST exposure for the dedicated schema
ALTER ROLE authenticator SET pgrst.db_schemas = 'public, lexicon_polycraft_app';
NOTIFY pgrst, 'reload config';

-- Grants
GRANT USAGE ON SCHEMA lexicon_polycraft_app TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA lexicon_polycraft_app TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA lexicon_polycraft_app TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA lexicon_polycraft_app TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA lexicon_polycraft_app GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA lexicon_polycraft_app GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA lexicon_polycraft_app GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- Products table
CREATE TABLE IF NOT EXISTS lexicon_polycraft_app.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    fsn TEXT NOT NULL DEFAULT 'Repeater',
    packaging_type TEXT NOT NULL DEFAULT 'bundle',
    pack_size INTEGER NOT NULL DEFAULT 1,
    min_stock INTEGER NOT NULL DEFAULT 0,
    max_stock INTEGER NOT NULL DEFAULT 500,
    stock INTEGER NOT NULL DEFAULT 0,
    photo TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS lexicon_polycraft_app.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES lexicon_polycraft_app.products(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    change INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    remarks TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Covering index on foreign key
CREATE INDEX IF NOT EXISTS idx_activity_logs_product_id ON lexicon_polycraft_app.activity_logs(product_id);

-- Round verifications table
CREATE TABLE IF NOT EXISTS lexicon_polycraft_app.round_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES lexicon_polycraft_app.products(id) ON DELETE CASCADE UNIQUE,
    verified BOOLEAN DEFAULT true,
    verified_at TIMESTAMPTZ DEFAULT now()
);

-- Covering index on foreign key
CREATE INDEX IF NOT EXISTS idx_round_verifications_product_id ON lexicon_polycraft_app.round_verifications(product_id);

-- Enable RLS
ALTER TABLE lexicon_polycraft_app.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE lexicon_polycraft_app.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lexicon_polycraft_app.round_verifications ENABLE ROW LEVEL SECURITY;

-- Public access policies (No login requirement)
CREATE POLICY "Allow public read products" ON lexicon_polycraft_app.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert products" ON lexicon_polycraft_app.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON lexicon_polycraft_app.products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete products" ON lexicon_polycraft_app.products FOR DELETE USING (true);

CREATE POLICY "Allow public read activity_logs" ON lexicon_polycraft_app.activity_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert activity_logs" ON lexicon_polycraft_app.activity_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update activity_logs" ON lexicon_polycraft_app.activity_logs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete activity_logs" ON lexicon_polycraft_app.activity_logs FOR DELETE USING (true);

CREATE POLICY "Allow public read round_verifications" ON lexicon_polycraft_app.round_verifications FOR SELECT USING (true);
CREATE POLICY "Allow public insert round_verifications" ON lexicon_polycraft_app.round_verifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update round_verifications" ON lexicon_polycraft_app.round_verifications FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete round_verifications" ON lexicon_polycraft_app.round_verifications FOR DELETE USING (true);
