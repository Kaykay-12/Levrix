
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Lead, MessageLog, Integrations } from '../types';
import { TrendingUp, Users, Clock, ArrowUpRight, Sparkles, Lightbulb, Loader2, RefreshCw, AlertTriangle, CheckCircle2, MessageSquare, PlusCircle, ShieldAlert, Zap, Thermometer, ListTodo, ChevronRight, Activity, Target, ShieldCheck, Database, Wifi, Globe, PhoneCall, Facebook } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn, formatDate } from '../lib/utils';

interface DashboardProps {
  leads: Lead[];
  logs?: MessageLog[];
  isReady?: boolean;
  integrations?: Integrations;
}

export const Dashboard: React.FC<DashboardProps> = ({ leads, logs = [], isReady = true, integrations }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const criticalLeads = leads.filter(l => l.agingStatus === 'critical');
  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.status === 'Won').length;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  const generateInsights = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Perform a Real Estate pipeline audit. Critical: ${criticalLeads.length}. Conversion: ${conversionRate}%. Provide 3 strategic insights.`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setAiInsight(response.text || '');
    } catch (error) {
      setAiInsight("Unable to generate analysis.");
    } finally { setIsGenerating(false); }
  };

  if (!isReady) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-8 animate-in fade-in duration-500">
         <div className="w-24 h-24 bg-rose-50 rounded-[40px] flex items-center justify-center border border-rose-100 shadow-2xl shadow-rose-500/10">
            <Database className="w-10 h-10 text-rose-500" />
         </div>
         <div className="max-w-md space-y-2">
            <h2 className="text-3xl font-black text-slate-900">Workspace Pending</h2>
            <p className="text-slate-500 font-medium">We couldn't reach your Supabase tables. Ensure your database is initialized.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Pipeline Pulse</h2>
          <p className="text-slate-500 mt-1">Real-time behavior monitoring for your buyer database.</p>
        </div>
        
        {/* Real-time Status Bar */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                <Wifi className="w-3 h-3" /> Supabase Live
            </div>
            {integrations?.facebook?.connected && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
                    <Facebook className="w-3 h-3" /> Meta Webhook Active
                </div>
            )}
            {integrations?.sms?.enabled && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                    <PhoneCall className="w-3 h-3" /> Twilio Ready
                </div>
            )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-8 bg-gradient-to-br from-[#0f2925] to-[#1a3834] text-white border-none shadow-2xl relative overflow-hidden rounded-[40px]">
             <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
             <CardContent className="p-10 relative z-10">
                <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                    <div className="space-y-6 max-w-lg">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                            <Sparkles className="w-3.5 h-3.5" /> Live Intelligence
                        </div>
                        <h3 className="text-4xl font-black">Performance: <span className="text-emerald-400">Peak</span></h3>
                        <p className="text-teal-100/60 text-sm leading-relaxed font-medium">
                            Your team is maintaining high velocity. {leads.length} total inquiries synced across all connected channels.
                        </p>
                        <div className="flex gap-4 pt-2">
                             <Button onClick={generateInsights} className="bg-emerald-500 hover:bg-emerald-600 text-white border-none h-12 px-8 shadow-xl shadow-emerald-500/20 rounded-2xl font-bold" isLoading={isGenerating}>
                                Perform Audit
                             </Button>
                        </div>
                    </div>
                </div>

                {aiInsight && (
                    <div className="mt-10 p-8 bg-white/5 rounded-[32px] border border-white/10 animate-in fade-in slide-in-from-bottom-4 backdrop-blur-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {aiInsight.split('\n').filter(l => l.trim()).slice(0, 4).map((text, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                        <Lightbulb className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <p className="text-xs text-teal-50/80 leading-relaxed font-medium">{text.replace(/^[*-]\s+/, '')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
             </CardContent>
        </Card>

        <Card className="md:col-span-4 bg-white border-slate-100 shadow-2xl flex flex-col p-10 rounded-[40px]">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-300" /> Activity Monitor
            </h4>
            <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar">
                {leads.slice(0, 6).map((lead, i) => (
                    <div key={i} className="flex items-start gap-4 group">
                        <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-all",
                            lead.status === 'Won' ? "bg-emerald-50 text-emerald-500 border-emerald-100" :
                            "bg-slate-50 text-slate-400 border-slate-100"
                        )}>
                            <Users className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{lead.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{lead.source} • {formatDate(lead.createdAt)}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-200" />
                    </div>
                ))}
            </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[
            { label: 'Pipeline Volume', value: totalLeads, icon: Users, color: 'text-blue-600' },
            { label: 'Closed/Won', value: wonLeads, icon: CheckCircle2, color: 'text-emerald-600' },
            { label: 'At Risk', value: criticalLeads.length, icon: ShieldAlert, color: 'text-rose-600' },
            { label: 'Engagement', value: logs.length, icon: MessageSquare, color: 'text-amber-600' }
        ].map((stat, i) => (
            <Card key={i} className="p-8 border-slate-100 shadow-xl rounded-[32px] group">
                <stat.icon className={cn("w-6 h-6 mb-6", stat.color)} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
            </Card>
        ))}
      </div>
    </div>
  );
};
