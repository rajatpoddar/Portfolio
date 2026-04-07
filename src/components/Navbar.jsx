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
  const { lang, t, toggle: toggleLang } = useLang();
  const { theme, toggle: toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on scroll
  useEffect(() => {
    if (menuOpen) {
      const close = () => setMenuOpen(false);
      window.addEventListener('scroll', close, { once: true });
      return () => window.removeEventListener('scroll', close);
    }
  }, [menuOpen]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const navBg = scrolled
    ? 'border-b'
    : '';

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}
      style={{
        background: scrolled ? 'var(--nav-bg)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderColor: 'var(--border)',
        paddingTop: scrolled ? '10px' : '18px',
        paddingBottom: scrolled ? '10px' : '18px',
      }}
    >
      {/* ── Desktop row ── */}
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.05 }}
          className="text-xl font-bold gradient-text cursor-pointer shrink-0 z-10"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          RP<span style={{ color: 'var(--text-muted)' }}>.</span>
        </motion.div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ key, id }) => (
            <motion.button key={id} onClick={() => scrollTo(id)} whileHover={{ y: -1 }}
              className="text-sm font-medium transition-colors duration-200 cursor-pointer"
              style={{ color: 'var(--text-mid)' }}
              onMouseEnter={e => e.target.style.color = 'var(--text)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-mid)'}>
              {t(key)}
            </motion.button>
          ))}
        </div>

        {/* Desktop right controls */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme toggle */}
          <motion.button onClick={toggleTheme} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            className="btn-icon w-9 h-9 flex items-center justify-center rounded-full text-base transition-all cursor-pointer"
            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}
            title={isDark ? 'Light mode' : 'Dark mode'}>
            {isDark ? '☀️' : '🌙'}
          </motion.button>
          {/* Lang toggle */}
          <motion.button onClick={toggleLang} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-mid)' }}>
            <span>{lang === 'en' ? '🇮🇳' : '🇬🇧'}</span>
            {lang === 'en' ? 'HI' : 'EN'}
          </motion.button>
          {/* CTA */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            onClick={() => scrollTo('contact')}
            className="text-sm px-5 py-2 rounded-full text-white font-medium transition-colors duration-200 cursor-pointer"
            style={{ background: 'var(--accent)' }}>
            {t('nav_hire')}
          </motion.button>
        </div>

        {/* Mobile: hamburger only — right side */}
        <button
          className="md:hidden flex flex-col justify-center gap-[5px] cursor-pointer p-2 rounded-lg transition-colors"
          style={{ background: menuOpen ? 'var(--bg-hover)' : 'transparent' }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}>
          <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }}
            className="block w-5 h-0.5 rounded-full origin-center"
            style={{ background: 'var(--text)' }} />
          <motion.span animate={{ opacity: menuOpen ? 0 : 1, scaleX: menuOpen ? 0 : 1 }}
            className="block w-5 h-0.5 rounded-full"
            style={{ background: 'var(--text)' }} />
          <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }}
            className="block w-5 h-0.5 rounded-full origin-center"
            style={{ background: 'var(--text)' }} />
        </button>
      </div>

      {/* ── Mobile dropdown menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-full left-0 right-0 border-t shadow-xl"
            style={{
              background: 'var(--nav-bg)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow)',
            }}>
            <div className="px-5 py-4 flex flex-col gap-1">
              {/* Nav links */}
              {NAV_LINKS.map(({ key, id }, i) => (
                <motion.button
                  key={id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => scrollTo(id)}
                  className="text-left py-3 px-3 rounded-xl text-sm font-medium transition-colors cursor-pointer w-full"
                  style={{ color: 'var(--text-mid)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {t(key)}
                </motion.button>
              ))}

              {/* Divider */}
              <div className="my-2 h-px" style={{ background: 'var(--border)' }} />

              {/* Controls row */}
              <div className="flex items-center gap-2 px-1">
                {/* Theme toggle */}
                <button onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer flex-1 justify-center"
                  style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-mid)' }}>
                  {isDark ? '☀️ Light' : '🌙 Dark'}
                </button>
                {/* Lang toggle */}
                <button onClick={toggleLang}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer flex-1 justify-center"
                  style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-mid)' }}>
                  {lang === 'en' ? '🇮🇳 HI' : '🇬🇧 EN'}
                </button>
              </div>

              {/* CTA */}
              <button onClick={() => scrollTo('contact')}
                className="mt-1 w-full py-3 rounded-xl text-sm font-semibold text-white text-center cursor-pointer"
                style={{ background: 'var(--accent)' }}>
                {t('nav_hire')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
