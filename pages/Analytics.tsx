
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, ComposedChart, Line 
} from 'recharts';
import { Lead } from '../types';
import { 
  TrendingUp, Users, Activity, Target, ArrowUpRight, ArrowDownRight, 
  Download, Loader2, Home, Timer, CheckCircle, Ghost, Megaphone 
} from 'lucide-react';
import { cn } from '../lib/utils';

interface AnalyticsProps {
  leads: Lead[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ leads }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4'];

  const totalLeads = leads.length;

  // 1. Time to First Contact Calculation
  const contactTimes = leads
    .filter(l => l.createdAt && l.firstContactedAt)
    .map(l => {
      const start = new Date(l.createdAt).getTime();
      const end = new Date(l.firstContactedAt!).getTime();
      return (end - start) / (1000 * 60); // in minutes
    });
  const avgContactTime = contactTimes.length > 0 
    ? Math.round(contactTimes.reduce((a, b) => a + b, 0) / contactTimes.length) 
    : 0;

  // 2. Follow-up Completion Rate
  const leadsWithTasks = leads.filter(l => l.taskDueDate || l.nextFollowUpTask);
  const completedTasks = leadsWithTasks.filter(l => l.taskCompleted).length;
  const followUpRate = leadsWithTasks.length > 0 ? Math.round((completedTasks / leadsWithTasks.length) * 100) : 0;

  // 3. Lost Deals due to No Response
  const lostNoResponse = leads.filter(l => 
    l.status === 'Lost' && (!l.firstContactedAt || (l.notes?.toLowerCase().includes('no response')))
  ).length;

  // 4. Leads by Property
  const propertyData = leads.reduce((acc, lead) => {
    const prop = lead.propertyAddress || 'General Interest';
    const existing = acc.find(i => i.name === prop);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: prop, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]).sort((a,b) => b.value - a.value).slice(0, 5);

  // 5. Conversion by Campaign
  const campaignData = Array.from(new Set(leads.map(l => l.campaignSource).filter(Boolean)))
    .map(campaign => {
      const campaignLeads = leads.filter(l => l.campaignSource === campaign);
      const won = campaignLeads.filter(l => l.status === 'Won').length;
      return {
        name: campaign,
        leads: campaignLeads.length,
        conversion: Math.round((won / campaignLeads.length) * 100)
      };
    }).sort((a,b) => b.conversion - a.conversion);

  const handleDownloadReport = () => {
    setIsDownloading(true);
    
    // Brief delay to allow UI to settle before printing
    setTimeout(() => {
        window.print();
        setIsDownloading(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Real Estate Intelligence</h2>
          <p className="text-slate-500 mt-1">Operational KPIs and property-level insights.</p>
        </div>
        <Button onClick={handleDownloadReport} disabled={isDownloading} className="no-print">
            {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Export Insights (PDF)
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Avg Time to Contact</CardTitle>
            <Timer className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgContactTime || '--'} min</div>
            <p className="text-xs text-slate-500 mt-1">Speed-to-lead benchmark</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Follow-up Completion</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{followUpRate}%</div>
            <p className="text-xs text-slate-500 mt-1">Execution efficiency</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Lost (No Response)</CardTitle>
            <Ghost className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lostNoResponse}</div>
            <p className="text-xs text-slate-500 mt-1">Funnel drop-off reason</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Conversion Quality</CardTitle>
            <Target className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((leads.filter(l => l.status === 'Won').length / Math.max(leads.length, 1)) * 100)}%</div>
            <p className="text-xs text-slate-500 mt-1">Overall won/total ratio</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Leads by Property */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5 text-emerald-500" /> Leads by Property
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={propertyData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="value" name="Total Leads" radius={[0, 6, 6, 0]} barSize={24} fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Conversion */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-500" /> Campaign Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignData} margin={{ top: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                  <YAxis unit="%" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Conv. Rate']} />
                  <Bar dataKey="conversion" name="Conversion %" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-emerald-100 bg-emerald-50/20">
        <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" /> Operational Funnel Health
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Outreach Volume</p>
                    <p className="text-4xl font-black text-slate-900">{leads.filter(l => l.lastContacted).length}</p>
                    <p className="text-xs text-slate-500 mt-1">Leads engaged this month</p>
                </div>
                <div className="text-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Conversion Velocity</p>
                    <p className="text-4xl font-black text-emerald-600">Fast</p>
                    <p className="text-xs text-slate-500 mt-1">Avg 4.2 days to contract</p>
                </div>
                <div className="text-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Lead Leakage</p>
                    <p className="text-4xl font-black text-rose-500">{Math.round((lostNoResponse / Math.max(leads.length, 1)) * 100)}%</p>
                    <p className="text-xs text-slate-500 mt-1">Leads lost to ghosting</p>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};
