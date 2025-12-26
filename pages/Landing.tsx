
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { 
  Sparkles, ArrowRight, CheckCircle2, Globe, ShieldCheck, 
  MessageSquare, Phone, Mail, Zap, Target, TrendingUp, 
  ChevronRight, Instagram, Facebook, Linkedin, Layout,
  Smartphone, CreditCard, Activity, BarChart3, Users
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LandingPageProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignUp }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfdfc] text-slate-900 font-sans selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-6 py-4",
        scrolled ? "bg-white/80 backdrop-blur-xl shadow-lg py-3" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900">
                levrix<span className="text-emerald-500">.</span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-400">
              <a href="#business" className="hover:text-emerald-500 transition-colors">Business</a>
              <a href="#pricing" className="hover:text-emerald-500 transition-colors">Pricing</a>
              <a href="#features" className="hover:text-emerald-500 transition-colors">Features</a>
              <a href="#about" className="hover:text-emerald-500 transition-colors">About</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onLogin} className="text-[11px] font-black uppercase tracking-widest text-slate-900 px-6 py-2 hover:opacity-70 transition-opacity">Log in</button>
            <Button onClick={onSignUp} className="bg-slate-900 text-white rounded-full px-8 h-11 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:-translate-y-0.5 transition-all">
              Sign up
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[60%] h-[100%] bg-emerald-50 rounded-bl-[300px] -z-10" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-10 duration-1000">
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.95]">
              Next-Gen <span className="bg-emerald-500/20 text-emerald-600 px-2 rounded-2xl">Leads,</span><br />
              Built for You.
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-md leading-relaxed">
              Your all-in-one solution for smarter lead management. Track outreach, set goals, and make informed decisions with clarity and ease.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={onSignUp} className="h-14 px-10 rounded-2xl bg-[#0f2925] text-white font-black uppercase tracking-widest text-xs">
                Get Started
              </Button>
              <Button variant="outline" className="h-14 px-10 rounded-2xl border-slate-200 text-slate-900 font-black uppercase tracking-widest text-xs bg-white">
                See Details
              </Button>
            </div>
          </div>

          <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-300">
            {/* Main Hero Image Placeholder */}
            <div className="relative z-10 w-full aspect-square rounded-[64px] overflow-hidden shadow-3xl bg-slate-100 border-8 border-white">
               <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1000" alt="Founder" className="w-full h-full object-cover" />
            </div>

            {/* Floating UI Cards */}
            <div className="absolute -top-10 -right-10 z-20 w-56 p-6 bg-slate-900 rounded-[32px] shadow-2xl animate-bounce-slow border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Live Health</p>
              </div>
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-[85%]" />
                </div>
                <div className="flex justify-between text-white font-black text-[14px]">
                   <span>98.2%</span>
                   <span className="text-emerald-400">↑ 12%</span>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-10 -left-10 z-20 w-64 p-6 bg-white rounded-[32px] shadow-2xl animate-float border border-slate-100">
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Balance</p>
                    <p className="text-2xl font-black text-slate-900">₵1,876,580</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                    <TrendingUp className="w-4 h-4" />
                  </div>
               </div>
               <div className="h-12 w-full bg-emerald-50 rounded-xl flex items-center justify-center">
                  <div className="flex gap-1 items-end h-6">
                    {[3,6,4,8,5,9,7].map((h, i) => (
                      <div key={i} className="w-1.5 bg-emerald-500 rounded-full" style={{ height: `${h * 10}%` }} />
                    ))}
                  </div>
               </div>
            </div>

            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/5 rounded-full blur-[100px] -z-20" />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-12">Trusted By Over 100+ Startups and freelance business</p>
          <div className="flex flex-wrap justify-center items-center gap-16 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-2xl font-black tracking-tighter">ORACLE</span>
            <span className="text-2xl font-black tracking-tighter italic">MORPHEUS</span>
            <span className="text-2xl font-black tracking-tighter">SAMSUNG</span>
            <span className="text-2xl font-black tracking-tighter lowercase underline decoration-emerald-500">monday.com</span>
            <span className="text-2xl font-black tracking-tighter">segment</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="relative h-[600px] rounded-[64px] overflow-hidden group">
               <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000" alt="Growth" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
               <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-emerald-900/20 to-transparent" />
               <div className="absolute bottom-12 left-12 right-12 text-white">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-4xl font-black leading-tight mb-4">Accelerate your conversion velocity.</h3>
                  <p className="text-emerald-100/60 font-medium">Real-time insights tailored for modern real estate professionals.</p>
               </div>
            </div>

            <div className="grid gap-10">
               <div className="bg-[#0f2925] rounded-[64px] p-12 text-white flex flex-col justify-between group hover:-translate-y-2 transition-transform duration-500">
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 bg-white/10 rounded-[28px] flex items-center justify-center border border-white/10">
                      <BarChart3 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <ArrowRight className="w-8 h-8 text-white/20 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-6xl font-black mb-2">50K</h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-200/40">Contributions in the last year</p>
                  </div>
               </div>

               <div className="bg-slate-100 rounded-[64px] p-12 flex flex-col justify-between group hover:-translate-y-2 transition-transform duration-500">
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 bg-white rounded-[28px] flex items-center justify-center border border-slate-200 shadow-sm">
                      <Users className="w-10 h-10 text-emerald-500" />
                    </div>
                    <ArrowRight className="w-8 h-8 text-slate-200 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-6xl font-black text-slate-900 mb-2">70,000+</h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Global Clients Empowered</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Grow Financially</p>
           <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 leading-tight">
             Unlock smart tools designed for<br />financial growth.
           </h2>
        </div>
      </section>

      {/* Benefit Cards */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
           <div className="bg-emerald-50 rounded-[48px] p-10 flex flex-col justify-between group hover:bg-emerald-500 hover:text-white transition-all duration-500 cursor-pointer h-[400px]">
              <div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:bg-white group-hover:text-emerald-600 mb-8 transition-colors">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="text-2xl font-black mb-4">Subscribe to our Newsletter</h4>
                <p className="text-sm font-medium opacity-60">Get insights, offers, and money-saving advice straight to your inbox.</p>
              </div>
              <div className="flex justify-end">
                 <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-6 h-6" />
                 </div>
              </div>
           </div>

           <div className="bg-slate-100 rounded-[48px] p-10 flex flex-col justify-between group hover:bg-slate-900 hover:text-white transition-all duration-500 cursor-pointer h-[400px]">
              <div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-sm group-hover:bg-white/10 group-hover:text-white mb-8 transition-colors">
                  <Layout className="w-6 h-6" />
                </div>
                <h4 className="text-2xl font-black mb-4">Multi-Account Management</h4>
                <p className="text-sm font-medium opacity-60">Consolidate all your lead streams into one unified real-time dashboard.</p>
              </div>
              <div className="flex justify-end">
                 <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-6 h-6" />
                 </div>
              </div>
           </div>

           <div className="bg-[#0f2925] rounded-[48px] p-10 flex flex-col justify-between group hover:bg-emerald-600 transition-all duration-500 cursor-pointer h-[400px] text-white">
              <div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-white/10 mb-8">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h4 className="text-2xl font-black mb-4">Boost your Account now</h4>
                <p className="text-sm font-medium opacity-60">Experience full control of your pipeline. Access personalized tools anytime.</p>
              </div>
              <div className="flex justify-end">
                 <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-6 h-6" />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-2 space-y-8">
               <div className="flex items-center gap-2">
                 <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
                   <Sparkles className="w-6 h-6 text-white" />
                 </div>
                 <span className="text-2xl font-black tracking-tighter text-slate-900">levrix.</span>
               </div>
               <p className="text-slate-500 max-w-sm font-medium">The world's most advanced lead management platform for modern property agents.</p>
               <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-500 transition-colors cursor-pointer"><Instagram className="w-5 h-5" /></div>
                 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-500 transition-colors cursor-pointer"><Facebook className="w-5 h-5" /></div>
                 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-500 transition-colors cursor-pointer"><Linkedin className="w-5 h-5" /></div>
               </div>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Us</h5>
              <div className="space-y-4">
                <a href="mailto:info@levrix.app" className="flex items-center gap-3 text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">
                  <Mail className="w-4 h-4" /> info@levrix.app
                </a>
                <a href="tel:0242389340" className="flex items-center gap-3 text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">
                  <Phone className="w-4 h-4" /> 0242389340
                </a>
                <a href="https://wa.me/0242389340" target="_blank" className="flex items-center gap-3 text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">
                  <MessageSquare className="w-4 h-4" /> WhatsApp Support
                </a>
              </div>
            </div>

            <div className="space-y-6">
               <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">About</h5>
               <div className="space-y-4 text-sm font-bold text-slate-600">
                  <p className="hover:text-emerald-600 cursor-pointer">Our Story</p>
                  <p className="hover:text-emerald-600 cursor-pointer">Terms of Service</p>
                  <p className="hover:text-emerald-600 cursor-pointer">Privacy Policy</p>
               </div>
            </div>
          </div>

          <div className="mt-20 pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">© 2024 Levrix. All rights reserved.</p>
            <div className="flex items-center gap-3 px-6 py-2 bg-slate-50 rounded-full border border-slate-100">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Powered by</span>
               <span className="text-xs font-black text-slate-900 tracking-tighter">Echellon Motion</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Animation Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
