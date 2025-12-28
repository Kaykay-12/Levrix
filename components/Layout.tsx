
import React, { useState } from 'react';
import { LayoutDashboard, Users, PieChart, LogOut, Settings, MessageSquarePlus, Menu, X, ShieldAlert, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  userEmail: string;
  riskCount?: number;
  logoUrl?: string;
  companyName?: string;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activePage, 
  onNavigate, 
  onLogout, 
  userEmail = 'User', 
  riskCount = 0,
  logoUrl = "",
  companyName = "levrix"
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'All Leads', icon: Users },
    { id: 'followup', label: 'Follow Up', icon: MessageSquarePlus, badge: riskCount > 0 ? riskCount : null },
    { id: 'marketing', label: 'Marketing Hub', icon: Sparkles },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavigate = (id: string) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  // Safe user display name logic
  const initials = (userEmail || 'U').substring(0, 2).toUpperCase();

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Sidebar - Desktop (Visible on screens larger than 768px) */}
      <aside className="w-72 flex-none hidden md:flex flex-col p-6 text-white bg-[#0f2925] z-30 border-r border-white/5">
        <div className="mb-10 px-2 shrink-0">
           <div 
             className="flex items-center gap-3 group cursor-pointer" 
             onClick={() => handleNavigate('dashboard')}
           >
              <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20 group-hover:rotate-12 transition-transform duration-500 overflow-hidden shrink-0">
                {logoUrl && !logoError ? (
                  <img 
                    src={logoUrl} 
                    alt="Logo" 
                    className="w-full h-full object-contain p-2 brightness-0 invert" 
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <Sparkles className="w-5 h-5 text-white" />
                )}
              </div>
              <span className="text-2xl font-black tracking-tighter text-white truncate">
                {companyName === 'levrix' ? 'levrix' : companyName}<span className="text-emerald-500">.</span>
              </span>
           </div>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
          <div className="text-[10px] font-black text-teal-200/40 uppercase tracking-[0.2em] mb-4 px-3">Main Menu</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={cn(
                "w-full flex items-center px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200 group relative text-left",
                activePage === item.id 
                  ? "text-white bg-emerald-500/10 border border-emerald-500/20 shadow-inner" 
                  : "text-teal-100/50 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn(
                  "mr-3 h-5 w-5 transition-colors shrink-0", 
                  activePage === item.id ? "text-emerald-400" : "text-teal-100/30 group-hover:text-white"
              )} />
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-lg shadow-rose-500/30">
                    {item.badge}
                </span>
              )}
              {activePage === item.id && !item.badge && (
                  <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 shrink-0">
            <div className="flex items-center gap-3 mb-5 px-2 bg-white/5 p-3 rounded-2xl border border-white/5 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-xs shadow-lg border border-white/10 shrink-0">
                    {initials}
                </div>
                <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{userEmail}</p>
                    <p className="text-[10px] text-teal-200/40 uppercase font-black tracking-widest">Active Member</p>
                </div>
            </div>
            <button 
                onClick={onLogout}
                className="w-full flex items-center px-4 py-2.5 text-xs font-bold text-teal-200/40 hover:text-rose-400 transition-colors rounded-xl hover:bg-rose-500/10 uppercase tracking-widest"
            >
                <LogOut className="mr-3 h-4 w-4 shrink-0" />
                Sign Out
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#f8fafc] w-full">
            {/* Mobile Header (Hidden on Desktop) */}
            <header className="md:hidden bg-[#0f2925] text-white p-4 flex items-center justify-between z-40 shadow-md">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-black tracking-tighter">levrix.</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Toggle Menu"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </header>

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-[100] bg-[#0f2925] p-6 text-white flex flex-col animate-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-10 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter">levrix.</span>
                        </div>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-full bg-white/10">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <nav className="space-y-2 mt-4 flex-1 overflow-y-auto no-scrollbar">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavigate(item.id)}
                                className={cn(
                                    "w-full flex items-center px-5 py-4 text-lg font-bold rounded-2xl transition-all",
                                    activePage === item.id ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" : "text-teal-100/60 text-left"
                                )}
                            >
                                <item.icon className="mr-4 h-6 w-6 shrink-0" />
                                {item.label}
                                {item.badge && <span className="ml-auto bg-rose-500 px-2.5 py-1 rounded-full text-xs font-black">{item.badge}</span>}
                            </button>
                        ))}
                    </nav>
                    <div className="mt-auto pt-6 border-t border-white/10 shrink-0">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-bold">
                                {initials}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-bold text-white truncate">{userEmail}</p>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 h-14 rounded-2xl" onClick={onLogout}>
                            <LogOut className="mr-3 h-5 w-5" /> Sign Out
                        </Button>
                    </div>
                </div>
            )}

            <main className="flex-1 overflow-auto p-4 md:p-10 scroll-smooth w-full no-scrollbar relative z-10">
                <div className="max-w-7xl mx-auto h-full">
                    {children}
                </div>
            </main>
      </div>
    </div>
  );
};
