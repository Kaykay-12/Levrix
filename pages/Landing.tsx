
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { 
  Sparkles, ArrowRight, CheckCircle2, Globe, ShieldCheck, 
  MessageSquare, Phone, Mail, Zap, Target, TrendingUp, 
  ChevronRight, Instagram, Facebook, Linkedin, Layout,
  Smartphone, CreditCard, Activity, BarChart3, Users,
  Check, Star, Shield, Rocket, Globe2, ZapIcon, Heart, 
  ArrowUpRight, Plus, Minus, List, Command, Terminal, 
  ShieldAlert, Fingerprint, Coins, Box, Layers, FileText
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LandingPageProps {
  onLogin: () => void;
  onSignUp: () => void;
  logoUrl?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignUp, logoUrl }) => {
  const [scrolled, setScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const FEATURES = [
    {
      id: 'marketing',
      title: "3D Architectural Visualizer",
      badge: "Floor Plan to 3D",
      desc: "Upload a simple 2D floor plan or building draft and watch our Generative 3D engine extrapolate a high-fidelity architectural render in seconds.",
      icon: <Box className="w-6 h-6" />,
      points: ["2D Floor Plan to 3D Extrapolation", "High-Resolution Property Renders", "Automated Marketing Flyer Suite"],
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
      accent: "emerald"
    },
    {
      id: 'intel',
      title: "Behavioral Lead Intelligence",
      badge: "Gemini 2.5 Logic",
      desc: "Stop chasing dead ends. Our behavioral engine identifies your most motivated buyers before they even reach out.",
      icon: <Target className="w-6 h-6" />,
      points: ["0-100 Priority Scoring", "Real-time Sentiment Analysis", "AI-Powered Voice Notes Transcription"],
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200",
      accent: "indigo"
    },
    {
      id: 'outreach',
      title: "Omni-Channel Outreach Hub",
      badge: "Unified Messaging",
      desc: "One inbox for every conversation. Connect with leads where they live—via WhatsApp, SMS, or Email.",
      icon: <MessageSquare className="w-6 h-6" />,
      points: ["Smart Compose AI Writing Assistant", "WhatsApp Business Integration", "Bulk Multi-Channel Blasts"],
      image: "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?auto=format&fit=crop&q=80&w=1200",
      accent: "blue"
    }
  ];

  const PRICING_PLANS = [
    {
      name: 'Starter',
      price: '199',
      tagline: 'For solo agents',
      features: [
        'Lead Pipeline Tracking',
        'Email & SMS Outreach',
        'AI Strategic Assistant',
        'Performance Analytics',
        'Smart Buyer Profiles'
      ],
      accent: 'slate'
    },
    {
      name: 'Growth',
      price: '399',
      tagline: 'For rising agencies',
      popular: true,
      features: [
        'Everything in Starter',
        'WhatsApp Business Integration',
        'Generative Marketing Copy',
        'AI Voice Intel Logs',
        'Automated Priority Scoring'
      ],
      accent: 'emerald'
    },
    {
      name: 'Pro',
      price: '799',
      tagline: 'For enterprise teams',
      features: [
        'Everything in Growth',
        '3D Architectural Render Studio',
        'AI Flyer PDF Generation',
        'Custom White-label Branding',
        'Webhook Router API Access'
      ],
      accent: 'indigo'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfc] text-slate-900 font-sans selection:bg-emerald-500 selection:text-white overflow-x-hidden scroll-smooth">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 py-4",
        scrolled ? "bg-white/90 backdrop-blur-2xl shadow-xl py-3 border-b border-slate-100" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20 group-hover:rotate-12 transition-transform duration-500 overflow-hidden">
                {logoUrl && !logoError ? (
                  <img 
                    src={logoUrl} 
                    alt="Logo" 
                    className="w-full h-full object-contain p-2 brightness-0 invert" 
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <Sparkles className="w-6 h-6 text-white" />
                )}
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900">
                levrix<span className="text-emerald-500">.</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onLogin} className="hidden sm:block text-[11px] font-black uppercase tracking-widest text-slate-900 px-6 py-2 hover:opacity-70 transition-opacity">Log in</button>
            <Button onClick={onSignUp} className="bg-slate-900 text-white rounded-full px-8 h-11 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:-translate-y-0.5 transition-all">
              Sign up
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[65%] h-[100%] bg-emerald-50/50 rounded-bl-[400px] -z-10 animate-in fade-in duration-1000" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-10 animate-in fade-in slide-in-from-left-20 duration-1000">
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest w-fit">
                    <Zap className="w-3 h-3 fill-current" /> Next-Gen Lead Intelligence
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest w-fit">
                    <Box className="w-3 h-3" /> New: Floor Plan to 3D
                </div>
            </div>
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9]">
              Next-Gen <span className="bg-emerald-500/20 text-emerald-600 px-3 rounded-3xl">Leads,</span><br />
              Built for You.
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-lg leading-relaxed">
              The world's first AI-powered estate pipeline designed to accelerate property conversions with high-fidelity behavioral tracking and 3D visualization.
            </p>
            <div className="flex flex-wrap gap-5">
              <Button onClick={onSignUp} className="h-16 px-12 rounded-[28px] bg-[#0f2925] text-white font-black uppercase tracking-widest text-xs group shadow-2xl shadow-emerald-900/20">
                Get Started Free <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" className="h-16 px-12 rounded-[28px] border-slate-200 text-slate-900 font-black uppercase tracking-widest text-xs bg-white hover:bg-slate-50 transition-colors">
                Watch Demo
              </Button>
            </div>
          </div>

          <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <div className="relative z-10 w-full aspect-square rounded-[80px] overflow-hidden shadow-3xl bg-slate-100 border-[12px] border-white ring-1 ring-slate-100">
               <img 
                 src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1200" 
                 alt="African Business Professional in Modern Building" 
                 className="w-full h-full object-cover"
                 fetchpriority="high"
               />
            </div>

            {/* Floating UI Cards */}
            <div className="absolute -top-12 -right-12 z-20 w-64 p-8 bg-slate-900 rounded-[40px] shadow-3xl animate-bounce-slow border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Box className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                   <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">3D Rendering</span>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/60">Extrapolating Floor Plan</p>
                <div className="flex justify-between items-end">
                   <p className="text-4xl font-black text-white">100%</p>
                   <span className="text-emerald-400 text-xs font-bold mb-1">Live</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-12 -left-12 z-20 w-72 p-8 bg-white rounded-[40px] shadow-3xl animate-float border border-slate-100">
               <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Portfolio Value</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">₵1,876,580</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl">
                    <TrendingUp className="w-5 h-5" />
                  </div>
               </div>
               <div className="h-16 w-full bg-emerald-50/50 rounded-3xl flex items-center justify-center px-6">
                  <div className="flex gap-1.5 items-end h-8 w-full">
                    {[3,6,4,8,5,9,7,6,4,8].map((h, i) => (
                      <div key={i} className="flex-1 bg-emerald-500 rounded-full transition-all duration-1000 delay-[i*100]" style={{ height: `${h * 10}%` }} />
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep-Dive Sections */}
      <section className="py-24 px-6 space-y-40" id="features">
        {FEATURES.map((feat, i) => (
          <div key={feat.id} className={cn(
            "max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center",
            i % 2 !== 0 && "lg:flex lg:flex-row-reverse"
          )}>
            <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700">
               <div className={cn(
                 "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border",
                 feat.accent === 'emerald' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                 feat.accent === 'indigo' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                 "bg-blue-50 text-blue-600 border-blue-100"
               )}>
                  {feat.badge}
               </div>
               <h2 className="text-5xl font-black tracking-tighter leading-tight">{feat.title}</h2>
               <p className="text-lg text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
               <div className="space-y-4">
                  {feat.points.map((p, j) => (
                    <div key={j} className="flex items-center gap-4 group">
                       <div className={cn(
                         "w-6 h-6 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110",
                         feat.accent === 'emerald' ? "bg-emerald-500" : feat.accent === 'indigo' ? "bg-indigo-500" : "bg-blue-500"
                       )}>
                          <Check className="w-3.5 h-3.5" />
                       </div>
                       <span className="text-base font-bold text-slate-700">{p}</span>
                    </div>
                  ))}
               </div>
               <Button variant="outline" className="h-14 px-10 rounded-2xl border-slate-200 text-slate-900 font-black uppercase tracking-widest text-xs">
                  Learn More
               </Button>
            </div>

            <div className="relative group">
               <div className="aspect-[4/3] rounded-[64px] overflow-hidden shadow-3xl border-[8px] border-white ring-1 ring-slate-100 bg-slate-50">
                  <img 
                    src={feat.image} 
                    alt={feat.title} 
                    className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" 
                    loading="lazy"
                  />
               </div>
               {/* Contextual UI Overlays */}
               {feat.id === 'marketing' && (
                 <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-[40px] shadow-3xl border border-slate-100 w-64 animate-float">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Marketing Flyer</p>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <FileText className="w-6 h-6" />
                       </div>
                       <span className="text-xl font-black text-emerald-600 tracking-tight">PDF Exported</span>
                    </div>
                 </div>
               )}
            </div>
          </div>
        ))}
      </section>

      {/* Operational Health Section */}
      <section className="py-40 bg-slate-900 text-white px-6 overflow-hidden relative" id="infrastructure">
        <div className="absolute inset-0 bg-emerald-500/5 -z-10 animate-pulse-slow" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
           <div className="space-y-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                 <Activity className="w-3 h-3" /> Operational Funnel Health
              </div>
              <h2 className="text-6xl font-black tracking-tighter leading-tight">
                 Detect leakage.<br />
                 Accelerate velocity.
              </h2>
              <p className="text-xl text-teal-100/40 font-medium">
                 Levrix analyzes your entire conversion funnel in real-time, identifying exactly where leads drop off and providing strategic AI insights to plug the gaps.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-8">
                 <div className="space-y-2">
                    <p className="text-4xl font-black text-emerald-400">4.2d</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-teal-200/40">Avg Conversion Speed</p>
                 </div>
                 <div className="space-y-2">
                    <p className="text-4xl font-black text-rose-400">12%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-teal-200/40">Reduced Ghosting Rate</p>
                 </div>
              </div>
           </div>

           <div className="relative">
              <div className="bg-white/5 backdrop-blur-3xl rounded-[64px] p-12 border border-white/10 shadow-3xl">
                 <div className="flex justify-between items-center mb-10">
                    <h4 className="text-lg font-black tracking-tight">Pipeline Health Dashboard</h4>
                    <BarChart3 className="w-6 h-6 text-emerald-400" />
                 </div>
                 <div className="space-y-6">
                    {[
                      { label: 'Inquiry Capture', val: '98%', color: 'bg-emerald-500' },
                      { label: 'Initial Response', val: '85%', color: 'bg-emerald-400' },
                      { label: 'Viewing Set', val: '62%', color: 'bg-emerald-300' },
                      { label: 'Contracting', val: '45%', color: 'bg-emerald-200' }
                    ].map((row, i) => (
                      <div key={i} className="space-y-2">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                            <span>{row.label}</span>
                            <span>{row.val}</span>
                         </div>
                         <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all duration-1000 delay-[i*100]", row.color)} style={{ width: row.val }} />
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Infrastructure & Local Billing */}
      <section className="py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
             <h2 className="text-5xl font-black tracking-tighter">Enterprise-grade infrastructure.</h2>
             <p className="text-lg text-slate-500 font-medium">Built for global performance, optimized for the Ghanaian market.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
             <div className="p-12 bg-white rounded-[56px] border border-slate-100 shadow-xl hover:-translate-y-4 transition-all duration-500 group">
                <div className="w-16 h-16 bg-slate-900 rounded-[28px] flex items-center justify-center text-white mb-8 group-hover:bg-emerald-500 transition-colors">
                   <Terminal className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-black mb-4">Webhook Router</h4>
                <p className="text-slate-500 font-medium mb-8">Ingest leads from Facebook, Zillow, or custom landers with a single universal API endpoint.</p>
                <div className="p-4 bg-slate-50 rounded-2xl font-mono text-[10px] text-slate-400">
                   POST /api/v1/inbound
                </div>
             </div>

             <div className="p-12 bg-white rounded-[56px] border border-slate-100 shadow-xl hover:-translate-y-4 transition-all duration-500 group">
                <div className="w-16 h-16 bg-slate-900 rounded-[28px] flex items-center justify-center text-white mb-8 group-hover:bg-blue-500 transition-colors">
                   <Coins className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-black mb-4">Localized Billing</h4>
                <p className="text-slate-500 font-medium mb-8">Pay in GHS via Paystack. No hidden FX fees or international transaction limits.</p>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-[10px]">GHS</div>
                   <span className="text-xs font-bold text-slate-400">Supported Currency</span>
                </div>
             </div>

             <div className="p-12 bg-white rounded-[56px] border border-slate-100 shadow-xl hover:-translate-y-4 transition-all duration-500 group">
                <div className="w-16 h-16 bg-slate-900 rounded-[28px] flex items-center justify-center text-white mb-8 group-hover:bg-indigo-500 transition-colors">
                   <Fingerprint className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-black mb-4">Data Sovereignty</h4>
                <p className="text-slate-500 font-medium mb-8">Bank-grade encryption for all property records and private buyer communications.</p>
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase w-fit">
                   AES-256 Encrypted
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Pricing Summary */}
      <section className="py-40 px-6 bg-slate-50" id="pricing">
        <div className="max-w-7xl mx-auto text-center">
           <h2 className="text-6xl font-black tracking-tighter mb-4">Ready to grow?</h2>
           <p className="text-slate-500 text-lg font-medium mb-16 italic">Simple pricing for high-performance agencies.</p>
           
           <div className="grid md:grid-cols-3 gap-8 text-left max-w-6xl mx-auto items-stretch">
              {PRICING_PLANS.map((plan) => (
                <div key={plan.name} className={cn(
                  "p-12 rounded-[56px] bg-white shadow-2xl transition-all hover:-translate-y-4 relative overflow-hidden flex flex-col",
                  plan.popular && "ring-4 ring-emerald-500"
                )}>
                   {plan.popular && (
                     <div className="absolute top-0 right-10 bg-emerald-500 text-white px-6 py-2 rounded-b-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                        Most Popular
                     </div>
                   )}
                   <div className="mb-8">
                     <h4 className="text-2xl font-black text-slate-900 mb-1">{plan.name}</h4>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{plan.tagline}</p>
                   </div>
                   
                   <div className="flex items-baseline mb-10">
                      <span className="text-5xl font-black text-slate-900 tracking-tighter">₵{plan.price}</span>
                      <div className="ml-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">per user</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">/ month</p>
                      </div>
                   </div>

                   <div className="space-y-5 mb-12 flex-1">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                            plan.popular ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                          )}>
                            <Check className="w-3 h-3" />
                          </div>
                          <span className="text-sm font-bold text-slate-600 leading-tight">{feature}</span>
                        </div>
                      ))}
                   </div>

                   <Button 
                    onClick={onSignUp} 
                    className={cn(
                      "w-full h-16 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl", 
                      plan.popular ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-slate-900 text-white shadow-slate-900/10"
                    )}
                   >
                      Get {plan.name} Access
                   </Button>
                </div>
              ))}
           </div>

           <div className="mt-20 p-8 bg-white/50 border border-slate-200 rounded-[40px] max-w-2xl mx-auto flex items-center gap-8 text-left">
              <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white shrink-0 shadow-xl">
                 <Users className="w-8 h-8" />
              </div>
              <div>
                <h5 className="font-black text-slate-900 mb-1">Scale your entire agency</h5>
                <p className="text-sm text-slate-500 font-medium">Add or remove seats as your team grows. All billing is handled per active user, so you only pay for the capacity you need.</p>
              </div>
           </div>
        </div>
      </section>

      {/* Contact Footer */}
      <footer className="bg-white border-t border-slate-100 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-16 lg:gap-24 mb-32">
            <div className="col-span-2 space-y-10">
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 overflow-hidden">
                    {logoUrl && !logoError ? (
                      <img 
                        src={logoUrl} 
                        alt="Logo" 
                        className="w-full h-full object-contain p-2 brightness-0 invert" 
                        onError={() => setLogoError(true)}
                      />
                    ) : (
                      <Sparkles className="w-7 h-7 text-white" />
                    )}
                 </div>
                 <span className="text-3xl font-black tracking-tighter text-slate-900">levrix.</span>
               </div>
               <p className="text-slate-500 max-w-md text-lg font-medium leading-relaxed">
                 The world's most advanced lead management platform for modern real estate professionals. Designed in Ghana for the global market.
               </p>
               <div className="flex gap-5">
                 {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                    <div key={i} className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all cursor-pointer shadow-sm">
                       <Icon className="w-5 h-5" />
                    </div>
                 ))}
               </div>
            </div>

            <div className="space-y-10">
              <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Contact & Support</h5>
              <div className="space-y-6">
                <a href="mailto:info@levrix.app" className="group flex items-center gap-4 text-base font-bold text-slate-600 hover:text-emerald-600 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors"><Mail className="w-4 h-4" /></div>
                  info@levrix.app
                </a>
                <a href="tel:+233242389340" className="group flex items-center gap-4 text-base font-bold text-slate-600 hover:text-emerald-600 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors"><Phone className="w-4 h-4" /></div>
                  +233 24 238 9340
                </a>
                <a href="https://wa.me/233242389340" target="_blank" className="group flex items-center gap-4 text-base font-bold text-slate-600 hover:text-emerald-600 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors"><MessageSquare className="w-4 h-4" /></div>
                  WhatsApp Business
                </a>
              </div>
            </div>

            <div className="space-y-10">
               <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Workspace</h5>
               <div className="space-y-6 text-base font-bold text-slate-600">
                  <p className="hover:text-emerald-600 cursor-pointer transition-colors">Our Vision</p>
                  <p className="hover:text-emerald-600 cursor-pointer transition-colors">Terms of Service</p>
                  <p className="hover:text-emerald-600 cursor-pointer transition-colors">Privacy Policy</p>
               </div>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">© 2026 Levrix.</p>
            <a href="https://www.emdigitalnow.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 px-8 py-3 bg-slate-900 rounded-3xl border border-white/5 shadow-2xl group transition-all hover:bg-slate-800">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Powered by</span>
               <span className="text-sm font-black text-white tracking-tighter group-hover:text-emerald-400 transition-colors">Echellon Motion</span>
               <ArrowUpRight className="w-4 h-4 text-emerald-500 group-hover:rotate-45 transition-transform" />
            </a>
          </div>
        </div>
      </footer>

      {/* Animation Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 5s ease-in-out infinite;
        }
        .animate-pulse-slow {
           animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

const Palette = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.5-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H17c2.8 0 5-2.2 5-5 0-4.4-4.5-8-10-8Z"/>
  </svg>
);
