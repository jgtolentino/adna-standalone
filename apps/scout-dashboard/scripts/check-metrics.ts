// scripts/check-metrics.ts
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !key) {
  throw new Error('Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
}

// Try public schema first - PostgREST might only expose public
const supabase = createClient(url, key, {
  db: { schema: 'public' },
});

async function main() {
  console.log('🔍 Checking Supabase Scout Dashboard Metrics...\n');

  let hasErrors = false;

  // 1. KPI Summary
  console.log('1️⃣  Checking scout.v_kpi_summary...');
  const kpis = await supabase.from('v_kpi_summary').select('*').limit(1);
  if (kpis.error) {
    console.error('   ❌ ERROR:', kpis.error.message);
    hasErrors = true;
  } else if (kpis.data && kpis.data.length > 0) {
    console.log(`   ✅ OK: v_kpi_summary (${kpis.data.length} row)`);
  } else {
    console.warn('   ⚠️  WARN: v_kpi_summary returned 0 rows');
  }

  // 2. Transaction Trends
  console.log('\n2️⃣  Checking scout.v_tx_trends...');
  const trends = await supabase.from('v_tx_trends').select('*').limit(5);
  if (trends.error) {
    console.error('   ❌ ERROR:', trends.error.message);
    hasErrors = true;
  } else if (trends.data && trends.data.length > 0) {
    console.log(`   ✅ OK: v_tx_trends (${trends.data.length} rows)`);
  } else {
    console.warn('   ⚠️  WARN: v_tx_trends returned 0 rows');
  }

  // 3. Product Mix
  console.log('\n3️⃣  Checking scout.v_product_mix...');
  const mix = await supabase.from('v_product_mix').select('*').limit(5);
  if (mix.error) {
    console.error('   ❌ ERROR:', mix.error.message);
    hasErrors = true;
  } else if (mix.data && mix.data.length > 0) {
    console.log(`   ✅ OK: v_product_mix (${mix.data.length} rows)`);
  } else {
    console.warn('   ⚠️  WARN: v_product_mix returned 0 rows');
  }

  // 4. Brand Performance
  console.log('\n4️⃣  Checking scout.v_brand_performance...');
  const brands = await supabase.from('v_brand_performance').select('*').limit(5);
  if (brands.error) {
    console.error('   ❌ ERROR:', brands.error.message);
    hasErrors = true;
  } else if (brands.data && brands.data.length > 0) {
    console.log(`   ✅ OK: v_brand_performance (${brands.data.length} rows)`);
  } else {
    console.warn('   ⚠️  WARN: v_brand_performance returned 0 rows');
  }

  // 5. Geography Regions
  console.log('\n5️⃣  Checking scout.v_geo_regions...');
  const geo = await supabase.from('v_geo_regions').select('*').limit(5);
  if (geo.error) {
    console.error('   ❌ ERROR:', geo.error.message);
    hasErrors = true;
  } else if (geo.data && geo.data.length > 0) {
    console.log(`   ✅ OK: v_geo_regions (${geo.data.length} rows)`);
  } else {
    console.warn('   ⚠️  WARN: v_geo_regions returned 0 rows');
  }

  // 6. Data Health Summary (optional - just warn if missing)
  console.log('\n6️⃣  Checking public.v_data_health_summary (optional)...');
  const health = await supabase.from('v_data_health_summary').select('*').limit(5);
  if (health.error) {
    console.warn('   ⚠️  WARN:', health.error.message);
    console.warn('   ℹ️  This view is optional for now - dashboard will function without it');
  } else if (health.data && health.data.length > 0) {
    console.log(`   ✅ OK: v_data_health_summary (${health.data.length} rows)`);
  } else {
    console.warn('   ⚠️  WARN: v_data_health_summary returned 0 rows');
  }

  console.log('\n' + '='.repeat(60));
  if (hasErrors) {
    console.error('❌ FAIL: One or more critical Scout views are missing or erroring');
    process.exit(1);
  } else {
    console.log('✅ SUCCESS: All critical Scout dashboard views are accessible');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('\n💥 FATAL ERROR:', err);
  process.exit(1);
});
