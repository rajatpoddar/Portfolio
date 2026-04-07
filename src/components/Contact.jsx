import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { leadsDb } from '../lib/db';
import { useLang } from '../i18n/LangContext';

export default function Contact() {
  const [ref, inView] = useInView(0.1);
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useLang();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await leadsDb.create({ name: form.name, email: form.email, company: form.company, message: form.message, status: 'new' });
    setLoading(false);
    setSent(true);
  };

  const waMsg = encodeURIComponent(t('contact_wa_prefill'));

  return (
    <section id="contact" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(245,158,11,0.07) 0%, transparent 60%)' }} />
      <div className="max-w-5xl mx-auto">
        <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }} className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-0.5 bg-[#f59e0b]" />
            <span className="text-sm text-[#f59e0b] font-medium tracking-wider uppercase">{t('contact_label')}</span>
            <div className="w-8 h-0.5 bg-[#f59e0b]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('contact_h1')}<br />
            <span className="gradient-text">{t('contact_h2')}</span>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">{t('contact_sub')}</p>
        </motion.div>

        <div className="grid md:grid-cols-[1fr_360px] gap-8">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}>
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-2xl p-10 border border-white/5 text-center h-full flex flex-col items-center justify-center gap-4">
                <div className="text-5xl">🎉</div>
                <h3 className="text-2xl font-bold">{t('contact_sent_title')}</h3>
                <p className="text-white/50">{t('contact_sent_sub')}</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', company: '', message: '' }); }}
                  className="mt-2 text-sm text-[#f59e0b] hover:underline cursor-pointer">
                  {t('contact_send_another')}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 border border-white/5 flex flex-col gap-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-white/40 font-medium uppercase tracking-wider">{t('contact_name')} *</label>
                    <input name="name" value={form.name} onChange={handleChange} required
                      placeholder="Ramesh Agarwal"
                      className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#f59e0b]/50 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-white/40 font-medium uppercase tracking-wider">{t('contact_email')} *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required
                      placeholder="aap@email.com"
                      className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#f59e0b]/50 transition-colors" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-white/40 font-medium uppercase tracking-wider">{t('contact_company')}</label>
                  <input name="company" value={form.company} onChange={handleChange}
                    placeholder="Agarwal Traders, Jaipur"
                    className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#f59e0b]/50 transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-white/40 font-medium uppercase tracking-wider">{t('contact_message')} *</label>
                  <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
                    placeholder={t('contact_placeholder_msg')}
                    className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#f59e0b]/50 transition-colors resize-none" />
                </div>
                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(245,158,11,0.35)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl text-white font-semibold text-sm disabled:opacity-60 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      {t('contact_sending')}
                    </span>
                  ) : t('contact_send')}
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-col gap-4">

            {/* WhatsApp — primary CTA */}
            <a href={`https://wa.me/917250580175?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl border border-green-500/30 hover:border-green-500/60 transition-all duration-200 group"
              style={{ background: 'rgba(16,185,129,0.08)' }}>
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-2xl shrink-0">💬</div>
              <div className="flex-1">
                <div className="font-bold text-green-400">{t('contact_wa_cta')}</div>
                <div className="text-xs text-white/40 mt-0.5">{t('contact_wa_sub')}</div>
              </div>
              <span className="text-white/20 group-hover:text-white/50 transition-colors text-lg">→</span>
            </a>

            {/* Demo offer */}
            <div className="glass rounded-2xl p-5 border border-[#f59e0b]/20"
              style={{ background: 'rgba(245,158,11,0.05)' }}>
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-bold text-sm text-[#f59e0b] mb-1">{t('contact_demo')}</div>
              <p className="text-xs text-white/50 leading-relaxed">{t('contact_demo_sub')}</p>
            </div>

            {/* Available */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-medium">{t('contact_available')}</span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{t('contact_response')}</p>
            </div>

            {/* Steps */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <h4 className="text-sm font-bold mb-4">{t('contact_next')}</h4>
              <div className="flex flex-col gap-3">
                {['contact_step1', 'contact_step2', 'contact_step3', 'contact_step4'].map((key, i) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
                      {i + 1}
                    </div>
                    <span className="text-xs text-white/50">{t(key)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
