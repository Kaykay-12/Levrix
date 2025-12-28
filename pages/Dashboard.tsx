
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Lead, MessageLog, Integrations } from '../types';
import { 
  TrendingUp, Users, Clock, ArrowUpRight, Sparkles, Lightbulb, 
  Loader2, RefreshCw, Target, Activity, Database, CheckCircle2, 
  MessageSquare, Layers, BarChart3, ArrowRight
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn, formatDate } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  leads: Lead[];
  logs?: MessageLog[];
  isReady?: boolean;
  integrations?: Integrations;
}

export const Dashboard: React.FC<DashboardProps> = ({ leads, logs = [], isReady = true, integrations }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const totalLeads = leads.length;
  const newLeadsToday = leads.filter(l => {
    const today = new Date();
    const leadDate = new Date(l.createdAt);
    return leadDate.toDateString() === today.toDateString();
  }).length;
  
  const wonLeads = leads.filter(l => l.status === 'Won').length;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
  
  const criticalLeads = leads.filter(l => l.agingStatus === 'critical').length;

  const stageData = [
    { name: 'Inquiry', value: leads.filter(l => l.stage === 'Inquiry').length },
    { name: 'Contacted', value: leads.filter(l => l.stage === 'First Contact').length },
    { name: 'Viewing', value: leads.filter(l => l.stage === 'Property Viewing').length },
    { name: 'Offer', value: leads.filter(l => l.stage === 'Offer Made').length },
    { name: 'Contract', value: leads.filter(l => l.stage === 'Contract').length },
    { name: 'Closed', value: leads.filter(l => l.stage === 'Closed').length },
  ];

  const generateInsights = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze this real estate pipeline: ${totalLeads} total leads, ${wonLeads} won, ${criticalLeads} at risk. 
      Provide 3 high-impact tactical suggestions for the agent. 
      
      CRITICAL FORMATTING RULES:
      1. Write in clear, professional paragraphs. 
      2. DO NOT use numbers (1, 2, 3), bullet points, or any markdown symbols like asterisks (*) or hashes (#).
      3. Use full words for numbers where possible.
      4. Each suggestion should be a concise paragraph of professional advice.
      5. Avoid headers entirely.`;

      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: prompt 
      });

      const cleanText = (response.text || '')
        .replace(/[*#_~`>]/g, '') 
        .replace(/^[0-9]+[.)]\s+/gm, '') 
        .trim();

      setAiInsight(cleanText);
    } catch (error) {
      setAiInsight("The strategy engine is currently re-calibrating. Please try again in a moment.");
    } finally { setIsGenerating(false); }
  };

  if (!isReady) {
    return (
      <div className="h-full flex flex-col space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
              <p className="text-slate-500 mt-1">Establishing connection to your pipeline...</p>
            </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-8 animate-in fade-in duration-500 bg-white rounded-[40px] border border-slate-100 shadow-sm">
           <div className="w-24 h-24 bg-emerald-50 rounded-[40px] flex items-center justify-center border border-emerald-100 shadow-2xl shadow-emerald-500/10">
              <Database className="w-10 h-10 text-emerald-500 animate-pulse" />
           </div>
           <div className="max-w-md space-y-2">
              <h2 className="text-3xl font-black text-slate-900">Workspace Syncing</h2>
              <p className="text-slate-500 font-medium leading-relaxed">Please wait while we re-establish a secure connection with your property database.</p>
           </div>
           <Button variant="outline" className="rounded-2xl" onClick={() => window.location.reload()}>
              Force Refresh
           </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h2>
          <p className="text-slate-500 mt-1">Holistic performance tracking for your real estate pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-2xl h-12 bg-white border-slate-200">
                <RefreshCw className="w-4 h-4 mr-2" /> Sync Data
            </Button>
            <Button onClick={generateInsights} className="rounded-2xl h-12 bg-slate-900 text-white shadow-xl shadow-slate-900/20" isLoading={isGenerating}>
                <Sparkles className="w-4 h-4 mr-2 text-emerald-400" /> AI Strategy
            </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
            { label: 'Total Pipeline', value: totalLeads, sub: 'All inquiries', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'New Today', value: newLeadsToday, sub: 'In the last 24h', icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Conversion', value: `${conversionRate}%`, sub: 'Inquiries won', icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-50' },
            { label: 'At Risk', value: criticalLeads, sub: 'Needs attention', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50' }
        ].map((stat, i) => (
            <Card key={i} className="border-slate-100 shadow-xl rounded-[32px] overflow-hidden group hover:border-slate-200 transition-all">
                <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-4">
                        <div className={cn("p-3 rounded-2xl", stat.bg)}>
                            <stat.icon className={cn("w-5 h-5", stat.color)} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            Live <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-4 font-medium">{stat.sub}</p>
                </CardContent>
            </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <Card className="lg:col-span-7 border-slate-100 shadow-2xl rounded-[40px] overflow-hidden bg-white">
            <CardHeader className="p-10 pb-0">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Pipeline Velocity</CardTitle>
                        <p className="text-xs text-slate-500 font-medium mt-1">Lead distribution across the closing funnel.</p>
                    </div>
                    <BarChart3 className="w-5 h-5 text-slate-300" />
                </div>
            </CardHeader>
            <CardContent className="p-10 pt-4">
                <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stageData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#94a3b8', fontSize: 11}}
                                width={30}
                            />
                            <Tooltip 
                                cursor={{fill: '#f8fafc'}}
                                contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px'}}
                            />
                            <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={40}>
                                {stageData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 5 ? '#10b981' : '#0f172a'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>

        <div className="lg:col-span-5 space-y-6">
            <Card className="bg-gradient-to-br from-[#0f2925] to-[#0a1b18] text-white border-none shadow-2xl rounded-[40px] overflow-hidden h-full">
                <CardContent className="p-10 h-full flex flex-col">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl border border-emerald-500/20 flex items-center justify-center">
                            <Lightbulb className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold">Strategic Assistant</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-teal-200/40 mt-1">Gemini AI Engine</p>
                        </div>
                    </div>

                    {!aiInsight ? (
                        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-white/20" />
                            </div>
                            <p className="text-sm text-teal-100/40 font-medium">Click "AI Strategy" to analyze your current pipeline health.</p>
                        </div>
                    ) : (
                        <div className="space-y-8 flex-1 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-right-4">
                            {aiInsight.split(/\n\n+/).filter(l => l.trim()).map((insight, i) => (
                                <div key={i} className="flex gap-5 group">
                                    <div className="w-1 h-auto bg-emerald-500/30 rounded-full shrink-0 group-hover:bg-emerald-400 transition-colors" />
                                    <p className="text-sm text-teal-50/90 leading-relaxed font-medium">
                                        {insight}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pt-8 border-t border-white/10 mt-auto flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-teal-200/20">Analysis Complete</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-slate-100 shadow-2xl rounded-[40px] overflow-hidden bg-white">
            <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg">Recent Inquiries</CardTitle>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Latest leads added</p>
                </div>
                <Users className="w-5 h-5 text-slate-300" />
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                    {leads.slice(0, 5).length === 0 ? (
                        <div className="p-12 text-center text-slate-400 italic font-medium">No inquiries found yet.</div>
                    ) : (
                        leads.slice(0, 5).map((lead) => (
                            <div key={lead.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-lg">
                                        {lead.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{lead.name}</p>
                                        <p className="text-xs text-slate-500">{lead.propertyAddress || 'General Inquiry'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-900">{formatDate(lead.createdAt)}</p>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{lead.source}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-2xl rounded-[40px] overflow-hidden bg-white">
            <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg">Recent Engagement</CardTitle>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Last communications sent</p>
                </div>
                <MessageSquare className="w-5 h-5 text-slate-300" />
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                    {logs.slice(0, 5).length === 0 ? (
                        <div className="p-12 text-center text-slate-400 italic font-medium">No outreach history to display.</div>
                    ) : (
                        logs.slice(0, 5).map((log) => (
                            <div key={log.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                        {log.channel === 'email' ? <ArrowUpRight className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{log.leadName}</p>
                                        <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">{log.content}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                        log.status === 'Sent' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200"
                                    )}>
                                        {log.status}
                                    </span>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{log.channel}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};
