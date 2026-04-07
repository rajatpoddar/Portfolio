import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../i18n/LangContext';

const NAV_LINKS = [
  { key: 'nav_about',    id: 'about'    },
  { key: 'nav_services', id: 'services' },
  { key: 'nav_projects', id: 'projects' },
  { key: 'nav_skills',   id: 'skills'   },
  { key: 'nav_process',  id: 'process'  },
  { key: 'nav_contact',  id: 'contact'  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, t, toggle: toggleLang } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on scroll
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener('scroll', close, { once: true });
    return () => window.removeEventListener('scroll', close);
  }, [menuOpen]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass border-b border-white/5 py-3' : 'py-5'
      }`}
    >
      {/* ── Main row ── */}
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.05 }}
          className="text-xl font-bold gradient-text cursor-pointer shrink-0"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          RP<span className="text-white/20">.</span>
        </motion.div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ key, id }) => (
            <motion.button key={id} onClick={() => scrollTo(id)} whileHover={{ y: -1 }}
              className="text-sm text-white/50 hover:text-white transition-colors duration-200 cursor-pointer">
              {t(key)}
            </motion.button>
          ))}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          <motion.button onClick={toggleLang} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-white/10 hover:border-white/20 text-xs font-medium text-white/60 hover:text-white transition-all cursor-pointer">
            <span>{lang === 'en' ? '🇮🇳' : '🇬🇧'}</span>
            {lang === 'en' ? 'HI' : 'EN'}
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            onClick={() => scrollTo('contact')}
            className="text-sm px-5 py-2 rounded-full bg-[#6c63ff] hover:bg-[#7c73ff] text-white font-medium transition-colors duration-200 cursor-pointer">
            {t('nav_hire')}
          </motion.button>
        </div>

        {/* Mobile hamburger — clean, no overlap */}
        <button
          className="md:hidden flex flex-col justify-center gap-[5px] p-2 -mr-1 cursor-pointer rounded-lg"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}>
          <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }}
            className="block w-5 h-0.5 bg-white rounded-full origin-center" />
          <motion.span animate={{ opacity: menuOpen ? 0 : 1 }}
            className="block w-5 h-0.5 bg-white rounded-full" />
          <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }}
            className="block w-5 h-0.5 bg-white rounded-full origin-center" />
        </button>
      </div>

      {/* ── Mobile dropdown ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="md:hidden absolute top-full left-0 right-0 border-t border-white/8"
            style={{ background: 'rgba(5,5,8,0.97)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
            <div className="px-5 py-3 flex flex-col">
              {NAV_LINKS.map(({ key, id }, i) => (
                <motion.button key={id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => scrollTo(id)}
                  className="text-left py-3 px-2 text-sm text-white/70 hover:text-white transition-colors cursor-pointer border-b border-white/5 last:border-0">
                  {t(key)}
                </motion.button>
              ))}
              {/* Controls */}
              <div className="flex gap-2 pt-3 pb-1">
                <button onClick={toggleLang}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl glass border border-white/10 text-xs font-medium text-white/60 cursor-pointer">
                  {lang === 'en' ? '🇮🇳 HI' : '🇬🇧 EN'}
                </button>
                <button onClick={() => scrollTo('contact')}
                  className="flex-1 py-2.5 rounded-xl bg-[#6c63ff] text-white text-sm font-medium cursor-pointer text-center">
                  {t('nav_hire')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
