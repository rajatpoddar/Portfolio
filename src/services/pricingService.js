import { supabase } from '../lib/supabase';
import { BASE_PRICES, FEATURE_PRICES as DEFAULT_FEATURE_PRICES, MAINTENANCE_PLANS } from '../data/pricingLogic';

// Cache so we don't re-fetch on every keystroke
let _cache = null;

/**
 * Fetch pricing from Supabase. Falls back to hardcoded defaults if table is empty.
 * @returns {Promise<Record<string, number>>}
 */
export async function fetchPricing() {
  if (_cache) return _cache;
  const { data, error } = await supabase.from('pricing').select('feature_name, price');
  if (error || !data || data.length === 0) {
    _cache = { ...DEFAULT_FEATURE_PRICES };
    return _cache;
  }
  const map = {};
  data.forEach(({ feature_name, price }) => { map[feature_name] = Number(price); });
  // Merge with defaults so any missing features still have a price
  _cache = { ...DEFAULT_FEATURE_PRICES, ...map };
  return _cache;
}

export function invalidatePricingCache() {
  _cache = null;
}

/**
 * Save a single feature price to Supabase (upsert)
 */
export async function savePricing(featureName, price) {
  invalidatePricingCache();
  return supabase
    .from('pricing')
    .upsert({ feature_name: featureName, price: Number(price) }, { onConflict: 'feature_name' });
}

/**
 * Calculate total using dynamic pricing
 */
export function calculateTotalDynamic(projectType, features = [], maintenancePlan = null, featurePrices = {}) {
  const base = BASE_PRICES[projectType] || 0;
  const featuresTotal = features.reduce((sum, f) => sum + (featurePrices[f] ?? DEFAULT_FEATURE_PRICES[f] ?? 0), 0);
  const maintenance = maintenancePlan ? (MAINTENANCE_PLANS[maintenancePlan]?.price || 0) : 0;
  return { base, featuresTotal, maintenance, subtotal: base + featuresTotal };
}

export { BASE_PRICES, MAINTENANCE_PLANS };
