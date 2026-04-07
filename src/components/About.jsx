import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { useLang } from '../i18n/LangContext';

export default function About() {
  const [ref, inView] = useInView(0.2);
  const { t } = useLang();

  const traits = [
    { icon: '🧩', key: 'about_trait1' },
    { icon: '⚡', key: 'about_trait2' },
    { icon: '🤖', key: 'about_trait3' },
    { icon: '📈', key: 'about_trait4' },
  ];

  const metrics = [
    { key: 'about_card_m1', value: '4+' },
    { key: 'about_card_m2', value: '20+' },
    { key: 'about_card_m3', value: '1000+' },
    { key: 'about_card_m4', value: '₹50L+' },
  ];

  return (
    <section id="about" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)' }} />

      <div className="max-w-6xl mx-auto" ref={ref}>
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }} className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-0.5 bg-[#f59e0b]" />
              <span className="text-sm text-[#f59e0b] font-medium tracking-wider uppercase">{t('about_label')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              {t('about_h1')}
              <br />
              <span className="gradient-text">{t('about_h2')}</span>
            </h2>
            <div className="flex flex-col gap-4 text-white/55 leading-relaxed">
              <p>{t('about_p1')} <span className="text-white/80">{t('about_p1_em')}</span>.</p>
              <p>{t('about_p2')}</p>
              <p>{t('about_p3')} <span className="text-white/80">{t('about_p3_em')}</span>.</p>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {traits.map(({ icon, key }) => (
                <motion.span key={key} whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-sm text-white/70 cursor-default">
                  {icon} {t(key)}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }} className="relative mt-8 md:mt-0">
            <div className="glass rounded-2xl p-6 md:p-8 gradient-border glow relative overflow-hidden">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #6c63ff)' }}>RP</div>
                <div>
                  <div className="font-bold text-lg">Rajat Poddar</div>
                  <div className="text-sm text-white/40">{t('about_card_role')}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {metrics.map(({ key, value }) => (
                  <div key={key} className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                    <div className="text-2xl font-bold gradient-text">{value}</div>
                    <div className="text-xs text-white/40 mt-1">{t(key)}</div>
                  </div>
                ))}
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />
            </div>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="hidden sm:block absolute -bottom-6 -left-6 glass rounded-xl px-4 py-3 border border-white/10 text-sm">
              <div className="text-white/40 text-xs mb-1">{t('about_building')}</div>
              <div className="font-medium">{t('about_building_what')}</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
