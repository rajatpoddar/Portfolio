import { motion } from 'framer-motion';
import { process } from '../data';
import { useInView } from '../hooks/useInView';
import { useLang } from '../i18n/LangContext';

export default function Process() {
  const [ref, inView] = useInView(0.1);
  const { t, lang } = useLang();

  return (
    <section id="process" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(108,99,255,0.04) 0%, transparent 70%)' }} />
      <div className="max-w-6xl mx-auto">
        <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }} className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-0.5 bg-[#f59e0b]" />
            <span className="text-sm text-[#f59e0b] font-medium tracking-wider uppercase">{t('process_label')}</span>
            <div className="w-8 h-0.5 bg-[#f59e0b]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('process_h1')}<br />
            <span className="gradient-text">{t('process_h2')}</span>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">{t('process_sub')}</p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {process.map((step, i) => (
              <motion.div key={step.step}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                whileHover={{ y: -6 }}
                className="group relative flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-20 h-20 rounded-2xl glass border border-white/10 flex items-center justify-center text-3xl group-hover:border-[#f59e0b]/30 transition-all duration-300">
                    {step.icon}
                  </motion.div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #6c63ff)' }}>{i + 1}</div>
                </div>
                <div className="text-xs font-mono text-white/20 mb-2">{step.step}</div>
                <h3 className="font-bold mb-2 text-sm">{lang === 'hinglish' ? step.title : step.titleEn}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{lang === 'hinglish' ? step.desc : step.descEn}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 glass rounded-2xl p-8 border border-white/5 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(245,158,11,0.07) 0%, transparent 60%)' }} />
          <h3 className="text-2xl font-bold mb-2 relative z-10">{t('process_ready')}</h3>
          <p className="text-white/40 mb-6 relative z-10">{t('process_ready_sub')}</p>
          <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(245,158,11,0.35)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="relative z-10 px-8 py-3.5 rounded-full text-white font-semibold text-sm cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
            {t('process_cta')}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
