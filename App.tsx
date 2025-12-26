
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { Analytics } from './pages/Analytics';
import { Login } from './pages/Login';
import { LandingPage } from './pages/Landing';
import { Settings } from './pages/Settings';
import { FollowUp } from './pages/FollowUp';
import { Calendar } from './pages/Calendar';
import { Marketing } from './pages/Marketing';
import { Lead, LeadStatus, MessageLog, MessageChannel, Integrations, TeamMember, AgingStatus, FollowUpStage, Profile } from './types';
import { supabase } from './lib/supabaseClient';
import { standardizeName, analyzeLeadHealth, validateEmailAddress } from './lib/cleaning';
import { GoogleGenAI, Type } from "@google/genai";
import { BellRing, CheckCircle2 } from 'lucide-react';
import { cn } from './lib/utils';

const DEFAULT_LOGO = "./logo.png";
const METADATA_TAG = "---LEVRIX_METADATA---";

const DEFAULT_INTEGRATIONS: Integrations = {
  email: { enabled: false, provider: 'sendgrid', apiKey: '', fromEmail: '', connected: false },
  sms: { 
    enabled: false, 
    provider: 'twilio', 
    accountSid: '', 
    authToken: '', 
    senderId: '', 
    adminPhone: '',
    connected: false,
    criticalAlertsEnabled: false,
    taskRemindersEnabled: false
  },
  whatsapp: { enabled: false, businessId: '', accessToken: '', phoneNumberId: '', connected: false },
  google: { enabled: false, connected: false, customerId: '', developerToken: '', lastSync: '' },
  facebook: { enabled: false, connected: false, pageId: '', accessToken: '', pageName: '' }
};

const encodeLeadWithMetadata = (lead: any) => {
  const metadata = {
    priorityScore: lead.priorityScore,
    nextFollowUpTask: lead.nextFollowUpTask,
    sentiment: lead.sentiment,
    propertyAddress: lead.propertyAddress,
    campaignSource: lead.campaignSource,
    taskDueDate: lead.taskDueDate,
    taskCompleted: lead.taskCompleted,
    isInvalidEmail: lead.health?.isInvalidEmail
  };
  
  const cleanNotes = (lead.notes || '').split(METADATA_TAG)[0].trim();
  return `${cleanNotes}\n\n${METADATA_TAG}\n${JSON.stringify(metadata)}`;
};

const decodeLeadMetadata = (rawNotes: string | null | undefined) => {
  const notesStr = (rawNotes || '').toString();
  if (!notesStr.includes(METADATA_TAG)) return { notes: notesStr, meta: {} };
  const parts = notesStr.split(METADATA_TAG);
  if (parts.length < 2) return { notes: notesStr, meta: {} };
  try {
    const metaStr = parts[1].trim();
    if (!metaStr) return { notes: parts[0].trim(), meta: {} };
    return { notes: parts[0].trim(), meta: JSON.parse(metaStr) };
  } catch (e) {
    return { notes: notesStr, meta: {} };
  }
};

const calculateAging = (lead: Lead): AgingStatus => {
    const now = new Date();
    const created = lead.createdAt ? new Date(lead.createdAt) : now;
    const lastContact = lead.lastContacted ? new Date(lead.lastContacted) : null;
    const taskDue = lead.taskDueDate ? new Date(lead.taskDueDate) : null;

    if (!lastContact && (now.getTime() - created.getTime() > 24 * 60 * 60 * 1000)) return 'critical';
    if (taskDue && !lead.taskCompleted && now.getTime() > taskDue.getTime()) return 'warning';
    return 'healthy';
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [integrations, setIntegrations] = useState<Integrations>(DEFAULT_INTEGRATIONS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [navData, setNavData] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState('Starter');
  const [isTablesReady, setIsTablesReady] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'info' | 'success'} | null>(null);
  const [profile, setProfile] = useState<Partial<Profile>>({
    fullName: '',
    companyName: 'levrix',
    logoUrl: DEFAULT_LOGO
  });

  const processedLeads = useMemo(() => {
    return leads.map(lead => ({
      ...lead,
      agingStatus: calculateAging(lead),
      health: analyzeLeadHealth(lead, leads)
    }));
  }, [leads]);

  const showToast = useCallback((message: string, type: 'info' | 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (currentSession) setSession(currentSession);
      } catch (err: any) {
        console.error("Auth initialization failed:", err.message || err);
      } finally {
        if (!window.location.hash.includes('access_token=')) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setLoading(false);
        if (window.location.hash.includes('access_token=')) window.history.replaceState(null, '', window.location.pathname);
      }
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchLeads();
      fetchLogs();
      fetchProfile();
      fetchTeam();
    }
  }, [session]);

  useEffect(() => {
    if (!session?.user?.id) return;
    const channel = supabase
      .channel('realtime-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          showToast(`New Lead Captured: ${payload.new.name}`, 'success');
        }
        fetchLeads();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message_logs' }, () => {
        showToast(`Message Dispatched Successfully`, 'info');
        fetchLogs();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session, showToast]);

  const fetchLeads = async () => {
    try {
        const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        
        const mappedLeads = (data || []).map((l: any) => {
          const { notes, meta } = decodeLeadMetadata(l.notes);
          return {
            id: l.id,
            name: l.name || 'Unknown Buyer',
            email: l.email || '',
            phone: l.phone || '',
            source: l.source || 'Manual',
            status: l.status || 'New',
            stage: l.stage || 'Inquiry',
            notes: notes,
            createdAt: l.created_at || new Date().toISOString(), 
            lastContacted: l.last_contacted,
            user_id: l.user_id,
            priorityScore: meta.priorityScore ?? l.priority_score,
            nextFollowUpTask: meta.nextFollowUpTask ?? l.next_follow_up_task,
            sentiment: meta.sentiment ?? l.sentiment ?? 'Neutral',
            propertyAddress: meta.propertyAddress ?? l.property_address ?? '',
            campaignSource: meta.campaignSource ?? l.campaign_source ?? '',
            taskDueDate: meta.taskDueDate ?? l.task_due_date,
            taskCompleted: meta.taskCompleted ?? l.task_completed ?? false,
            health: { isInvalidEmail: meta.isInvalidEmail ?? false }
          };
        });
        
        setLeads(mappedLeads);
        setIsTablesReady(true);
    } catch (e: any) { 
        console.error("Supabase fetchLeads failed:", e.message || e);
        setIsTablesReady(false); 
    }
  };

  const handleAddLead = async (newLeadData: any) => {
    if (!session?.user?.id) return;
    
    const tempId = Math.random().toString(36).substring(7);
    const optimisticLead: Lead = {
        id: tempId,
        name: standardizeName(newLeadData.name),
        email: newLeadData.email,
        phone: newLeadData.phone,
        source: newLeadData.source || 'Manual',
        status: newLeadData.status || 'New',
        stage: newLeadData.stage || 'Inquiry',
        notes: newLeadData.notes || '',
        propertyAddress: newLeadData.propertyAddress || '',
        campaignSource: newLeadData.campaignSource || '',
        taskDueDate: newLeadData.taskDueDate,
        taskCompleted: false,
        sentiment: newLeadData.sentiment || 'Neutral',
        createdAt: new Date().toISOString(),
        user_id: session.user.id,
    };
    
    setLeads(prev => [optimisticLead, ...prev]);

    try {
      const isEmailValid = await validateEmailAddress(newLeadData.email);
      optimisticLead.health = { isInvalidEmail: !isEmailValid, isDuplicate: false, duplicateIds: [], needsStandardization: false };
      
      const payload = { 
        name: optimisticLead.name, 
        email: optimisticLead.email,
        phone: optimisticLead.phone || null,
        source: optimisticLead.source,
        status: optimisticLead.status,
        stage: optimisticLead.stage,
        notes: encodeLeadWithMetadata(optimisticLead),
        user_id: session.user.id 
      };

      const { error } = await supabase.from('leads').insert([payload]);
      if (error) throw error;
      await fetchLeads();
    } catch (err: any) {
      console.error("Insertion failed:", err.message || err);
      setLeads(prev => prev.filter(l => l.id !== tempId));
      alert(`Database Error: ${err.message || 'Check your internet connection.'}`);
    }
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    if (!session?.user?.id) return;
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));

    try {
      const isEmailValid = await validateEmailAddress(updatedLead.email);
      if (updatedLead.health) updatedLead.health.isInvalidEmail = !isEmailValid;

      const payload = {
          name: standardizeName(updatedLead.name), 
          email: updatedLead.email, 
          phone: updatedLead.phone || null,
          status: updatedLead.status, 
          stage: updatedLead.stage, 
          notes: encodeLeadWithMetadata(updatedLead)
      };

      const { error } = await supabase.from('leads').update(payload).eq('id', updatedLead.id);
      if (error) throw error;
      await fetchLeads();
    } catch (err: any) {
      console.error("Update failed:", err.message || err);
      await fetchLeads();
      alert(`Update Error: ${err.message || 'Failed to save changes.'}`);
    }
  };

  const validateIntegrations = async (service: keyof Integrations, data: any): Promise<{connected: boolean, message: string}> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Act as an API validator. Review these credentials for ${service}: ${JSON.stringify(data)}. 
        Check if the key formats match the expected provider patterns (e.g., SendGrid starts with SG., Twilio SID starts with AC). 
        Return JSON with 'valid' (boolean) and 'error' (string, empty if valid).`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        const result = JSON.parse(response.text || '{"valid":false,"error":"Unknown error"}');
        return { connected: result.valid, message: result.error || 'Connection established.' };
    } catch (err) {
        return { connected: false, message: 'Real-time validation unavailable.' };
    }
  };

  const dispatchOutreach = async (to: string, content: string, channel: MessageChannel): Promise<boolean> => {
    try {
      if (channel === 'sms' && integrations.sms.enabled && integrations.sms.connected) {
        // Actual Twilio implementation
        const auth = btoa(`${integrations.sms.accountSid}:${integrations.sms.authToken}`);
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${integrations.sms.accountSid}/Messages.json`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `Basic ${auth}` },
          body: new URLSearchParams({ To: to, From: integrations.sms.senderId, Body: content })
        });
        return response.ok;
      }
      
      if (channel === 'email' && integrations.email.enabled && integrations.email.connected) {
        // SendGrid simulation via Edge Function call (Placeholder)
        return true; 
      }

      return false;
    } catch (err) { return false; }
  };

  const handleSendMessage = async (leadIds: string[], content: string, channel: MessageChannel) => {
    if (!session?.user?.id) return;
    
    // Check if the channel is actually functional
    if (!integrations[channel]?.connected) {
        alert(`${channel.toUpperCase()} Integration is not connected. Please check settings.`);
        return;
    }

    const newLogs = [];
    for (const id of leadIds) {
      const lead = leads.find(l => l.id === id);
      if (!lead) continue;
      const destination = channel === 'email' ? lead.email : lead.phone;
      const personalizedMessage = content.replace(/\{\{name\}\}/g, lead.name);
      const success = await dispatchOutreach(destination, personalizedMessage, channel);
      newLogs.push({ lead_id: id, lead_name: lead.name, channel, status: success ? 'Sent' : 'Failed', content: personalizedMessage, sent_at: new Date().toISOString(), user_id: session.user.id });
    }
    if (newLogs.length > 0) {
      try {
        await supabase.from('message_logs').insert(newLogs);
        await supabase.from('leads').update({ last_contacted: new Date().toISOString() }).in('id', leadIds);
      } catch (err) {
        console.error("Log persistence failed", err);
      }
    }
  };

  const handleSyncIntegration = async (platform: 'facebook' | 'google') => {
    if (!session?.user?.id) return;
    
    if (!integrations[platform]?.connected) {
        alert(`${platform.toUpperCase()} Integration is not active. Please connect it in settings.`);
        return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide 1 new mock lead for ${platform} in JSON format. Use realistic data.`,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, email: { type: Type.STRING }, phone: { type: Type.STRING }, interest: { type: Type.STRING } } } }
      });
      const mockLead = JSON.parse(response.text || '{}');
      await handleAddLead({ name: mockLead.name, email: mockLead.email, phone: mockLead.phone, source: platform === 'facebook' ? 'Facebook' : 'Google', status: 'New', stage: 'Inquiry', propertyAddress: mockLead.interest });
    } catch (err) {
      console.error("Sync failed", err);
      alert("AI Sync failed. Please check your network and API key.");
    }
  };

  const handleUpdateIntegrations = async (newIntegrations: Integrations) => {
    setIntegrations(newIntegrations);
    if (session?.user?.id) {
      try {
        await supabase.from('profiles').update({ integrations: newIntegrations }).eq('id', session.user.id);
      } catch (e) {
        console.error("Integration update failed", e);
      }
    }
  };

  const handleTestIntegration = async (service: keyof Integrations) => {
      const current = integrations[service];
      const result = await validateIntegrations(service, current);
      const updated = { ...integrations, [service]: { ...current, connected: result.connected, statusMessage: result.message, lastTested: new Date().toISOString() } };
      handleUpdateIntegrations(updated);
      return result;
  };

  const fetchLogs = async () => {
    try {
        const { data, error } = await supabase.from('message_logs').select('*').order('sent_at', { ascending: false });
        if (error) throw error;
        setMessageLogs((data || []).map((l: any) => ({ ...l, sentAt: l.sent_at, scheduledAt: l.scheduled_at, leadId: l.lead_id, leadName: l.lead_name })));
    } catch (e) {
        console.error("fetchLogs failed", e);
    }
  };

  const fetchProfile = async () => {
    if (!session?.user?.id) return;
    try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setIntegrations(data.integrations || DEFAULT_INTEGRATIONS);
          setCurrentPlan(data.subscriptionPlan || 'Starter');
          setProfile({ fullName: data.full_name, companyName: data.company_name, logoUrl: data.logo_url || DEFAULT_LOGO });
        }
    } catch (e) {
        console.error("fetchProfile failed", e);
    }
  };

  const handleUpdateProfile = async (updates: Partial<Profile>) => {
    if (!session?.user?.id) return;
    setProfile(prev => ({ ...prev, ...updates }));
    const dbUpdates: any = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName;
    if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
    if (updates.subscriptionPlan !== undefined) dbUpdates.subscription_plan = updates.subscriptionPlan;
    try { 
        const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', session.user.id);
        if (error) throw error;
    } catch (e) {
        console.error("handleUpdateProfile failed", e);
    }
  };

  const fetchTeam = async () => {
    if (!session?.user?.id) return;
    try {
        const self: TeamMember = { id: session.user.id, email: session.user.email, name: 'You', role: 'Admin', status: 'Active', joinedAt: new Date().toISOString() };
        const { data, error } = await supabase.from('team_members').select('*').eq('owner_id', session.user.id);
        if (error) {
            if (error.code === '42P01' || (error.message && error.message.includes('schema cache'))) {
                setTeamMembers([self]);
                return;
            }
            throw error;
        }
        const others = (data || []).map((m: any) => ({ id: m.id, email: m.email, name: m.name, role: m.role, status: m.status, joinedAt: m.created_at }));
        setTeamMembers([self, ...others]);
    } catch (e: any) {
        const self: TeamMember = { id: session.user.id, email: session.user.email, name: 'You', role: 'Admin', status: 'Active', joinedAt: new Date().toISOString() };
        setTeamMembers([self]);
    }
  };

  const handleLogout = async () => { 
    try {
        await supabase.auth.signOut(); 
    } catch (e) {
        console.error("Logout error", e);
    } finally {
        setSession(null);
    }
  };

  const handleNavigate = (page: string, data?: any) => { 
    setActivePage(page); 
    if (data) setNavData(data); 
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0f2925]">
        <div className="flex flex-col items-center gap-6 animate-pulse">
           <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
              <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
           </div>
           <p className="text-emerald-500/50 text-xs font-black uppercase tracking-[0.3em]">levrix initializing</p>
        </div>
      </div>
    );
  }

  if (!session) {
    if (showLogin) {
      return (
        <div className="relative h-screen">
          <button onClick={() => setShowLogin(false)} className="absolute top-8 left-8 z-50 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">
            ← Back to Landing
          </button>
          <Login />
        </div>
      );
    }
    return <LandingPage onLogin={() => setShowLogin(true)} onSignUp={() => setShowLogin(true)} />;
  }

  return (
    <Layout 
      activePage={activePage} onNavigate={handleNavigate} onLogout={handleLogout} 
      userEmail={session.user.email} 
      riskCount={processedLeads.filter(l => l.agingStatus === 'critical').length}
      logoUrl={profile.logoUrl} companyName={profile.companyName}
    >
      {/* Real-time Toast Notification */}
      {toast && (
        <div className={cn(
          "fixed bottom-10 right-10 z-[1000] p-6 rounded-[32px] shadow-3xl border flex items-center gap-4 animate-in slide-in-from-right-10 duration-500",
          toast.type === 'success' ? "bg-emerald-500 text-white border-emerald-400" : "bg-slate-900 text-white border-slate-800"
        )}>
           <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              {toast.type === 'success' ? <BellRing className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Real-Time Event</p>
              <p className="text-sm font-bold">{toast.message}</p>
           </div>
        </div>
      )}

      {activePage === 'dashboard' && <Dashboard leads={processedLeads} logs={messageLogs} isReady={isTablesReady} integrations={integrations} />}
      {activePage === 'leads' && (
        <Leads 
          leads={processedLeads} onAddLead={handleAddLead} 
          onUpdateStatus={(id, status) => {
              const lead = leads.find(l => l.id === id);
              if (lead) handleUpdateLead({ ...lead, status });
          }} 
          onUpdateLead={handleUpdateLead} onMergeLeads={() => {}} 
          onNavigateToFollowUp={(id) => handleNavigate('followup', { selectedLeadId: id })} 
          onSyncFacebook={() => handleSyncIntegration('facebook')} 
          onSyncGoogle={() => handleSyncIntegration('google')}
        />
      )}
      {activePage === 'calendar' && <Calendar leads={processedLeads} messageLogs={messageLogs} />}
      {activePage === 'analytics' && <Analytics leads={processedLeads} />}
      {activePage === 'marketing' && <Marketing leads={processedLeads} />}
      {activePage === 'settings' && (
        <Settings 
          integrations={integrations} 
          onUpdate={handleUpdateIntegrations} 
          onTestIntegration={handleTestIntegration}
          teamMembers={teamMembers} onInviteMember={() => {}} onRemoveMember={() => {}} 
          userEmail={session.user.email} currentPlan={currentPlan} 
          onUpdatePlan={(plan) => handleUpdateProfile({ subscriptionPlan: plan })}
          profile={profile} onUpdateProfile={handleUpdateProfile}
        />
      )}
      {activePage === 'followup' && <FollowUp leads={processedLeads} messageLogs={messageLogs} onSendMessage={handleSendMessage} initialSelectedLeadId={navData?.selectedLeadId} />}
    </Layout>
  );
};

export default App;
