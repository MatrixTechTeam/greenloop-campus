import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Leaf, ArrowRight, MapPin, Brain, Trophy,
  ShoppingBag, Users, Globe, ChevronDown
} from 'lucide-react'

const features = [
  {
    icon: MapPin,
    title: 'Report Waste',
    desc: 'Spot a waste hotspot on campus? Pin it on the map and report it in seconds.',
  },
  {
    icon: Brain,
    title: 'AI Classification',
    desc: 'Our Gemini-powered AI analyzes your waste photo and tells you exactly how to dispose of it.',
  },
  {
    icon: Trophy,
    title: 'Earn Eco Points',
    desc: 'Every verified report earns you points. Climb the leaderboard and flex your green streak.',
  },
  {
    icon: ShoppingBag,
    title: 'Green Marketplace',
    desc: 'Redeem your Eco Points for sustainable products and campus rewards.',
  },
  {
    icon: Globe,
    title: 'Track Your Impact',
    desc: 'See exactly how much CO₂ you\'ve saved. Small actions, measurable change.',
  },
  {
    icon: Users,
    title: 'Community Challenges',
    desc: 'Weekly eco-challenges keep the whole campus engaged and competing for good.',
  },
]



export default function LandingPage() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const blobRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!blobRef.current) return
      const { clientX, clientY } = e
      blobRef.current.style.transform = `translate(${clientX * 0.02}px, ${clientY * 0.02}px)`
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="landing">
      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div className="nav-inner">
          <div className="logo">
            <Leaf size={22} strokeWidth={2.5} />
            <span>GreenLoop</span>
          </div>
          <button className="nav-cta" onClick={() => navigate('/login')}>
            Get Started <ArrowRight size={15} />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero" ref={heroRef}>
        <div className="hero-bg">
          <div className="blob blob-1" ref={blobRef} />
          <div className="blob blob-2" />
          <div className="grid-lines" />
        </div>

        <div className="hero-content">
          <div className="badge">
            <Leaf size={12} />
        
          </div>

          <h1 className="hero-title">
            Campus waste,<br />
            <span className="gradient-text">reimagined.</span>
          </h1>

          <p className="hero-sub">
            GreenLoop turns every piece of trash into a chance to earn, learn,
            and lead. AI-powered waste classification. Real eco impact. All on your campus.
          </p>

          <div className="hero-actions">
            <button className="cta-primary" onClick={() => navigate('/login')}>
              Get Started
              <ArrowRight size={18} />
            </button>
            <button className="cta-ghost" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
              See how it works
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="phone-mockup">
            <div className="phone-screen">
              <div className="phone-header">
                <Leaf size={14} className="phone-logo" />
                <span>GreenLoop</span>
              </div>
              <div className="phone-stat">
                <span className="stat-num">+240</span>
                <span className="stat-lbl">Eco Points Today</span>
              </div>
              <div className="phone-bar-wrap">
                {['Plastic', 'Paper', 'Glass', 'Metal'].map((type, i) => (
                  <div key={type} className="phone-bar-row">
                    <span>{type}</span>
                    <div className="phone-bar">
                      <div className="phone-bar-fill" style={{ width: `${[72, 54, 88, 40][i]}%`, animationDelay: `${i * 0.15}s` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="phone-badge">
                <Trophy size={13} />
                <span>#3 on Leaderboard</span>
              </div>
            </div>
          </div>
          <div className="floating-card card-1">
            <Globe size={14} />
            <span>1.2kg CO₂ saved</span>
          </div>
          <div className="floating-card card-2">
            <Brain size={14} />
            <span>AI verified</span>
          </div>
        </div>
      </section>



      {/* ── FEATURES ── */}
      <section className="features-section" id="features">
        <div className="section-header reveal">
          <span className="section-tag">What we offer</span>
          <h2>Everything your campus needs<br />to go green</h2>
        </div>
        <div className="features-grid">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="feature-card reveal" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="feature-icon">
                <Icon size={20} strokeWidth={1.8} />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

     
      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-logo">
          <Leaf size={16} strokeWidth={2.5} />
          <span>GreenLoop</span>
        </div>
        <p className="footer-text">
          Powered by <strong>The GreenSpark Team</strong> in Collaboration with{' '}
          <strong>DSN Topfaith</strong> and <strong>Eco Pulse Society</strong>
        </p>
        <p className="footer-copy">© 2026 GreenLoop. Built for the Eco Hackathon.</p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .landing {
          font-family: 'DM Sans', sans-serif;
          background: #f8fdf5;
          color: #111;
          overflow-x: hidden;
        }

        /* NAVBAR */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(248, 253, 245, 0.85);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(34, 197, 94, 0.12);
        }
        .nav-inner {
          max-width: 1100px; margin: 0 auto;
          padding: 0 2rem; height: 64px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .logo {
          display: flex; align-items: center; gap: 8px;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 700; font-size: 1.2rem; color: #166534;
        }
        .logo svg { color: #16a34a; }
        .nav-cta {
          display: flex; align-items: center; gap-6px; gap: 6px;
          background: #16a34a; color: #fff;
          border: none; cursor: pointer;
          padding: 0.5rem 1.2rem; border-radius: 999px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem; font-weight: 500;
          transition: background 0.2s, transform 0.15s;
        }
        .nav-cta:hover { background: #15803d; transform: translateY(-1px); }

        /* HERO */
        .hero {
          min-height: 100vh; padding: 120px 2rem 80px;
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 3rem; align-items: center; position: relative;
        }
        .hero-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
        }
        .blob {
          position: absolute; border-radius: 50%;
          filter: blur(80px); opacity: 0.18;
        }
        .blob-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, #4ade80, #16a34a);
          top: -100px; left: -100px;
          transition: transform 0.8s ease;
        }
        .blob-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #86efac, #dcfce7);
          bottom: 100px; right: -50px;
          animation: float 8s ease-in-out infinite;
        }
        .grid-lines {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(34,197,94,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,197,94,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }

        .hero-content { position: relative; z-index: 1; }

        .badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: #dcfce7; color: #15803d;
          border: 1px solid #86efac;
          padding: 0.35rem 0.9rem; border-radius: 999px;
          font-size: 0.78rem; font-weight: 600; letter-spacing: 0.03em;
          margin-bottom: 1.5rem;
          animation: fadeSlideUp 0.6s ease both;
        }

        .hero-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: clamp(2.8rem, 5vw, 4.2rem);
          font-weight: 800; line-height: 1.05;
          color: #111; margin-bottom: 1.25rem;
          animation: fadeSlideUp 0.6s 0.1s ease both;
        }
        .gradient-text {
          background: linear-gradient(135deg, #16a34a, #4ade80, #15803d);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-size: 1.05rem; line-height: 1.7; color: #4b5563;
          max-width: 480px; margin-bottom: 2rem;
          animation: fadeSlideUp 0.6s 0.2s ease both;
        }

        .hero-actions {
          display: flex; gap: 1rem; flex-wrap: wrap;
          animation: fadeSlideUp 0.6s 0.3s ease both;
        }

        .cta-primary {
          display: flex; align-items: center; gap: 8px;
          background: #16a34a; color: #fff;
          border: none; cursor: pointer;
          padding: 0.85rem 1.8rem; border-radius: 999px;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem; font-weight: 600;
          box-shadow: 0 4px 24px rgba(22,163,74,0.3);
          transition: all 0.2s;
        }
        .cta-primary:hover {
          background: #15803d;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(22,163,74,0.4);
        }
        .cta-primary.large { font-size: 1.05rem; padding: 1rem 2.2rem; }

        .cta-ghost {
          display: flex; align-items: center; gap: 6px;
          background: transparent; color: #374151;
          border: 1.5px solid #d1d5db; cursor: pointer;
          padding: 0.85rem 1.6rem; border-radius: 999px;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem; font-weight: 500;
          transition: all 0.2s;
        }
        .cta-ghost:hover { border-color: #16a34a; color: #16a34a; }

        /* PHONE MOCKUP */
        .hero-visual {
          position: relative; z-index: 1;
          display: flex; justify-content: center; align-items: center;
          animation: fadeSlideUp 0.8s 0.2s ease both;
        }
        .phone-mockup {
          width: 240px; height: 420px;
          background: #fff;
          border-radius: 32px;
          border: 2px solid rgba(34,197,94,0.2);
          box-shadow: 0 32px 80px rgba(22,163,74,0.15), 0 8px 24px rgba(0,0,0,0.08);
          padding: 1.5rem 1.2rem;
          display: flex; flex-direction: column; gap: 1rem;
          position: relative;
        }
        .phone-mockup::before {
          content: ''; position: absolute;
          top: 12px; left: 50%; transform: translateX(-50%);
          width: 60px; height: 5px;
          background: #e5e7eb; border-radius: 999px;
        }
        .phone-header {
          display: flex; align-items: center; gap: 6px;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 700; font-size: 0.85rem; color: #166534;
          margin-top: 0.5rem;
        }
        .phone-logo { color: #16a34a; }
        .phone-stat {
          background: linear-gradient(135deg, #16a34a, #4ade80);
          border-radius: 16px; padding: 1rem;
          color: #fff;
        }
        .stat-num {
          display: block;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.8rem; font-weight: 800;
        }
        .stat-lbl { font-size: 0.75rem; opacity: 0.85; }
        .phone-bar-wrap { display: flex; flex-direction: column; gap: 0.5rem; }
        .phone-bar-row {
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
          font-size: 0.7rem; color: #6b7280;
        }
        .phone-bar-row > span { width: 38px; }
        .phone-bar {
          flex: 1; height: 6px; background: #f0fdf4; border-radius: 999px; overflow: hidden;
        }
        .phone-bar-fill {
          height: 100%; background: linear-gradient(90deg, #16a34a, #4ade80);
          border-radius: 999px;
          animation: growBar 1s ease both;
        }
        @keyframes growBar {
          from { width: 0 !important; }
        }
        .phone-badge {
          display: flex; align-items: center; gap: 6px;
          background: #fefce8; color: #854d0e;
          border: 1px solid #fde68a;
          padding: 0.5rem 0.75rem; border-radius: 10px;
          font-size: 0.72rem; font-weight: 600;
        }

        .floating-card {
          position: absolute;
          display: flex; align-items: center; gap: 6px;
          background: #fff; border: 1px solid rgba(34,197,94,0.2);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          padding: 0.5rem 0.9rem; border-radius: 999px;
          font-size: 0.78rem; font-weight: 600; color: #15803d;
          white-space: nowrap;
        }
        .card-1 { top: 40px; right: -20px; animation: floatCard 4s ease-in-out infinite; }
        .card-2 { bottom: 60px; left: -30px; animation: floatCard 4s 2s ease-in-out infinite; }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        /* STATS */
        .stats-section {
          background: #fff;
          border-top: 1px solid #f0fdf4;
          border-bottom: 1px solid #f0fdf4;
          padding: 3rem 2rem;
        }
        .stats-grid {
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem;
          text-align: center;
        }
        .stat-card { padding: 1rem; }
        .stat-value {
          display: block;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 2.4rem; font-weight: 800; color: #16a34a;
          line-height: 1;
        }
        .stat-label {
          display: block; font-size: 0.85rem; color: #6b7280;
          margin-top: 0.4rem; font-weight: 500;
        }

        /* FEATURES */
        .features-section {
          padding: 6rem 2rem; max-width: 1100px; margin: 0 auto;
        }
        .section-header { text-align: center; margin-bottom: 3.5rem; }
        .section-tag {
          display: inline-block;
          background: #dcfce7; color: #15803d;
          padding: 0.3rem 0.9rem; border-radius: 999px;
          font-size: 0.8rem; font-weight: 600; letter-spacing: 0.05em;
          margin-bottom: 1rem; text-transform: uppercase;
        }
        .section-header h2 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          font-weight: 800; line-height: 1.15; color: #111;
        }
        .features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
        }
        .feature-card {
          background: #fff; border: 1px solid #f0fdf4;
          border-radius: 20px; padding: 1.8rem;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(22,163,74,0.1);
          border-color: #bbf7d0;
        }
        .feature-icon {
          width: 44px; height: 44px;
          background: #f0fdf4; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          color: #16a34a; margin-bottom: 1rem;
        }
        .feature-card h3 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.05rem; font-weight: 700; color: #111;
          margin-bottom: 0.5rem;
        }
        .feature-card p { font-size: 0.9rem; color: #6b7280; line-height: 1.6; }

        /* CTA SECTION */
        .cta-section { padding: 6rem 2rem; }
        .cta-inner {
          max-width: 680px; margin: 0 auto;
          background: linear-gradient(135deg, #166534, #16a34a);
          border-radius: 28px; padding: 4rem 3rem;
          text-align: center; position: relative; overflow: hidden;
        }
        .cta-blob {
          position: absolute; width: 300px; height: 300px;
          background: rgba(255,255,255,0.07);
          border-radius: 50%; top: -100px; right: -80px;
          pointer-events: none;
        }
        .cta-inner h2 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 800; color: #fff; margin-bottom: 1rem;
          position: relative; z-index: 1;
        }
        .cta-inner p {
          color: rgba(255,255,255,0.8); font-size: 1rem;
          margin-bottom: 2rem; position: relative; z-index: 1;
        }
        .cta-inner .cta-primary {
          background: #fff; color: #16a34a;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          position: relative; z-index: 1;
        }
        .cta-inner .cta-primary:hover {
          background: #f0fdf4;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }

        /* FOOTER */
        .footer {
          background: #fff; border-top: 1px solid #f0fdf4;
          padding: 2.5rem 2rem; text-align: center;
        }
        .footer-logo {
          display: inline-flex; align-items: center; gap: 7px;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 700; font-size: 1rem; color: #166534;
          margin-bottom: 0.75rem;
        }
        .footer-logo svg { color: #16a34a; }
        .footer-text {
          font-size: 0.85rem; color: #6b7280; margin-bottom: 0.4rem;
        }
        .footer-text strong { color: #374151; }
        .footer-copy { font-size: 0.78rem; color: #9ca3af; }

        /* REVEAL ANIMATIONS */
        .reveal {
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal.animate-in { opacity: 1; transform: translateY(0); }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .hero {
            grid-template-columns: 1fr; padding: 100px 1.5rem 60px;
            text-align: center;
          }
          .hero-sub { max-width: 100%; }
          .hero-actions { justify-content: center; }
          .hero-visual { display: none; }
          .features-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .cta-inner { padding: 2.5rem 1.5rem; }
        }
      `}</style>
    </div>
  )
}