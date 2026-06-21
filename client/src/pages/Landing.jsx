import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary/30 relative overflow-x-hidden font-body-md">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm">
        <div className="flex justify-between items-center max-w-container-max mx-auto px-gutter h-16">
          <div className="flex items-center gap-8">
            <span className="text-headline-md font-headline-md font-bold text-primary cursor-pointer select-none">
              TripCraft AI
            </span>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-on-surface-variant font-medium text-label-sm font-label-sm hover:text-primary transition-colors duration-200">Explore</a>
              <a href="#how-it-works" className="text-on-surface-variant font-medium text-label-sm font-label-sm hover:text-primary transition-colors duration-200">Process</a>
              <a href="#pricing" className="text-on-surface-variant font-medium text-label-sm font-label-sm hover:text-primary transition-colors duration-200">SaaS Plans</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="bg-primary text-on-primary px-5 py-2 rounded-lg font-label-sm text-label-sm hover:opacity-90 active:scale-95 transition-all">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/auth" className="text-on-surface-variant font-medium text-label-sm font-label-sm hover:text-primary transition-colors duration-200">
                  Login
                </Link>
                <button onClick={handleStart} className="bg-primary text-on-primary px-5 py-2 rounded-lg font-label-sm text-label-sm hover:opacity-90 active:scale-95 transition-all">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-24 px-gutter hero-glow flex flex-col items-center text-center">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6 animate-fade-in">
            <span className="material-symbols-outlined text-[16px] text-primary">auto_awesome</span>
            <span className="text-[11px] font-semibold text-primary tracking-wider uppercase font-label-sm">
              Next-Gen Travel Engine v2.5
            </span>
          </div>

          <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg text-on-surface tracking-tight max-w-4xl leading-tight mb-6">
            Precision Engineered <span className="gradient-text">AI Travel Planner</span>
          </h1>

          <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl mb-10 leading-relaxed opacity-85">
            Create optimized, bespoke multi-city itineraries, manage expenses dynamically in real-time, monitor localized weather patterns, and chat with an intelligent travel concierge.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleStart}
              className="primary-btn text-on-primary px-8 py-4 rounded-xl font-label-sm text-label-sm font-semibold flex items-center gap-2"
            >
              Start Planning Now
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <a
              href="#features"
              className="px-8 py-4 rounded-xl border border-outline-variant/30 hover:bg-surface-container-high/40 transition-colors font-label-sm text-label-sm font-semibold"
            >
              Explore Features
            </a>
          </div>

          {/* Screenshot Mockup Container */}
          <div className="mt-20 max-w-5xl w-full px-4 relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary to-secondary opacity-15 blur-[20px]"></div>
            <div className="relative glass-panel rounded-2xl border border-outline-variant/20 overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-low border-b border-outline-variant/10">
                <div className="w-3 h-3 rounded-full bg-error/50"></div>
                <div className="w-3 h-3 rounded-full bg-secondary/50"></div>
                <div className="w-3 h-3 rounded-full bg-primary/50"></div>
                <div className="ml-4 bg-surface-container-lowest border border-outline-variant/10 px-6 py-1 rounded text-[11px] text-on-surface-variant font-mono-label opacity-70">
                  https://app.tripcraft.ai/dashboard
                </div>
              </div>
              <div className="p-8 bg-surface-container-lowest/80 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-left">
                  <div className="text-primary font-bold text-label-sm font-label-sm mb-2 uppercase tracking-widest">Active Trip Itinerary</div>
                  <div className="text-headline-md font-headline-md font-bold mb-4 text-on-surface">Exploration of Tokyo & Kyoto</div>
                  <p className="text-on-surface-variant text-[14px] leading-relaxed mb-6 opacity-80">
                    Day-by-day optimization utilizing weather models and transit parameters. Activities are synchronized dynamically.
                  </p>
                  <div className="flex gap-4">
                    <div className="px-4 py-2 rounded bg-surface-container border border-outline-variant/10">
                      <div className="text-[10px] text-on-surface-variant font-label-sm">WEATHER</div>
                      <div className="text-[14px] font-semibold text-secondary">22°C Clear</div>
                    </div>
                    <div className="px-4 py-2 rounded bg-surface-container border border-outline-variant/10">
                      <div className="text-[10px] text-on-surface-variant font-label-sm">BUDGET EXPENDITURE</div>
                      <div className="text-[14px] font-semibold text-primary">64% Expended</div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-80 flex flex-col gap-3">
                  <div className="glass-panel p-4 rounded-xl flex gap-3 items-center border-l-4 border-l-primary">
                    <span className="material-symbols-outlined text-primary">hotel</span>
                    <div className="text-left">
                      <div className="text-[13px] font-semibold">Morning: Check-in Hotel Gracery</div>
                      <div className="text-[11px] text-on-surface-variant">Shinjuku, Tokyo</div>
                    </div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl flex gap-3 items-center border-l-4 border-l-secondary">
                    <span className="material-symbols-outlined text-secondary">restaurant</span>
                    <div className="text-left">
                      <div className="text-[13px] font-semibold">Afternoon: Sushi at Tsukiji Outer Market</div>
                      <div className="text-[11px] text-on-surface-variant">Chuo City, Tokyo</div>
                    </div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl flex gap-3 items-center border-l-4 border-l-tertiary">
                    <span className="material-symbols-outlined text-tertiary">temple_buddhist</span>
                    <div className="text-left">
                      <div className="text-[13px] font-semibold">Evening: Senso-ji Temple Visit</div>
                      <div className="text-[11px] text-on-surface-variant">Asakusa, Tokyo</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 max-w-container-max mx-auto px-gutter border-t border-outline-variant/10">
          <div className="text-center mb-16">
            <span className="text-primary font-bold text-label-sm font-label-sm tracking-widest uppercase">System Capabilities</span>
            <h2 className="text-headline-md md:text-3xl font-headline-md font-bold mt-2 text-on-surface">Integrated Travel Ecosystem</h2>
            <p className="text-on-surface-variant max-w-lg mx-auto mt-4 text-[15px] leading-relaxed">
              Ditch static travel sheets. TripCraft AI coordinates every facet of your journey in one workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-panel p-8 rounded-2xl hover:border-primary/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
              </div>
              <h3 className="text-[18px] font-semibold text-on-surface mb-3">AI Itinerary Generator</h3>
              <p className="text-on-surface-variant text-[14px] leading-relaxed opacity-85">
                Utilize Gemini 2.5 Flash algorithms to generate structured day-by-day itineraries tailored to your food style and trip preferences.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-8 rounded-2xl hover:border-secondary/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-all">
                <span className="material-symbols-outlined text-secondary">payments</span>
              </div>
              <h3 className="text-[18px] font-semibold text-on-surface mb-3">Real-time Expense Analytics</h3>
              <p className="text-on-surface-variant text-[14px] leading-relaxed opacity-85">
                Log travel expenses under Hotels, Food, Shopping, Transport, and Entertainment categories. Analyze budgets with interactive charts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-8 rounded-2xl hover:border-tertiary/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center mb-6 group-hover:bg-tertiary/20 transition-all">
                <span className="material-symbols-outlined text-tertiary">chat</span>
              </div>
              <h3 className="text-[18px] font-semibold text-on-surface mb-3">Cognitive Assistant</h3>
              <p className="text-on-surface-variant text-[14px] leading-relaxed opacity-85">
                Chat with an AI travel agent pre-loaded with your live itinerary details, expenses log, weather conditions, and cultural interests.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-panel p-8 rounded-2xl hover:border-primary/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all">
                <span className="material-symbols-outlined text-primary">thermostat</span>
              </div>
              <h3 className="text-[18px] font-semibold text-on-surface mb-3">Live Weather Watch</h3>
              <p className="text-on-surface-variant text-[14px] leading-relaxed opacity-85">
                Query weather metrics from Open-Meteo containing temperature, humidity levels, precipitation forecast, and wind speed updates.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass-panel p-8 rounded-2xl hover:border-secondary/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-all">
                <span className="material-symbols-outlined text-secondary">map</span>
              </div>
              <h3 className="text-[18px] font-semibold text-on-surface mb-3">Dynamic Leaflet Mapping</h3>
              <p className="text-on-surface-variant text-[14px] leading-relaxed opacity-85">
                Locate coordinates of restaurants, sights, and lodging on an interactive OpenStreetMap component built into the dashboard.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass-panel p-8 rounded-2xl hover:border-tertiary/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center mb-6 group-hover:bg-tertiary/20 transition-all">
                <span className="material-symbols-outlined text-tertiary">picture_as_pdf</span>
              </div>
              <h3 className="text-[18px] font-semibold text-on-surface mb-3">Professional PDF Export</h3>
              <p className="text-on-surface-variant text-[14px] leading-relaxed opacity-85">
                Bundle itineraries, expense summaries, budget analyses, and packing lists into a comprehensive downloadable PDF dossier.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-surface-container-lowest/50 border-t border-outline-variant/10">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="text-center mb-16">
              <span className="text-primary font-bold text-label-sm font-label-sm tracking-widest uppercase">Optimization Workflow</span>
              <h2 className="text-headline-md md:text-3xl font-headline-md font-bold mt-2 text-on-surface">Precision Travel in Three Steps</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[2px] bg-outline-variant/20 z-0"></div>

              {/* Step 1 */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-14 h-14 rounded-full bg-background border-2 border-primary flex items-center justify-center font-bold text-primary text-[18px] mb-6">
                  1
                </div>
                <h4 className="text-[18px] font-semibold text-on-surface mb-2">Configure Parameters</h4>
                <p className="text-on-surface-variant text-[14px] leading-relaxed opacity-80 max-w-xs">
                  Provide destination coordinates, travel schedules, budget caps, and personal culinary requirements.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-14 h-14 rounded-full bg-background border-2 border-secondary flex items-center justify-center font-bold text-secondary text-[18px] mb-6">
                  2
                </div>
                <h4 className="text-[18px] font-semibold text-on-surface mb-2">AI Generation & Refinement</h4>
                <p className="text-on-surface-variant text-[14px] leading-relaxed opacity-80 max-w-xs">
                  Gemini generates the core timeline. You can add, remove, and reorder activities dynamically.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-14 h-14 rounded-full bg-background border-2 border-tertiary flex items-center justify-center font-bold text-tertiary text-[18px] mb-6">
                  3
                </div>
                <h4 className="text-[18px] font-semibold text-on-surface mb-2">Track & Navigate</h4>
                <p className="text-on-surface-variant text-[14px] leading-relaxed opacity-80 max-w-xs">
                  Monitor expenses, check-off packing lists, interact with maps, and export offline manuals as you travel.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing / SaaS plans Section */}
        <section id="pricing" className="py-24 max-w-container-max mx-auto px-gutter border-t border-outline-variant/10">
          <div className="text-center mb-16">
            <span className="text-primary font-bold text-label-sm font-label-sm tracking-widest uppercase">Pricing Tier</span>
            <h2 className="text-headline-md md:text-3xl font-headline-md font-bold mt-2 text-on-surface">Designed for Globetrotters</h2>
          </div>

          <div className="max-w-md mx-auto relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary to-tertiary opacity-20 blur-[15px]"></div>
            <div className="relative glass-panel rounded-2xl border-2 border-primary/40 p-10 bg-surface-container-low/75 text-center">
              <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] uppercase font-bold tracking-widest">
                Recommended Choice
              </span>
              <h4 className="text-2xl font-bold mt-4">Explorer Pro</h4>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-on-surface">$0</span>
                <span className="text-on-surface-variant text-label-sm"> / forever</span>
              </div>
              <p className="text-on-surface-variant text-[13px] mb-8">
                Full-featured SaaS experience available for all registered accounts. Enjoy complete API integrations.
              </p>
              <ul className="text-left space-y-4 mb-8 text-[13px]">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  <span>Unlimited Trip Creation & Itineraries</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  <span>Live Weather & Interactive Maps</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  <span>Gemini AI Travel Assistant Concierge</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  <span>PDF Export dossiers for offline viewing</span>
                </li>
              </ul>
              <button
                onClick={handleStart}
                className="w-full py-4 rounded-xl primary-btn text-on-primary font-semibold text-label-sm font-label-sm active:scale-95 transition-all"
              >
                Create Free Account
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-outline-variant/10 py-12 px-gutter bg-surface-container-low/50">
          <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-headline-md font-headline-md font-bold text-primary">TripCraft AI</span>
              <span className="text-label-sm text-on-surface-variant opacity-60">© 2026 TripCraft AI. Your Personal AI Travel Companion.</span>
            </div>
            <div className="flex gap-6 text-label-sm text-on-surface-variant">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Landing;
