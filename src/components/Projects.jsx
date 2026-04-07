import { motion } from 'framer-motion';
import { projects } from '../data';
import { useInView } from '../hooks/useInView';
import { useLang } from '../i18n/LangContext';

function ProjectCard({ project, index }) {
  const { t } = useLang();
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative glass rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-300">
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${project.color}, transparent)` }} />
      <div className="p-7">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: `${project.color}18`, color: project.color }}>{project.category}</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/40">{project.tag}</span>
        </div>
        <h3 className="text-xl font-bold mb-5">{project.title}</h3>
        <div className="flex flex-col gap-4 mb-5">
          <div>
            <span className="text-xs font-semibold text-red-400/80 uppercase tracking-wider">{t('projects_problem')}</span>
            <p className="text-sm text-white/50 mt-1 leading-relaxed">{project.problem}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: project.color }}>{t('projects_solution')}</span>
            <p className="text-sm text-white/50 mt-1 leading-relaxed">{project.solution}</p>
          </div>
        </div>
        <div className="rounded-xl p-4 mb-5"
          style={{ background: `${project.color}0d`, border: `1px solid ${project.color}20` }}>
          <div className="text-xs font-semibold text-green-400/80 uppercase tracking-wider mb-1">{t('projects_result')}</div>
          <p className="text-sm text-white/70 leading-relaxed">{project.result}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span key={tech} className="text-xs px-2.5 py-1 rounded-md bg-white/5 text-white/40 border border-white/5">{tech}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const [ref, inView] = useInView(0.1);
  const { t } = useLang();

  return (
    <section id="projects" className="py-28 px-6 relative">
      <div className="absolute right-0 top-1/3 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)' }} />
      <div className="max-w-6xl mx-auto">
        <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }} className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-0.5 bg-[#00d4ff]" />
            <span className="text-sm text-[#00d4ff] font-medium tracking-wider uppercase">{t('projects_label')}</span>
            <div className="w-8 h-0.5 bg-[#00d4ff]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('projects_h1')}<br />
            <span className="gradient-text">{t('projects_h2')}</span>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">{t('projects_sub')}</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, i) => <ProjectCard key={project.title} project={project} index={i} />)}
        </div>
      </div>
    </section>
  );
}
