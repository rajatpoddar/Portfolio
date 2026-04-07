import { motion } from 'framer-motion';
import { testimonials } from '../data';
import { useInView } from '../hooks/useInView';
import { useLang } from '../i18n/LangContext';

function TestimonialCard({ item, index }) {
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      whileHover={{ y: -6 }}
      className="group relative glass rounded-2xl p-7 border border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(circle at 50% 0%, ${item.color}10 0%, transparent 60%)` }} />
      <div className="text-5xl font-serif leading-none mb-4" style={{ color: `${item.color}30` }}>"</div>
      <div className="flex gap-0.5 mb-3">
        {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}
      </div>
      <p className="text-white/60 leading-relaxed mb-5 text-sm">"{item.text}"</p>
      <div className="flex items-center gap-3 pt-4 border-t border-white/5">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}80)` }}>
          {item.avatar}
        </div>
        <div>
          <div className="font-semibold text-sm">{item.name}</div>
          <div className="text-xs text-white/40">{item.role}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  const [ref, inView] = useInView(0.1);
  const { t } = useLang();

  return (
    <section id="testimonials" className="py-28 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }} className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-0.5 bg-[#10b981]" />
            <span className="text-sm text-[#10b981] font-medium tracking-wider uppercase">{t('testimonials_label')}</span>
            <div className="w-8 h-0.5 bg-[#10b981]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('testimonials_h1')}<br />
            <span className="gradient-text">{t('testimonials_h2')}</span>
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((item, i) => <TestimonialCard key={item.name} item={item} index={i} />)}
        </div>
      </div>
    </section>
  );
}
