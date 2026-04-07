import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import WhoCanUse from '../components/WhoCanUse';
import Services from '../components/Services';
import Benefits from '../components/Benefits';
import Projects from '../components/Projects';
import Skills from '../components/Skills';
import Process from '../components/Process';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function PublicSite() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Navbar />
      <Hero />
      <About />
      <WhoCanUse />
      <Services />
      <Benefits />
      <Projects />
      <Skills />
      <Process />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}
