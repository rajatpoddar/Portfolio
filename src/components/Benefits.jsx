import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { useLang } from '../i18n/LangContext';

export default function Benefits() {
  const [ref, inView] = useInView(0.1);
  const { t } = useLang();
  const benefits = t('benefits');

  return (
    <section id="benefits" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }} className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-0.5 bg-[#10b981]" />
            <span className="text-sm text-[#10b981] font-medium tracking-wider uppercase">{t('benefits_label')}</span>
            <div className="w-8 h-0.5 bg-[#10b981]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('benefits_h1')}<br />
            <span className="gradient-text">{t('benefits_h2')}</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {(Array.isArray(benefits) ? benefits : []).map((b, i) => (
            <motion.div key={b.title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="t-card rounded-2xl p-6 hover:border-[#10b981]/25 transition-all duration-300">
              <div className="text-3xl mb-4">{b.icon}</div>
              <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text)' }}>{b.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
