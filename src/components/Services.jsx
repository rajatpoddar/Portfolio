import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { services } from '../data';
import { useLang } from '../i18n/LangContext';

function ServiceCard({ service, index }) {
  const { t, lang } = useLang();
  const title = lang === 'hinglish' ? service.title : service.titleEn;
  const problem = lang === 'hinglish' ? service.problem : service.problemEn;
  const solution = lang === 'hinglish' ? service.solution : service.solutionEn;
  const outcome = lang === 'hinglish' ? service.outcome : service.outcomeEn;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group relative glass rounded-2xl p-7 border border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden cursor-default">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(circle at 50% 0%, ${service.color}15 0%, transparent 60%)` }} />
      <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${service.color}, transparent)` }} />
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5"
        style={{ background: `${service.color}18`, border: `1px solid ${service.color}30` }}>
        {service.icon}
      </div>
      <h3 className="text-lg font-bold mb-5">{title}</h3>
      <div className="flex flex-col gap-4">
        {[
          { labelKey: 'services_problem', text: problem, color: '#ef4444' },
          { labelKey: 'services_solution', text: solution, color: service.color },
          { labelKey: 'services_outcome', text: outcome, color: '#10b981' },
        ].map(({ labelKey, text, color }) => (
          <div key={labelKey} className="flex gap-3">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md mt-0.5 shrink-0 h-fit"
              style={{ background: `${color}18`, color }}>{t(labelKey)}</span>
            <p className="text-sm text-white/50 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Services() {
  const [ref, inView] = useInView(0.1);
  const { t } = useLang();

  return (
    <section id="services" className="py-28 px-6 relative">
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      <div className="max-w-6xl mx-auto">
        <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }} className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-0.5 bg-[#f59e0b]" />
            <span className="text-sm text-[#f59e0b] font-medium tracking-wider uppercase">{t('services_label')}</span>
            <div className="w-8 h-0.5 bg-[#f59e0b]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('services_h1')}<br />
            <span className="gradient-text">{t('services_h2')}</span>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">{t('services_sub')}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {services.map((service, i) => <ServiceCard key={service.titleEn} service={service} index={i} />)}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12">
          <p className="text-white/40 mb-4">{t('services_not_sure')}</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 py-3 rounded-full glass border border-white/10 hover:border-[#f59e0b]/50 text-sm font-medium transition-all duration-200 cursor-pointer">
            {t('services_cta')}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
