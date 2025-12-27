
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Lead, MessageLog, MessageChannel } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, Smartphone, Send, Search, CheckSquare, History, Users, AlertCircle, MessageCircle, BellOff, Bell, ChevronLeft, ChevronRight, Wand2, Loader2, Sparkles, X, UserCheck, Layers, ClipboardCheck, BellRing, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";

interface FollowUpProps {
  leads: Lead[];
  messageLogs: MessageLog[];
  onSendMessage: (leadIds: string[], content: string, channel: MessageChannel, scheduledTime?: string) => Promise<void>;
  onScheduleFollowUp?: (leadIds: string[], date: string, task: string, details?: string) => void;
  initialSelectedLeadId?: string;
}

const ITEMS_PER_PAGE = 10;

export const FollowUp: React.FC<FollowUpProps> = ({ leads, messageLogs, onSendMessage, onScheduleFollowUp, initialSelectedLeadId }) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'history'>('leads');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [channel, setChannel] = useState<MessageChannel>('email');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  
  const [leadsPage, setLeadsPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  const [selectedLog, setSelectedLog] = useState<MessageLog | null>(null);
  
  const lastProcessedInitialId = useRef<string | undefined>(undefined);

  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const notifiedTasksRef = useRef<Set<string>>(new Set());

  // Reset pagination when searching or when history updates
  useEffect(() => {
    setHistoryPage(1);
  }, [searchTerm, messageLogs.length]);

  useEffect(() => {
    setLeadsPage(1);
  }, [searchTerm]);

  // Guarded effect for initial lead selection
  useEffect(() => {
    if (initialSelectedLeadId && initialSelectedLeadId !== lastProcessedInitialId.current) {
        setSelectedIds(new Set([initialSelectedLeadId]));
        setActiveTab('leads');
        lastProcessedInitialId.current = initialSelectedLeadId;
    }
  }, [initialSelectedLeadId]);

  useEffect(() => {
    if (notifPermission !== 'granted') return;
    const checkTasks = () => {
      const now = new Date();
      leads.forEach(lead => {
        if (lead.taskDueDate && !lead.taskCompleted && !notifiedTasksRef.current.has(lead.id)) {
          const dueDate = new Date(lead.taskDueDate);
          if (now >= dueDate) {
            new Notification(`Task Due: ${lead.name}`, {
              body: lead.nextFollowUpTask || "Time for follow-up outreach.",
              icon: "https://storage.googleapis.com/static.mira.bot/levrix_logo.png",
              tag: `task-${lead.id}`
            });
            notifiedTasksRef.current.add(lead.id);
          }
        }
      });
    };
    const interval = setInterval(checkTasks, 30000);
    return () => clearInterval(interval);
  }, [leads, notifPermission]);

  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
  };

  const handleSmartCompose = async () => {
    if (selectedIds.size === 0) return;
    setIsGenerating(true);
    try {
      const firstId = Array.from(selectedIds)[0];
      const selectedLead = leads.find(l => l.id === firstId);
      if (!selectedLead) return;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Draft a professional ${channel} outreach for a lead. 
        Lead Name: ${selectedLead.name}
        Current Status: ${selectedLead.status}
        Notes: ${selectedLead.notes || 'No previous notes'}
        Tone: Professional, helpful, concise. 
        Context: Follow up on their interest and suggest a brief call.
        IMPORTANT: Use the placeholder {{name}} for the recipient's name so I can bulk personalize it.`,
      });
      setMessage(response.text || '');
    } catch (error) {
      console.error("Smart Compose failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredLeads = useMemo(() => 
    leads.filter(lead => 
      (lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.propertyAddress || '').toLowerCase().includes(searchTerm.toLowerCase())
    ), [leads, searchTerm]
  );

  const filteredHistory = useMemo(() => 
    messageLogs.filter(log => 
      (log.leadName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.content || '').toLowerCase().includes(searchTerm.toLowerCase())
    ), [messageLogs, searchTerm]
  );

  const paginatedLeads = filteredLeads.slice((leadsPage - 1) * ITEMS_PER_PAGE, leadsPage * ITEMS_PER_PAGE);
  const paginatedHistory = filteredHistory.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE);

  const isAllOnPageSelected = paginatedLeads.length > 0 && paginatedLeads.every(l => selectedIds.has(l.id));

  const toggleSelectAllPage = () => {
    const newIds = new Set(selectedIds);
    if (isAllOnPageSelected) {
      paginatedLeads.forEach(l => newIds.delete(l.id));
    } else {
      paginatedLeads.forEach(l => newIds.add(l.id));
    }
    setSelectedIds(newIds);
  };

  const handleSend = async () => {
    if (selectedIds.size === 0 || !message.trim()) return;
    if (isScheduling && !scheduledDate) {
      alert("Please select a date and time for scheduling.");
      return;
    }

    setIsSending(true);
    const currentSelection = Array.from(selectedIds);
    
    try {
        await onSendMessage(currentSelection, message, channel, isScheduling ? scheduledDate : undefined);
        setIsSending(false);
        setSentSuccess(true);
        
        // Brief success pause before resetting UI and switching to history
        setTimeout(() => {
            setSentSuccess(false);
            setMessage('');
            setScheduledDate('');
            setIsScheduling(false);
            setSelectedIds(new Set());
            setHistoryPage(1); 
            setActiveTab('history');
        }, 800);
    } catch (err) {
        setIsSending(false);
        alert("Outreach dispatch failed. Please check your integrations.");
    }
  };

  const getChannelIcon = (ch: MessageChannel) => {
    switch (ch) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <Smartphone className="w-4 h-4" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sent': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Failed': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Queued': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col pb-20 md:pb-0 relative">
      {/* Sent Success Overlay */}
      {sentSuccess && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-emerald-500/10 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white rounded-[40px] shadow-3xl p-12 border border-emerald-100 flex flex-col items-center animate-in zoom-in-95 duration-300">
                  <div className="w-24 h-24 bg-emerald-500 rounded-[32px] flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-8">
                      <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-2">{isScheduling ? 'Outreach Scheduled' : 'Outreach Dispatched'}</h3>
                  <p className="text-slate-500 font-medium">{isScheduling ? 'Your message has been queued for delivery.' : 'Messages delivered to your pipeline successfully.'}</p>
              </div>
          </div>
      )}

      {notifPermission === 'default' && (
        <div className="bg-[#0f2925] text-white px-8 py-5 rounded-[40px] flex items-center justify-between shadow-2xl relative overflow-hidden animate-in slide-in-from-top-4 shrink-0">
          <div className="absolute inset-0 bg-emerald-500/5 animate-pulse-slow pointer-events-none" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-14 h-14 rounded-3xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20 shadow-xl">
                <BellRing className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
                <p className="text-lg font-bold">Never miss a follow-up</p>
                <p className="text-sm text-teal-100/50">Real-time alerts for overdue tasks and pipeline risks.</p>
            </div>
          </div>
          <Button onClick={requestNotificationPermission} className="bg-emerald-500 text-white hover:bg-emerald-600 h-12 px-10 font-black uppercase tracking-widest rounded-2xl shadow-emerald-500/20 relative z-10 border-none">
            Grant Live Access
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Outreach Hub</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-slate-500">Engage your pipeline with personalized bulk messaging.</p>
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border",
                notifPermission === 'granted' ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm" : 
                notifPermission === 'denied' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-100 text-slate-500 border-slate-200"
              )}>
                {notifPermission === 'granted' ? <Bell className="w-2.5 h-2.5" /> : <BellOff className="w-2.5 h-2.5" />}
                {notifPermission === 'granted' ? "Live Alerts" : "Alerts Off"}
              </div>
            </div>
          </div>
          <div className="flex bg-white p-1.5 rounded-3xl border border-slate-200 shadow-xl">
            <button 
                onClick={() => setActiveTab('leads')}
                className={cn(
                    "flex items-center gap-2 px-8 py-3 text-sm font-black uppercase tracking-widest rounded-2xl transition-all",
                    activeTab === 'leads' ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" : "text-slate-400 hover:text-slate-600"
                )}
            >
                <Users className="w-4 h-4" /> Pipeline
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={cn(
                    "flex items-center gap-2 px-8 py-3 text-sm font-black uppercase tracking-widest rounded-2xl transition-all",
                    activeTab === 'history' ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" : "text-slate-400 hover:text-slate-600"
                )}
            >
                <History className="w-4 h-4" /> History
            </button>
          </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        <Card className="flex-1 flex flex-col overflow-hidden border-slate-100 shadow-2xl bg-white min-h-0">
            <CardHeader className="border-b bg-slate-50/20 py-6 px-8 flex flex-row items-center justify-between shrink-0">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder={activeTab === 'leads' ? "Filter outreach list..." : "Search history logs..."}
                        className="pl-12 h-12 rounded-2xl border-slate-100 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {activeTab === 'leads' && (
                    <div className="flex items-center gap-4 ml-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {selectedIds.size} Selected
                        </span>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedIds(new Set())}
                            disabled={selectedIds.size === 0}
                            className="text-slate-400 hover:text-rose-600 text-[10px] font-black uppercase tracking-[0.2em] h-10 px-4"
                        >
                            Clear Selection
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto no-scrollbar">
                {activeTab === 'leads' ? (
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50 sticky top-0 border-b border-slate-100 font-black tracking-[0.2em] z-10">
                            <tr>
                                <th className="px-8 py-5 w-10">
                                    <button 
                                        onClick={toggleSelectAllPage}
                                        className={cn(
                                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                            isAllOnPageSelected ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20" : "border-slate-200 hover:border-slate-300 bg-white"
                                        )}
                                    >
                                        {isAllOnPageSelected && <CheckSquare className="w-4 h-4 text-white" />}
                                    </button>
                                </th>
                                <th className="px-4 py-5">Buyer Intel</th>
                                <th className="px-4 py-5">Pipeline Status</th>
                                <th className="px-4 py-5 text-right pr-8">Interest Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <p className="text-slate-400 font-bold italic">No leads match your search criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedLeads.map(lead => (
                                    <tr 
                                        key={lead.id} 
                                        className={cn(
                                            "hover:bg-slate-50/50 cursor-pointer transition-colors group", 
                                            selectedIds.has(lead.id) && "bg-emerald-50/30"
                                        )} 
                                        onClick={() => {
                                            const newIds = new Set(selectedIds);
                                            if (newIds.has(lead.id)) newIds.delete(lead.id); else newIds.add(lead.id);
                                            setSelectedIds(newIds);
                                        }}
                                    >
                                        <td className="px-8 py-6">
                                            <div className={cn(
                                                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                                selectedIds.has(lead.id) ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20" : "border-slate-200 group-hover:border-slate-300 bg-white"
                                            )}>
                                                {selectedIds.has(lead.id) && <CheckSquare className="w-4 h-4 text-white" />}
                                            </div>
                                        </td>
                                        <td className="px-4 py-6">
                                            <div className="font-bold text-slate-900 text-base">{lead.name}</div>
                                            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">{lead.email}</div>
                                        </td>
                                        <td className="px-4 py-6">
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-white px-3 py-1.5 rounded-xl border border-slate-100 text-slate-600 shadow-sm">{lead.status}</span>
                                        </td>
                                        <td className="px-4 py-6 pr-8">
                                            <div className="flex items-center justify-end gap-4">
                                                <div className="h-2 w-20 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                    <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.3)]" style={{ width: `${lead.priorityScore || 50}%` }} />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 tracking-tighter">{lead.priorityScore || '--'}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50 sticky top-0 border-b border-slate-100 font-black tracking-[0.2em] z-10">
                            <tr>
                                <th className="px-8 py-5">Method</th>
                                <th className="px-4 py-5">Lead & Content Preview</th>
                                <th className="px-4 py-5">Status</th>
                                <th className="px-4 py-5 text-right pr-8">Scheduled / Sent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <p className="text-slate-400 font-bold italic">No outreach history found.</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedHistory.map(log => (
                                    <tr 
                                        key={log.id} 
                                        className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                        onClick={() => setSelectedLog(log)}
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4 text-slate-600 font-black uppercase text-[9px] tracking-[0.15em]">
                                                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                                                    {getChannelIcon(log.channel)}
                                                </div>
                                                {log.channel}
                                            </div>
                                        </td>
                                        <td className="px-4 py-6">
                                            <div className="font-bold text-slate-900">{log.leadName}</div>
                                            <div className="text-[11px] text-slate-500 truncate max-w-[240px] font-medium leading-relaxed">{log.content}</div>
                                        </td>
                                        <td className="px-4 py-6">
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all shadow-sm flex items-center w-fit gap-1.5",
                                                getStatusColor(log.status)
                                            )}>
                                                {log.status === 'Queued' ? <Clock className="w-2.5 h-2.5" /> : <CheckCircle2 className="w-2.5 h-2.5" />}
                                                {log.status === 'Queued' ? 'Scheduled' : log.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-6 text-right pr-8">
                                            <div className="flex flex-col items-end">
                                                <span className={cn(
                                                    "text-[11px] font-bold",
                                                    log.status === 'Queued' ? "text-amber-600" : "text-slate-400"
                                                )}>
                                                    {formatDate(log.status === 'Queued' && log.scheduledAt ? log.scheduledAt : log.sentAt)}
                                                </span>
                                                {log.status === 'Queued' && (
                                                    <span className="text-[9px] font-black uppercase text-amber-500/60 tracking-widest mt-0.5">Target Delivery</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </CardContent>
            <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between shrink-0">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    Showing {activeTab === 'leads' ? paginatedLeads.length : paginatedHistory.length} records
                </p>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-10 w-10 p-0 rounded-xl bg-white border-slate-200"
                        onClick={() => activeTab === 'leads' ? setLeadsPage(p => Math.max(1, p - 1)) : setHistoryPage(p => Math.max(1, p - 1))}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-10 w-10 p-0 rounded-xl bg-white border-slate-200"
                        onClick={() => activeTab === 'leads' ? setLeadsPage(p => p + 1) : setHistoryPage(p => p + 1)}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Card>

        <div className="w-full lg:w-[460px] flex flex-col gap-6 overflow-y-auto no-scrollbar min-h-0">
            <Card className="flex flex-col border-slate-100 shadow-2xl relative overflow-hidden bg-white shrink-0">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-900" />
                <CardHeader className="border-b bg-slate-50/30 py-6 px-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Composer</CardTitle>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Multi-Channel Outreach</p>
                        </div>
                        <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 shadow-sm">
                            <Users className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-black text-emerald-700">{selectedIds.size}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="flex bg-slate-100 p-1.5 rounded-3xl border border-slate-200/50 shadow-inner">
                        {(['email', 'sms', 'whatsapp'] as MessageChannel[]).map(ch => (
                            <button 
                                key={ch} 
                                onClick={() => setChannel(ch)} 
                                className={cn(
                                    "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all", 
                                    channel === ch ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/30" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {ch}
                            </button>
                        ))}
                    </div>

                    <div className="relative group">
                        <textarea 
                            className="w-full h-48 p-6 rounded-[32px] border-slate-100 bg-slate-50 focus:bg-white transition-all text-sm resize-none focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 leading-relaxed shadow-inner font-medium"
                            placeholder={selectedIds.size > 0 ? "Type outreach message... (Tip: Use {{name}} tag)" : "Select leads from your pipeline to unlock the composer..."}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={selectedIds.size === 0 || isSending || sentSuccess}
                        />
                        <div className="absolute bottom-6 left-8 flex items-center gap-3">
                             <div className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                                Tags: {"{{name}}"}
                             </div>
                        </div>
                        <button 
                            onClick={handleSmartCompose}
                            disabled={isGenerating || selectedIds.size === 0 || isSending || sentSuccess}
                            className="absolute bottom-6 right-6 h-14 w-14 bg-slate-900 text-white rounded-3xl shadow-2xl hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center border-none"
                            title="Gemini AI Compose"
                        >
                            {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Wand2 className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Scheduling Section */}
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Clock className={cn("w-4 h-4 transition-colors", isScheduling ? "text-emerald-500" : "text-slate-400")} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Schedule for Later</span>
                            </div>
                            <button 
                                onClick={() => setIsScheduling(!isScheduling)}
                                className={cn(
                                    "w-10 h-5 rounded-full transition-all relative border",
                                    isScheduling ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-slate-200 border-slate-300"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all",
                                    isScheduling ? "right-1" : "left-1"
                                )} />
                            </button>
                        </div>
                        {isScheduling && (
                            <div className="animate-in slide-in-from-top-2 duration-300 space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Dispatch Date & Time</label>
                                <Input 
                                    type="datetime-local" 
                                    className="h-10 bg-white rounded-xl text-xs" 
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    min={new Date().toISOString().substring(0, 16)}
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <Button 
                            className={cn(
                                "w-full h-16 rounded-[28px] text-base font-black uppercase tracking-widest shadow-2xl transition-all hover:-translate-y-1 active:scale-[0.98]",
                                sentSuccess ? "bg-emerald-500 text-white border-none" : "shadow-emerald-500/20"
                            )} 
                            onClick={handleSend} 
                            disabled={isSending || selectedIds.size === 0 || !message.trim() || sentSuccess}
                            isLoading={isSending}
                        >
                            {sentSuccess ? (
                                <><CheckCircle2 className="w-5 h-5 mr-3" /> {isScheduling ? 'Scheduled' : 'Dispatched'}</>
                            ) : isSending ? (
                                'Processing...'
                            ) : isScheduling ? (
                                <><Calendar className="w-5 h-5 mr-3" /> Schedule Outreach</>
                            ) : (
                                <><Send className="w-5 h-5 mr-3" /> Blast Outreach</>
                            )}
                        </Button>

                        {(selectedIds.size === 0 && !isSending && !sentSuccess) && (
                            <div className="p-6 bg-amber-50/40 rounded-[32px] border border-dashed border-amber-200/50 flex items-start gap-5 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                                <div className="space-y-1.5">
                                    <p className="text-sm font-black text-amber-900 uppercase tracking-wide">Selection Needed</p>
                                    <p className="text-xs text-amber-700/70 leading-relaxed font-medium">Bulk messaging requires at least one active lead. Tap a record in the pipeline to begin.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#0f2925] text-white border-none shadow-2xl overflow-hidden relative rounded-[40px] shrink-0">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[80px] -mr-20 -mt-20" />
                <CardContent className="p-10 relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/20 shadow-xl">
                            <Sparkles className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-200/40">Outreach Tip</h4>
                    </div>
                    <p className="text-sm text-teal-50/80 leading-relaxed font-medium">
                        Personalized messages containing the lead's name see a <span className="text-emerald-400 font-black">45% higher engagement</span>. Use the <code className="bg-white/10 px-2 py-0.5 rounded text-teal-200 text-xs">{"{{name}}"}</code> tag to automate personalization.
                    </p>
                </CardContent>
            </Card>
        </div>
      </div>

      {selectedLog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-6 animate-in fade-in duration-300">
              <div 
                className="bg-white rounded-[48px] shadow-3xl w-full max-w-2xl overflow-hidden border border-white/20 relative animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                  <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-br from-slate-900 to-slate-800 pointer-events-none" />
                  <div className="relative z-10 p-12">
                      <div className="flex justify-between items-start mb-12">
                          <div className="flex items-center gap-6">
                              <div className="w-20 h-20 rounded-[32px] bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-2xl backdrop-blur-md">
                                  {getChannelIcon(selectedLog.channel)}
                              </div>
                              <div>
                                  <h3 className="text-3xl font-bold text-white">{selectedLog.leadName}</h3>
                                  <div className="flex items-center gap-4 mt-2">
                                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-teal-200">{selectedLog.channel}</span>
                                      <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">{formatDate(selectedLog.sentAt)}</span>
                                  </div>
                              </div>
                          </div>
                          <button onClick={() => setSelectedLog(null)} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl transition-all text-white border border-white/10 shadow-xl"><X className="w-6 h-6" /></button>
                      </div>
                      <div className="space-y-10">
                          <div className="bg-slate-50 rounded-[32px] p-10 border border-slate-100 shadow-inner">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Full Outreach Log</p>
                              <p className="text-slate-800 text-base leading-relaxed whitespace-pre-wrap font-medium">{selectedLog.content}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-6">
                              <div className="p-6 bg-white border border-slate-100 rounded-[28px] text-center shadow-sm">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Delivery Status</p>
                                  <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border", getStatusColor(selectedLog.status))}>
                                      {selectedLog.status}
                                  </div>
                              </div>
                              <div className="p-6 bg-white border border-slate-100 rounded-[28px] text-center shadow-sm">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">System ID</p>
                                  <p className="text-xs font-black text-slate-900 font-mono tracking-tighter">#{selectedLog.id}</p>
                              </div>
                              <div className="p-6 bg-white border border-slate-100 rounded-[28px] text-center shadow-sm">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Scheduled At</p>
                                  <p className="text-xs font-black text-slate-900 tracking-tight">{selectedLog.scheduledAt ? formatDate(selectedLog.scheduledAt) : 'N/A'}</p>
                              </div>
                          </div>
                          <div className="pt-6 flex gap-4">
                              <Button className="flex-1 h-16 rounded-[28px] bg-slate-900 shadow-2xl shadow-slate-900/20" onClick={() => { setMessage(selectedLog.content); setSelectedIds(new Set([selectedLog.leadId])); setChannel(selectedLog.channel); setActiveTab('leads'); setSelectedLog(null); }}>
                                  <Layers className="w-5 h-5 mr-3" /> Template reuse
                              </Button>
                              <Button variant="outline" className="flex-1 h-16 rounded-[28px] border-slate-200 font-black uppercase tracking-widest text-xs" onClick={() => setSelectedLog(null)}>Dismiss Details</Button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
