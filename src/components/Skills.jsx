import { useState } from 'react';
import { motion } from 'framer-motion';
import { skills } from '../data';
import { useInView } from '../hooks/useInView';

const categoryColors = {
  Frontend: '#6c63ff',
  Backend: '#00d4ff',
  'AI & Automation': '#a855f7',
  Tools: '#f59e0b',
};

function SkillBar({ name, level, color, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="group"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-white/70 group-hover:text-white transition-colors">{name}</span>
        <span className="text-xs font-mono" style={{ color }}>{level}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: index * 0.07 + 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }}
        />
      </div>
    </motion.div>
  );
}

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState('Frontend');
  const [ref, inView] = useInView(0.1);
  const categories = Object.keys(skills);

  return (
    <section id="skills" className="py-28 px-6 relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)' }} />

      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-0.5 bg-[#a855f7]" />
            <span className="text-sm text-[#a855f7] font-medium tracking-wider uppercase">Tech Stack</span>
            <div className="w-8 h-0.5 bg-[#a855f7]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Tools I Use to
            <br />
            <span className="gradient-text">Build & Automate</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-[240px_1fr] gap-6">
          {/* Category tabs — horizontal scroll on mobile, vertical on desktop */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex md:flex-col gap-2 overflow-x-auto pb-1 md:pb-0 md:overflow-visible"
          >
            {categories.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                whileHover={{ x: 0 }}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left cursor-pointer shrink-0 md:shrink ${
                  activeCategory === cat
                    ? 'glass border border-white/10 text-white'
                    : 'text-white/40 hover:text-white/70 bg-white/[0.02]'
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0 transition-all duration-200"
                  style={{
                    background: categoryColors[cat],
                    boxShadow: activeCategory === cat ? `0 0 8px ${categoryColors[cat]}` : 'none',
                  }}
                />
                {cat}
              </motion.button>
            ))}
          </motion.div>

          {/* Skills panel */}
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl p-6 border border-white/5"
          >
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background: categoryColors[activeCategory],
                  boxShadow: `0 0 12px ${categoryColors[activeCategory]}`,
                }}
              />
              <h3 className="font-bold text-lg">{activeCategory}</h3>
            </div>
            <div className="flex flex-col gap-5">
              {skills[activeCategory].map((skill, i) => (
                <SkillBar
                  key={skill.name}
                  name={skill.name}
                  level={skill.level}
                  color={categoryColors[activeCategory]}
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
