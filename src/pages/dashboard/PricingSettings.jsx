import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FEATURE_GROUPS } from '../../data/features';
import { BASE_PRICES, MAINTENANCE_PLANS } from '../../data/pricingLogic';
import { fetchPricing, savePricing, invalidatePricingCache } from '../../services/pricingService';
import { useToast } from '../../components/ui/Toast';

function PriceInput({ label, value, onSave, color = '#6c63ff' }) {
  const [val, setVal] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const toast = useToast();

  useEffect(() => { setVal(String(value)); setDirty(false); }, [value]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(Number(val));
    setSaving(false);
    setDirty(false);
    toast('Price updated', 'success');
  };

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/70 flex-1">{label}</span>
      <div className="flex items-center gap-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/30">₹</span>
          <input
            type="number"
            value={val}
            onChange={(e) => { setVal(e.target.value); setDirty(true); }}
            className="w-28 bg-white/[0.04] border border-white/8 rounded-lg pl-7 pr-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#6c63ff]/50 transition-colors"
          />
        </div>
        {dirty && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
          >
            {saving ? '...' : 'Save'}
          </motion.button>
        )}
      </div>
    </div>
  );
}

export default function PricingSettings() {
  const [featurePrices, setFeaturePrices] = useState({});
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    const prices = await fetchPricing();
    setFeaturePrices(prices);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSaveFeature = async (featureName, price) => {
    await savePricing(featureName, price);
    invalidatePricingCache();
    setFeaturePrices((p) => ({ ...p, [featureName]: price }));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#6c63ff]/30 border-t-[#6c63ff] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col gap-7 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Pricing Settings</h1>
        <p className="text-sm text-white/30 mt-1">All prices are private and used to calculate quotations dynamically.</p>
      </div>

      {/* Base project prices (read-only display) */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#6c63ff]" />
          <h2 className="font-bold text-sm">Base Project Prices</h2>
          <span className="ml-auto text-xs text-white/25">Edit in pricingLogic.js</span>
        </div>
        <div className="px-6 py-2">
          {Object.entries(BASE_PRICES).map(([type, price]) => (
            <div key={type} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
              <span className="text-sm text-white/70">{type}</span>
              <span className="text-sm font-mono text-[#6c63ff]">₹{price.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feature prices — editable */}
      {FEATURE_GROUPS.map((group, gi) => (
        <motion.div
          key={group.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.05 }}
          className="glass rounded-2xl border border-white/5 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00d4ff]" />
            <h2 className="font-bold text-sm">{group.label}</h2>
            <span className="ml-auto text-xs text-white/25">{group.features.length} features</span>
          </div>
          <div className="px-6 py-2">
            {group.features.map((feature) => (
              <PriceInput
                key={feature}
                label={feature}
                value={featurePrices[feature] ?? 0}
                onSave={(price) => handleSaveFeature(feature, price)}
                color="#00d4ff"
              />
            ))}
          </div>
        </motion.div>
      ))}

      {/* Maintenance plans (read-only) */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#a855f7]" />
          <h2 className="font-bold text-sm">Maintenance Plans</h2>
          <span className="ml-auto text-xs text-white/25">Edit in pricingLogic.js</span>
        </div>
        <div className="px-6 py-2">
          {Object.entries(MAINTENANCE_PLANS).map(([key, plan]) => (
            <div key={key} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
              <div>
                <div className="text-sm text-white/70">{plan.label}</div>
                <div className="text-xs text-white/30 mt-0.5">{plan.desc}</div>
              </div>
              <span className="text-sm font-mono text-[#a855f7]">₹{plan.price.toLocaleString('en-IN')}/mo</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
