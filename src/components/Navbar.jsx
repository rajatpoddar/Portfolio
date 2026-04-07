import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../i18n/LangContext';
import { useTheme } from '../context/ThemeContext';

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
  const { lang, t, toggle } = useLang();
  const { theme, toggle: toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <motion.div whileHover={{ scale: 1.05 }}
          className="text-xl font-bold gradient-text cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          RP<span className="text-white/20">.</span>
        </motion.div>

        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ key, id }) => (
            <motion.button key={id} onClick={() => scrollTo(id)} whileHover={{ y: -1 }}
              className="text-sm text-white/50 hover:text-white transition-colors duration-200 cursor-pointer">
              {t(key)}
            </motion.button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {/* Theme toggle */}
          <motion.button onClick={toggleTheme} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="btn-icon w-9 h-9 flex items-center justify-center rounded-full glass border border-white/10 hover:border-white/20 text-sm transition-all cursor-pointer"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </motion.button>
          {/* Lang toggle */}
          <motion.button onClick={toggle} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
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

        <button className="md:hidden flex flex-col gap-1.5 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 8 : 0 }}
            className="block w-6 h-0.5 bg-white origin-center transition-all" />
          <motion.span animate={{ opacity: menuOpen ? 0 : 1 }}
            className="block w-6 h-0.5 bg-white" />
          <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -8 : 0 }}
            className="block w-6 h-0.5 bg-white origin-center transition-all" />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/5 overflow-hidden">
            <div className="px-6 py-4 flex flex-col gap-4">
              {NAV_LINKS.map(({ key, id }) => (
                <button key={id} onClick={() => scrollTo(id)}
                  className="text-left text-white/70 hover:text-white transition-colors py-1 cursor-pointer">
                  {t(key)}
                </button>
              ))}
              <div className="flex gap-3 mt-1">
                <button onClick={toggle}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full glass border border-white/10 text-xs font-medium text-white/60 cursor-pointer">
                  {lang === 'en' ? '🇮🇳 HI' : '🇬🇧 EN'}
                </button>
                <button onClick={() => scrollTo('contact')}
                  className="flex-1 text-sm px-5 py-2.5 rounded-full bg-[#6c63ff] text-white font-medium cursor-pointer text-center">
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
