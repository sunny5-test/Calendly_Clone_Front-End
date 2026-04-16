'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/utils/auth';

/* ───────── Intersection Observer Hook ───────── */
function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsInView(true); },
      { threshold: 0.15, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, isInView];
}

/* ───────── Animated Counter ───────── */
function AnimatedCounter({ end, suffix = '', prefix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, isInView] = useInView();
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);
  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

/* ───────── SVG Icons ───────── */
const CalendarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CheckIcon = ({ color = '#006BFF' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ───────── Feature data ───────── */
const steps = [
  {
    num: '01',
    title: 'Connect your calendars',
    desc: 'Calendly connects up to six calendars to automate scheduling with real-time availability.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #006BFF 0%, #0052CC 100%)',
  },
  {
    num: '02',
    title: 'Set your availability',
    desc: 'Control your calendar with detailed availability settings, scheduling rules, buffers, and more.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #00C853 0%, #009624 100%)',
  },
  {
    num: '03',
    title: 'Connect conferencing',
    desc: 'Sync your video conferencing tools and set preferences for in-person meetings or calls.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
  },
  {
    num: '04',
    title: 'Customize event types',
    desc: 'Choose from pre-built templates or create custom event types for any meeting you need.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #FF6B00 0%, #E65100 100%)',
  },
  {
    num: '05',
    title: 'Share your link',
    desc: 'Easily book meetings by embedding scheduling links on your website, landing pages, or emails.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
  },
];

const integrations = [
  { name: 'Google Calendar', color: '#4285F4', icon: 'G' },
  { name: 'Microsoft Teams', color: '#6264A7', icon: 'T' },
  { name: 'Zoom', color: '#2D8CFF', icon: 'Z' },
  { name: 'Salesforce', color: '#00A1E0', icon: 'S' },
  { name: 'Slack', color: '#4A154B', icon: 'S' },
  { name: 'HubSpot', color: '#FF7A59', icon: 'H' },
  { name: 'Outlook', color: '#0078D4', icon: 'O' },
  { name: 'Zapier', color: '#FF4A00', icon: 'Z' },
];




/* ═══════════════════════════════════════════════════════════
   LANDING PAGE COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  /* Redirect if already authenticated */
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard');
    }
  }, [router]);

  /* Navbar scroll effect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Prevent body scroll when mobile nav open */
  useEffect(() => {
    document.body.style.overflow = mobileNav ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileNav]);

  /* Section refs for scroll-in animations */
  const [heroRef, heroVisible] = useInView();
  const [stepsRef, stepsVisible] = useInView();
  const [intRef, intVisible] = useInView();

  const [secRef, secVisible] = useInView();
  const [ctaRef, ctaVisible] = useInView();

  return (
    <div className="landing-page">
      {/* ════════ NAVBAR ════════ */}
      <nav className={`landing-nav ${scrolled ? 'landing-nav--scrolled' : ''}`} id="landing-navbar">
        <div className="landing-nav__inner">
          {/* Logo */}
          <Link href="/" className="landing-nav__logo" id="landing-logo">
            <div className="landing-nav__logo-icon">
              <CalendarIcon />
            </div>
            <span className="landing-nav__logo-text">Calendly</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="landing-nav__links">
            <a href="#features" className="landing-nav__link">Features</a>
            <a href="#integrations" className="landing-nav__link">Integrations</a>

            <a href="#security" className="landing-nav__link">Security</a>
          </div>

          {/* Actions */}
          <div className="landing-nav__actions">
            <Link href="/login" className="landing-nav__link" id="landing-login">Log In</Link>
            <Link href="/login" className="landing-btn landing-btn--primary landing-btn--sm" id="landing-signup">
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="landing-nav__hamburger"
            onClick={() => setMobileNav(true)}
            aria-label="Open menu"
            id="landing-mobile-toggle"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      {mobileNav && (
        <div className="landing-mobile-overlay" onClick={() => setMobileNav(false)}>
          <div className="landing-mobile-drawer" onClick={e => e.stopPropagation()}>
            <button className="landing-mobile-close" onClick={() => setMobileNav(false)} aria-label="Close menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="landing-mobile-links">
              <a href="#features" className="landing-mobile-link" onClick={() => setMobileNav(false)}>Features</a>
              <a href="#integrations" className="landing-mobile-link" onClick={() => setMobileNav(false)}>Integrations</a>

              <a href="#security" className="landing-mobile-link" onClick={() => setMobileNav(false)}>Security</a>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', margin: '16px 0' }} />
              <Link href="/login" className="landing-mobile-link" onClick={() => setMobileNav(false)}>Log In</Link>
              <Link href="/login" className="landing-btn landing-btn--primary" style={{ width: '100%', marginTop: 8 }} onClick={() => setMobileNav(false)}>Get Started Free</Link>
            </div>
          </div>
        </div>
      )}


      {/* ════════ HERO SECTION ════════ */}
      <section className="landing-hero" id="hero">
        {/* Floating gradient blobs */}
        <div className="landing-hero__blob landing-hero__blob--1" />
        <div className="landing-hero__blob landing-hero__blob--2" />
        <div className="landing-hero__blob landing-hero__blob--3" />

        <div ref={heroRef} className={`landing-hero__content ${heroVisible ? 'landing-visible' : ''}`}>
          <div className="landing-hero__badge">
            <span className="landing-hero__badge-dot" />
            Easy scheduling ahead
          </div>

          <h1 className="landing-hero__title">
            Scheduling made <span className="landing-gradient-text">simple</span> for <span className="landing-gradient-text-alt">everyone</span>
          </h1>

          <p className="landing-hero__subtitle">
            Calendly is the modern scheduling platform that makes &ldquo;finding time&rdquo; a breeze. When connecting is easy, your teams can get more done.
          </p>

          <div className="landing-hero__actions">
            <Link href="/login" className="landing-btn landing-btn--primary landing-btn--lg" id="hero-signup">
              Sign up for free
              <ArrowRight />
            </Link>
            <a href="#features" className="landing-btn landing-btn--glass landing-btn--lg" id="hero-demo">
              See how it works
            </a>
          </div>

          <p className="landing-hero__note">Free forever — No credit card required</p>
        </div>

        {/* Hero visual — CSS-based scheduling widget mockup */}
        <div ref={heroRef} className={`landing-hero__visual ${heroVisible ? 'landing-visible' : ''}`}>
          <div className="landing-hero__widget">
            {/* Widget header */}
            <div className="landing-widget__header">
              <div className="landing-widget__avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <div className="landing-widget__name">Palvash Kumar</div>
                <div className="landing-widget__event">30 Minute Meeting</div>
              </div>
            </div>
            {/* Mini calendar */}
            <div className="landing-widget__calendar">
              <div className="landing-widget__month">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                <span>April 2026</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div className="landing-widget__days">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                  <span key={d} className="landing-widget__day-label">{d}</span>
                ))}
              </div>
              <div className="landing-widget__dates">
                {Array.from({length: 30}, (_, i) => i + 1).map(d => (
                  <span
                    key={d}
                    className={`landing-widget__date ${d === 16 ? 'landing-widget__date--selected' : ''} ${[5,6,12,13,19,20,26,27].includes(d) ? 'landing-widget__date--disabled' : ''}`}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
            {/* Time slots */}
            <div className="landing-widget__slots">
              <div className="landing-widget__slot-title">Available Times</div>
              {['9:00 AM', '10:30 AM', '1:00 PM', '3:30 PM'].map((t, i) => (
                <div key={t} className={`landing-widget__slot ${i === 1 ? 'landing-widget__slot--active' : ''}`}>{t}</div>
              ))}
            </div>
          </div>

          {/* Floating badges around widget */}
          <div className="landing-hero__float landing-hero__float--1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Meeting Confirmed!</span>
          </div>
          <div className="landing-hero__float landing-hero__float--2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006BFF" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>Calendar Synced</span>
          </div>
          <div className="landing-hero__float landing-hero__float--3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            <span>Team Booking</span>
          </div>
        </div>
      </section>


      {/* ════════ TRUSTED BY ════════ */}
      <section className="landing-trusted">
        <p className="landing-trusted__label">Trusted by 86% of Fortune 500 companies</p>
        <div className="landing-trusted__logos">
          {['Twilio', 'Dropbox', 'Lyft', 'Compass', 'eBay', 'Vonage'].map(name => (
            <span key={name} className="landing-trusted__logo">{name}</span>
          ))}
        </div>
      </section>


      {/* ════════ FEATURES / HOW IT WORKS ════════ */}
      <section className="landing-section" id="features">
        <div ref={stepsRef} className={`landing-section__header ${stepsVisible ? 'landing-visible' : ''}`}>
          <span className="landing-section__tag">How it works</span>
          <h2 className="landing-section__title">Get started in five simple steps</h2>
          <p className="landing-section__subtitle">From connecting your calendar to sharing your link — set up takes just minutes.</p>
        </div>

        <div className="landing-steps">
          {steps.map((step, i) => {
            const [ref, visible] = useInView();
            return (
              <div
                key={step.num}
                ref={ref}
                className={`landing-step ${visible ? 'landing-visible' : ''}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="landing-step__icon" style={{ background: step.gradient }}>
                  {step.icon}
                </div>
                <div className="landing-step__num">{step.num}</div>
                <h3 className="landing-step__title">{step.title}</h3>
                <p className="landing-step__desc">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>


      {/* ════════ INTEGRATIONS ════════ */}
      <section className="landing-section landing-section--alt" id="integrations">
        <div ref={intRef} className={`landing-section__header ${intVisible ? 'landing-visible' : ''}`}>
          <span className="landing-section__tag">Integrations</span>
          <h2 className="landing-section__title">Connect to the tools you already use</h2>
          <p className="landing-section__subtitle">Boost productivity with 100+ integrations across your favorite platforms.</p>
        </div>

        <div className="landing-integrations">
          {integrations.map((int, i) => {
            const [ref, visible] = useInView();
            return (
              <div
                key={int.name}
                ref={ref}
                className={`landing-integration ${visible ? 'landing-visible' : ''}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="landing-integration__icon" style={{ background: int.color }}>
                  {int.icon}
                </div>
                <span className="landing-integration__name">{int.name}</span>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <a href="#" className="landing-btn landing-btn--glass">
            View all integrations <ArrowRight />
          </a>
        </div>
      </section>





      {/* ════════ SECURITY ════════ */}
      <section className="landing-section" id="security">
        <div ref={secRef} className={`landing-security ${secVisible ? 'landing-visible' : ''}`}>
          <div className="landing-security__content">
            <span className="landing-section__tag" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>Enterprise Security</span>
            <h2 className="landing-security__title">Built to keep your organization secure</h2>
            <p className="landing-security__desc">
              Keep your scheduling data secure with enterprise-grade admin management, security integrations, data governance, compliance audits, and privacy protections.
            </p>
            <div className="landing-security__badges">
              {['SOC 2', 'GDPR', 'SSO/SAML', 'SCIM'].map(b => (
                <span key={b} className="landing-security__badge-item">{b}</span>
              ))}
            </div>
          </div>
          <div className="landing-security__visual">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div className="landing-security__shield-check">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11.5 14.5 15 9" />
              </svg>
            </div>
          </div>
        </div>
      </section>


      {/* ════════ FINAL CTA ════════ */}
      <section className="landing-section">
        <div ref={ctaRef} className={`landing-cta ${ctaVisible ? 'landing-visible' : ''}`}>
          <h2 className="landing-cta__title">Get started in seconds — for free.</h2>
          <p className="landing-cta__desc">Join millions of professionals who trust Calendly for effortless scheduling.</p>
          <div className="landing-cta__actions">
            <Link href="/login" className="landing-btn landing-btn--primary landing-btn--lg" id="cta-signup">
              Start for free <ArrowRight />
            </Link>
          </div>
        </div>
      </section>


      {/* ════════ FOOTER ════════ */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <Link href="/" className="landing-nav__logo">
              <div className="landing-nav__logo-icon">
                <CalendarIcon />
              </div>
              <span className="landing-nav__logo-text" style={{ color: 'white' }}>Calendly</span>
            </Link>
            <p className="landing-footer__tagline">Easy scheduling ahead</p>
          </div>

          <div className="landing-footer__grid">
            {[
              {
                title: 'Product',
                links: ['Scheduling', 'Event Types', 'Availability', 'Integrations', 'Mobile App'],
              },
              {
                title: 'Solutions',
                links: ['For Individuals', 'Small Business', 'Enterprise', 'Sales', 'Recruiting'],
              },
              {
                title: 'Resources',
                links: ['Help Center', 'Blog', 'Developer Docs', 'Community', 'Release Notes'],
              },
              {
                title: 'Company',
                links: ['About Us', 'Careers', 'Security', 'Privacy', 'Terms'],
              },
            ].map(col => (
              <div key={col.title} className="landing-footer__col">
                <h4 className="landing-footer__heading">{col.title}</h4>
                {col.links.map(link => (
                  <a key={link} href="#" className="landing-footer__link">{link}</a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="landing-footer__bottom">
          <p>&copy; {new Date().getFullYear()} Calendly Clone. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
