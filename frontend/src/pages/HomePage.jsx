import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { ChevronDown } from '../components/common/Icons';
import {
  CareerPathHero,
  EvidenceSources,
  CompetencyRadar,
  CareerMatchBars,
  RoadmapTimeline,
  MiniCareerDiscovery,
  HeroBackground,
} from '../components/landing/Illustrations3D';

const partners = ['kLab Kigali', 'Andela', 'Google UX', 'ALU Rwanda'];

const faqItems = [
  {
    q: 'How does the free trial work?',
    a: 'Sign up for free, upload your GitHub profile, certificates, or CV, and get a full AI-powered career analysis with matches and a personalized roadmap — no credit card required.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. Uploaded files are processed immediately and deleted. Only extracted competency signals are stored — your raw documents never persist on our servers.',
  },
  {
    q: 'How accurate are career matches?',
    a: 'Our ML model uses TF-IDF and logistic regression trained on real CVs and job postings, achieving 82%+ accuracy across 5 career paths.',
  },
  {
    q: 'What careers does KaLenz support?',
    a: 'UX Research, Health Data, Policy Analysis, Backend Development, and DevOps — with local opportunities from kLab, Andela, and Google programs.',
  },
];

const featureCards = [
  {
    title: 'Upload Your Evidence',
    description: 'Connect GitHub, upload certificates or CVs. We extract competency signals from what you have actually built — then discard the files.',
    Illustration: EvidenceSources,
    wide: true,
  },
  {
    title: 'Talent Profile & Competencies',
    description: 'AI scores 6 core competencies and generates a personalized career narrative from your evidence.',
    Illustration: CompetencyRadar,
  },
  {
    title: 'Ranked Career Matches',
    description: 'ML ranks 5 career paths — UX Research, Health Data, Policy, Backend, DevOps — with match probabilities.',
    Illustration: CareerMatchBars,
  },
  {
    title: '8-Week Roadmap',
    description: 'Bridge the gap from current fit to target with a timeline, milestones, and local Rwanda opportunities.',
    Illustration: RoadmapTimeline,
    wide: true,
  },
];

function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="border-b border-klenz-border last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-sm font-medium group-hover:text-klenz-orange transition-colors">{question}</span>
        <ChevronDown className={`w-4 h-4 text-klenz-muted shrink-0 ml-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <p className="text-sm text-klenz-muted pb-5 leading-relaxed animate-fade-in">{answer}</p>
      )}
    </div>
  );
}

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-klenz-black overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section id="home" className="relative min-h-[90vh] flex items-center">
        <HeroBackground />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <span className="badge-orange mb-6 inline-block animate-fade-in">Just Evidence</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1]">
                <span className="text-gradient-orange">Discover Your</span>
                <br />
                <span className="text-white">Real Career Path</span>
              </h1>
              <p className="text-klenz-muted text-lg mb-10 max-w-lg mx-auto lg:mx-0">
                Evidence-based career guidance for Rwandan tech graduates — from GitHub, CVs, and certificates to matched careers and roadmaps.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/signup" className="btn-orange text-base px-8 text-center">
                  Try For Free
                </Link>
                <Link to="/login" className="btn-ghost text-base px-8 text-center">
                  Log In
                </Link>
              </div>

              <div className="mt-14 pt-8 border-t border-klenz-border/50">
                <p className="text-xs text-klenz-subtle mb-4 uppercase tracking-widest">Opportunities connected to</p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                  {partners.map((name) => (
                    <span key={name} className="text-sm text-klenz-muted/60 font-medium">{name}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-end mt-8 lg:mt-0">
              <div className="scale-90 lg:scale-100">
                <CareerPathHero />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features — platform workflow */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="badge-orange mb-4 inline-block">How It Works</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">From Evidence to Career</h2>
          <p className="text-klenz-muted text-sm max-w-md mx-auto">
            Four steps that mirror the KaLenz dashboard — upload, profile, matches, roadmap.
          </p>
        </div>

        <div className="space-y-4">
          {featureCards.filter((f) => f.wide).map(({ title, description, Illustration }) => (
            <div key={title} className="panel card-glow p-8 md:p-10 grid md:grid-cols-2 gap-8 items-center hover:border-klenz-orange/20 transition-colors">
              <div>
                <h3 className="text-xl font-semibold mb-3">{title}</h3>
                <p className="text-sm text-klenz-muted leading-relaxed">{description}</p>
              </div>
              <div className="flex justify-center bg-klenz-elevated/50 rounded-2xl py-10 bg-grid-pattern bg-grid min-h-[260px] items-center">
                <Illustration />
              </div>
            </div>
          ))}

          <div className="grid md:grid-cols-2 gap-4">
            {featureCards.filter((f) => !f.wide).map(({ title, description, Illustration }) => (
              <div key={title} className="panel card-glow p-8 flex flex-col hover:border-klenz-orange/20 transition-colors">
                <div className="flex justify-center bg-klenz-elevated/50 rounded-2xl py-10 mb-6 bg-grid-pattern bg-grid min-h-[260px] items-center">
                  <Illustration />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-klenz-muted leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
          Why KaLenz For Career Discovery?
        </h2>
        <p className="text-klenz-muted text-center mb-10 text-sm">
          Extract genuine competency signals from what you&apos;ve actually built.
        </p>
        <div className="panel px-6">
          {[
            { title: 'Evidence Based Matching', content: 'We analyze GitHub repos, certificates, and CVs to extract real competency signals.' },
            { title: 'Personalized Roadmaps', content: '8-week action plans tailored to your gap analysis with concrete milestones.' },
            { title: 'Local Opportunities', content: 'Programs from kLab Kigali, Andela, Google UX Certificate, and more.' },
            { title: 'Privacy First', content: 'Files are processed and deleted immediately. Only signals are stored.' },
          ].map((item, i) => (
            <FAQItem
              key={item.title}
              question={item.title}
              answer={item.content}
              isOpen={openFaq === `about-${i}`}
              onToggle={() => setOpenFaq(openFaq === `about-${i}` ? null : `about-${i}`)}
            />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Frequently asked questions</h2>
            <p className="text-klenz-muted text-sm mb-8">Everything you need to know about KaLenz.</p>
            <div className="panel px-6">
              {faqItems.map((item, i) => (
                <FAQItem
                  key={item.q}
                  question={item.q}
                  answer={item.a}
                  isOpen={openFaq === `faq-${i}`}
                  onToggle={() => setOpenFaq(openFaq === `faq-${i}` ? null : `faq-${i}`)}
                />
              ))}
            </div>
          </div>
          <div className="hidden lg:flex flex-col items-center justify-center gap-6">
            <MiniCareerDiscovery />
            <p className="text-xs text-klenz-muted text-center max-w-[200px]">
              5 careers ranked by ML from your evidence
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 overflow-hidden">
        <HeroBackground />
        <div className="relative z-10 max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="hidden md:flex justify-center">
            <RoadmapTimeline />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Find Your Path?
            </h2>
            <p className="text-klenz-muted mb-8">
              Upload your evidence and get matched to the career that fits what you&apos;ve actually built.
            </p>
            <Link to="/signup" className="btn-orange text-base px-10 inline-block">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
