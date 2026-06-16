import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { ChevronDown } from '../components/common/Icons';
import { CAREER_DESCRIPTIONS, CAREER_NAMES } from '../data/careers';
import { CAREER_ICONS } from '../data/roadmapData';

const stats = [
  { label: '89% Model Accuracy' },
  { label: '5 Career Paths' },
  { label: 'AI-Powered Insights' },
];

const steps = [
  {
    num: '1',
    title: 'Upload CV',
    description: 'Drop your PDF or Word CV — we extract skills and discard the file.',
    Icon: UploadStepIcon,
  },
  {
    num: '2',
    title: 'Get AI Analysis',
    description: 'Our ML model ranks you across 5 tech career paths with confidence scores.',
    Icon: AnalysisStepIcon,
  },
  {
    num: '3',
    title: 'Explore Your Path',
    description: 'View your roadmap, career matches, and chat with your AI advisor.',
    Icon: PathStepIcon,
  },
];

const faqItems = [
  {
    q: 'What careers does KarrerLenz analyze?',
    a: 'We analyze CVs across 5 tech career paths: Software Development, Data & AI, Cybersecurity & Networking, Product & Project Management, and UI/UX & Digital Design.',
  },
  {
    q: 'How accurate is the career prediction?',
    a: 'Our model achieves 89% accuracy trained on real CV data combined with O*NET occupational profiles.',
  },
  {
    q: 'Is my CV data stored?',
    a: 'Your CV is analyzed and immediately deleted. Only the career insights are saved to your profile.',
  },
  {
    q: 'Do I need to pay?',
    a: 'KarrerLenz is completely free for Rwandan tech graduates.',
  },
  {
    q: 'What file formats are supported?',
    a: 'We support PDF and DOCX (Word) files up to 10MB.',
  },
  {
    q: 'How does the AI chat work?',
    a: 'After your CV analysis, our AI advisor can answer questions about your career path, skills to learn, and opportunities in Rwanda.',
  },
];

function UploadStepIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
      <rect x="6" y="8" width="20" height="16" rx="3" stroke="#FF8C00" strokeWidth="1.5" />
      <path d="M16 20V12M16 12l-3 3M16 12l3 3" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AnalysisStepIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="10" stroke="#FF8C00" strokeWidth="1.5" />
      <path d="M11 18l3 3 7-8" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PathStepIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
      <path d="M8 24 L16 8 L24 24" stroke="#FF8C00" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="16" cy="8" r="2.5" fill="#1D9E75" />
      <circle cx="8" cy="24" r="2.5" fill="#FF8C00" />
      <circle cx="24" cy="24" r="2.5" fill="#FF8C00" />
    </svg>
  );
}

function HeroOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div
        className="absolute w-[480px] h-[480px] rounded-full blur-[100px] opacity-40 animate-gradient-shift"
        style={{
          background: 'radial-gradient(circle, rgba(255,140,0,0.35) 0%, transparent 70%)',
          top: '-10%',
          right: '5%',
        }}
      />
      <div
        className="absolute w-[360px] h-[360px] rounded-full blur-[80px] opacity-30 animate-gradient-shift"
        style={{
          background: 'radial-gradient(circle, rgba(29,158,117,0.25) 0%, transparent 70%)',
          bottom: '10%',
          left: '-5%',
          animationDelay: '4s',
        }}
      />
      <div className="absolute inset-0 bg-hero-mesh animate-gradient-shift" />
    </div>
  );
}

function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="border-b border-klenz-border last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-sm font-medium text-white group-hover:text-klenz-orange transition-colors">
          {question}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-klenz-muted shrink-0 ml-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
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
    <div className="min-h-screen bg-klenz-black overflow-x-hidden page-enter">
      <Navbar />

      {/* Hero */}
      <section id="home" className="relative section-spacing overflow-hidden">
        <HeroOrbs />
        <div className="content-container relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <h1 className="text-[2.25rem] sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] mb-6 text-white">
              Discover Your Tech Career Path
            </h1>
            <p className="text-klenz-muted text-base sm:text-lg mb-10 max-w-[520px] leading-relaxed">
              AI-powered career discovery built for Rwandan tech graduates — upload your CV,
              get matched to the right path, and explore your future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/signup" className="btn-primary text-center px-8">
                Get Started Free
              </Link>
              <a href="#how-it-works" className="btn-outline text-center px-8">
                See How It Works
              </a>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-16 text-center">
            <p className="text-sm text-klenz-subtle mb-6">
              Built for Rwanda&apos;s next generation of tech professionals
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {stats.map(({ label }) => (
                <span key={label} className="badge-purple">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section-spacing bg-klenz-surface/50">
        <div className="content-container">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">How It Works</h2>
            <p className="text-klenz-muted text-sm max-w-md mx-auto">
              Three simple steps from CV to career clarity
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {steps.map(({ num, title, description, Icon }) => (
              <div key={title} className="card card-glow text-center p-6 lg:p-8">
                <div className="text-4xl font-extrabold text-klenz-orange mb-4">{num}</div>
                <div className="flex justify-center mb-4">
                  <Icon />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm text-klenz-muted leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Paths */}
      <section id="careers" className="section-spacing">
        <div className="content-container">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">Career Paths</h2>
            <p className="text-klenz-muted text-sm max-w-lg mx-auto">
              Five in-demand tech careers we analyze and match you against
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
            {CAREER_NAMES.map((career, i) => (
              <div
                key={career}
                className={`card career-card-hover p-6 lg:col-span-2 ${
                  i === 3 ? 'lg:col-start-2' : i === 4 ? 'lg:col-start-4' : ''
                }`}
              >
                <span className="text-3xl mb-4 block">{CAREER_ICONS[career]}</span>
                <h3 className="font-semibold text-base mb-2">{career}</h3>
                <p className="text-sm text-klenz-muted leading-relaxed line-clamp-2">
                  {CAREER_DESCRIPTIONS[career]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chat Assistant Preview */}
      <section id="chat-preview" className="section-spacing bg-klenz-surface/50">
        <div className="content-container">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                Meet Your AI Career Advisor
              </h2>
              <p className="text-klenz-muted text-sm leading-relaxed mb-8 max-w-md">
                Ask anything about your career path, skills to learn, companies hiring in Rwanda,
                or how to build your portfolio.
              </p>
              <Link to="/signup" className="btn-primary inline-block">
                Start Chatting
              </Link>
            </div>
            <div className="card card-purple p-5 sm:p-6 space-y-3">
              <div className="flex justify-start animate-slide-up">
                <div className="chat-bubble-ai max-w-[90%] px-4 py-3 text-sm leading-relaxed">
                  Hi! I&apos;ve analyzed your CV. You&apos;re a great fit for Data &amp; AI.
                  Want to know what skills to learn first?
                </div>
              </div>
              <div className="flex justify-end animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="chat-bubble-user max-w-[85%] px-4 py-3 text-sm leading-relaxed">
                  Yes! What should I focus on?
                </div>
              </div>
              <div className="flex justify-start animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="chat-bubble-ai max-w-[90%] px-4 py-3 text-sm leading-relaxed">
                  Start with Python and SQL fundamentals, then move to scikit-learn.
                  Here&apos;s a 3-month roadmap...
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section-spacing">
        <div className="content-container max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Frequently Asked Questions</h2>
            <p className="text-klenz-muted text-sm">Everything you need to know about KarrerLenz</p>
          </div>
          <div className="card px-6">
            {faqItems.map((item, i) => (
              <FAQItem
                key={item.q}
                question={item.q}
                answer={item.a}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
