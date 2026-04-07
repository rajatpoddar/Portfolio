import { motion } from 'framer-motion';
import { useLang } from '../i18n/LangContext';

function Orbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />
      <motion.div animate={{ x: [0, -50, 0], y: [0, 60, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.14) 0%, transparent 70%)' }} />
      <motion.div animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
        className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
    </div>
  );
}

function Badge({ children, delay = 0 }) {
  return (
    <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: 'backOut' }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass text-xs text-white/60 border border-white/10">
      {children}
    </motion.span>
  );
}

export default function Hero() {
  const { t } = useLang();
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const waMsg = encodeURIComponent(t('contact_wa_prefill'));

  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  const headline = t('hero_headline').split('\n');

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Orbs />
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div variants={containerVariants} initial="hidden" animate="visible"
          className="flex flex-col items-center gap-6">

          <motion.div variants={itemVariants} className="flex items-center gap-2 flex-wrap justify-center">
            <Badge delay={0.2}><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> {t('hero_badge_available')}</Badge>
            <Badge delay={0.3}>🤖 {t('hero_badge_ai')}</Badge>
            <Badge delay={0.4}>🇮🇳 {t('hero_badge_startup')}</Badge>
          </motion.div>

          <motion.h1 variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.08] tracking-tight px-2">
            <span className="gradient-text">{headline[0]}</span>
            {headline[1] && <><br /><span className="text-white/90">{headline[1]}</span></>}
          </motion.h1>

          <motion.p variants={itemVariants}
            className="max-w-2xl text-lg md:text-xl text-white/55 leading-relaxed">
            {t('hero_sub')}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-center mt-2">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(245,158,11,0.4)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollTo('contact')}
              className="px-8 py-3.5 rounded-full text-white font-semibold text-sm cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
              {t('hero_cta_hire')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => scrollTo('projects')}
              className="px-8 py-3.5 rounded-full glass border border-white/10 hover:border-white/20 text-white font-semibold text-sm transition-all duration-200 cursor-pointer">
              {t('hero_cta_work')}
            </motion.button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <a href={`https://wa.me/917250580175?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-green-400/80 hover:text-green-400 transition-colors">
              <span>💬</span> {t('hero_demo')}
            </a>
          </motion.div>

          <motion.div variants={itemVariants}
            className="grid grid-cols-2 sm:flex sm:flex-wrap gap-6 sm:gap-8 justify-center mt-6 pt-8 border-t border-white/5 w-full">
            {[
              { value: '20+', key: 'hero_stat_projects' },
              { value: '1000+', key: 'hero_stat_hours' },
              { value: '8+', key: 'hero_stat_industries' },
              { value: '100%', key: 'hero_stat_satisfaction' },
            ].map(({ value, key }) => (
              <div key={key} className="text-center">
                <div className="text-2xl font-bold gradient-text">{value}</div>
                <div className="text-xs text-white/40 mt-0.5">{t(key)}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs text-white/20">scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="w-0.5 h-8 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
      </motion.div>
    </section>
  );
}
