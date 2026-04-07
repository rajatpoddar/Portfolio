import { motion } from 'framer-motion';
import { FEATURE_GROUPS, FEATURE_PRICES } from '../../data/features';

/**
 * @param {{ selected: string[], onChange: (features: string[]) => void }} props
 */
export default function FeatureSelector({ selected, onChange }) {
  const toggle = (feature) => {
    if (selected.includes(feature)) {
      onChange(selected.filter((f) => f !== feature));
    } else {
      onChange([...selected, feature]);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {FEATURE_GROUPS.map((group) => (
        <div key={group.label}>
          <div className="text-xs text-white/30 uppercase tracking-wider font-medium mb-2.5">
            {group.label}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {group.features.map((feature) => {
              const isSelected = selected.includes(feature);
              const price = FEATURE_PRICES[feature] || 0;
              return (
                <motion.button
                  key={feature}
                  type="button"
                  onClick={() => toggle(feature)}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#6c63ff]/50 bg-[#6c63ff]/10 text-white'
                      : 'border-white/8 bg-white/[0.02] text-white/50 hover:border-white/15 hover:text-white/70'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? 'bg-[#6c63ff] border-[#6c63ff]' : 'border-white/20'
                    }`}>
                      {isSelected && <span className="text-white text-[9px] leading-none">✓</span>}
                    </div>
                    {feature}
                  </div>
                  <span className={`shrink-0 font-mono ${isSelected ? 'text-[#6c63ff]' : 'text-white/25'}`}>
                    +₹{price.toLocaleString('en-IN')}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
