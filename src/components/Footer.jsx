import { motion } from 'framer-motion';
import { useLang } from '../i18n/LangContext';

export default function Footer() {
  const { t } = useLang();
  const waMsg = encodeURIComponent(t('contact_wa_prefill'));

  return (
    <footer className="py-10 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xl font-bold gradient-text mb-1">RP.</div>
          <p className="text-xs text-white/30">{t('footer_tagline')}</p>
        </div>
        <p className="text-xs text-white/20 text-center">
          © {new Date().getFullYear()} Rajat Poddar
        </p>
        <div className="flex items-center gap-4">
          <a href={`https://wa.me/917250580175?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
            className="text-xs text-green-400/60 hover:text-green-400 transition-colors flex items-center gap-1">
            💬 WhatsApp
          </a>
          <a href="mailto:solutionspoddar@gmail.com"
            className="text-xs text-white/30 hover:text-white transition-colors">Email</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
            className="text-xs text-white/30 hover:text-white transition-colors">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
