import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { useLang } from '../i18n/LangContext';
import { businessTypes } from '../data';

export default function WhoCanUse() {
  const [ref, inView] = useInView(0.1);
  const { t } = useLang();

  return (
    <section id="who" className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(245,158,11,0.05) 0%, transparent 60%)' }} />

      <div className="max-w-6xl mx-auto">
        <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }} className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-0.5 bg-[#f59e0b]" />
            <span className="text-sm text-[#f59e0b] font-medium tracking-wider uppercase">{t('who_label')}</span>
            <div className="w-8 h-0.5 bg-[#f59e0b]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('who_h1')}<br />
            <span className="gradient-text">{t('who_h2')}</span>
          </h2>
          <p style={{ color: 'var(--text-muted)' }} className="max-w-xl mx-auto">{t('who_sub')}</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {businessTypes.map((biz, i) => (
            <motion.div key={biz.label}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group t-card rounded-2xl p-5 hover:border-[#f59e0b]/30 transition-all duration-300 text-center cursor-default">
              <div className="text-3xl mb-3">{biz.icon}</div>
              <div className="font-semibold text-sm mb-1.5" style={{ color: 'var(--text)' }}>{biz.label}</div>
              <div className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{biz.benefit}</div>
            </motion.div>
          ))}
        </div>

        {/* Trust strip */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 t-card rounded-2xl p-5 grid grid-cols-2 md:flex md:flex-wrap gap-4 md:gap-6 justify-center items-center">
          {[
            { icon: '✅', text: 'Technical knowledge ki zaroorat nahi' },
            { icon: '⚡', text: '500+ ghante ka kaam bachaya' },
            { icon: '🇮🇳', text: 'Indian businesses ke liye banaya' },
            { icon: '💬', text: 'Hindi mein support milega' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-mid)' }}>
              <span>{icon}</span> {text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
