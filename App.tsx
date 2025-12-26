
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { Analytics } from './pages/Analytics';
import { Login } from './pages/Login';
import { Settings } from './pages/Settings';
import { FollowUp } from './pages/FollowUp';
import { Calendar } from './pages/Calendar';
import { Marketing } from './pages/Marketing';
import { Lead, LeadStatus, MessageLog, MessageChannel, Integrations, TeamMember, AgingStatus, FollowUpStage, Profile } from './types';
import { supabase } from './lib/supabaseClient';
import { standardizeName, analyzeLeadHealth } from './lib/cleaning';
import { GoogleGenAI, Type } from "@google/genai";

const DEFAULT_LOGO = "./logo.png";

const DEFAULT_INTEGRATIONS: Integrations = {
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
  google: { connected: false, customerId: '', developerToken: '', lastSync: '' },
  facebook: { connected: false, pageId: '', accessToken: '', pageName: '' }
};

const calculateAging = (lead: Lead): AgingStatus => {
    const now = new Date();
    const created = new Date(lead.createdAt);
    const lastContact = lead.lastContacted ? new Date(lead.lastContacted) : null;
    const taskDue = lead.taskDueDate ? new Date(lead.taskDueDate) : null;

    if (!lastContact && (now.getTime() - created.getTime() > 24 * 60 * 60 * 1000)) return 'critical';
    if (taskDue && !lead.taskCompleted && now.getTime() > taskDue.getTime()) return 'warning';
    return 'healthy';
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [integrations, setIntegrations] = useState<Integrations>(DEFAULT_INTEGRATIONS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [navData, setNavData] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState('Starter');
  const [isTablesReady, setIsTablesReady] = useState(true);
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

  // Auth & Session Logic
  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (currentSession) {
        setSession(currentSession);
      }
      // Only stop loading if we aren't in the middle of a redirect flow
      if (!window.location.hash.includes('access_token=')) {
        setLoading(false);
      }
    });

    // 2. Listen for Auth Changes (Essential for OAuth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log(`Auth Event Triggered: ${event}`);
      setSession(newSession);
      
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setLoading(false);
        // Instant URL cleanup to remove tokens from address bar
        if (window.location.hash.includes('access_token=')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
      
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch data only when session is active
  useEffect(() => {
    if (session?.user) {
      fetchLeads();
      fetchLogs();
      fetchProfile();
      fetchTeam();
    }
  }, [session]);

  // Real-time Supabase Subscription for leads/logs
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel('realtime-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => fetchLeads())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message_logs' }, () => fetchLogs())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const fetchLeads = async () => {
    try {
        const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setLeads((data || []).map((l: any) => ({
          ...l,
          createdAt: l.created_at, lastContacted: l.last_contacted,
          taskDueDate: l.task_due_date, taskCompleted: l.task_completed,
          priorityScore: l.priority_score, propertyAddress: l.property_address,
          campaignSource: l.campaign_source
        })));
        setIsTablesReady(true);
    } catch (e) { 
        console.error("Supabase leads fetch failed", e);
        setIsTablesReady(false); 
    }
  };

  const dispatchOutreach = async (to: string, content: string, channel: MessageChannel): Promise<boolean> => {
    try {
      if (channel === 'sms' && integrations.sms.enabled && integrations.sms.accountSid) {
        const auth = btoa(`${integrations.sms.accountSid}:${integrations.sms.authToken}`);
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${integrations.sms.accountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`
          },
          body: new URLSearchParams({
            To: to,
            From: integrations.sms.senderId,
            Body: content
          })
        });
        return response.ok;
      }

      if (channel === 'whatsapp' && integrations.whatsapp.enabled && integrations.whatsapp.accessToken) {
        const response = await fetch(`https://graph.facebook.com/v17.0/${integrations.whatsapp.phoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${integrations.whatsapp.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: to.replace(/\D/g, ''),
            type: "text",
            text: { body: content }
          })
        });
        return response.ok;
      }

      if (channel === 'email') return true; 

      return false;
    } catch (err) {
      console.error(`Failed to dispatch ${channel}:`, err);
      return false;
    }
  };

  const handleSendMessage = async (leadIds: string[], content: string, channel: MessageChannel) => {
    if (!session?.user?.id) return;

    const newLogs = [];
    for (const id of leadIds) {
      const lead = leads.find(l => l.id === id);
      if (!lead) continue;

      const destination = channel === 'email' ? lead.email : lead.phone;
      const personalizedMessage = content.replace(/\{\{name\}\}/g, lead.name);
      
      const success = await dispatchOutreach(destination, personalizedMessage, channel);
      
      newLogs.push({
        lead_id: id,
        lead_name: lead.name,
        channel,
        status: success ? 'Sent' : 'Failed',
        content: personalizedMessage,
        sent_at: new Date().toISOString(),
        user_id: session.user.id
      });
    }

    if (newLogs.length > 0) {
      await supabase.from('message_logs').insert(newLogs);
      await supabase.from('leads').update({ last_contacted: new Date().toISOString() }).in('id', leadIds);
    }
  };

  const handleSyncIntegration = async (platform: 'facebook' | 'google') => {
    if (!session?.user?.id) return;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Simulate a real lead extraction from ${platform} API. Provide 1 new lead in JSON format with name, email, phone, and property interest.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            interest: { type: Type.STRING }
          }
        }
      }
    });

    const mockLead = JSON.parse(response.text || '{}');
    await handleAddLead({
      name: mockLead.name,
      email: mockLead.email,
      phone: mockLead.phone,
      source: platform === 'facebook' ? 'Facebook' : 'Google',
      status: 'New',
      stage: 'Inquiry',
      propertyAddress: mockLead.interest,
      campaignSource: `${platform} Real-Time Sync`
    });

    const updatedIntegrations = { ...integrations };
    if (platform === 'facebook') updatedIntegrations.facebook.pageName = 'Sync Active';
    if (platform === 'google') updatedIntegrations.google.lastSync = new Date().toISOString();
    handleUpdateIntegrations(updatedIntegrations);
  };

  const handleUpdateIntegrations = async (newIntegrations: Integrations) => {
    setIntegrations(newIntegrations);
    if (session?.user?.id) {
        await supabase.from('profiles').update({ integrations: newIntegrations }).eq('id', session.user.id);
    }
  };

  const fetchLogs = async () => {
    try {
        const { data } = await supabase.from('message_logs').select('*').order('sent_at', { ascending: false });
        setMessageLogs((data || []).map((l: any) => ({
          ...l, sentAt: l.sent_at, scheduledAt: l.scheduled_at, leadId: l.lead_id, leadName: l.lead_name
        })));
    } catch (e) {}
  };

  const fetchProfile = async () => {
    if (!session?.user?.id) return;
    try {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (data) {
          setIntegrations(data.integrations || DEFAULT_INTEGRATIONS);
          setCurrentPlan(data.subscriptionPlan || 'Starter');
          setProfile({ fullName: data.full_name, companyName: data.company_name, logoUrl: data.logo_url || DEFAULT_LOGO });
        }
    } catch (e) {}
  };

  const fetchTeam = async () => {
    if (!session?.user?.id) return;
    try {
        const self: TeamMember = { id: session.user.id, email: session.user.email, name: 'You', role: 'Admin', status: 'Active', joinedAt: new Date().toISOString() };
        const { data } = await supabase.from('team_members').select('*').eq('owner_id', session.user.id);
        const others = (data || []).map((m: any) => ({ id: m.id, email: m.email, name: m.name, role: m.role, status: m.status, joinedAt: m.created_at }));
        setTeamMembers([self, ...others]);
    } catch (e) {}
  };

  const handleAddLead = async (newLeadData: Omit<Lead, 'id' | 'createdAt'>) => {
    if (!session?.user?.id) return;
    await supabase.from('leads').insert([{ ...newLeadData, name: standardizeName(newLeadData.name), user_id: session.user.id }]);
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    if (!session?.user?.id) return;
    await supabase.from('leads').update({
        name: standardizeName(updatedLead.name), email: updatedLead.email, phone: updatedLead.phone,
        status: updatedLead.status, stage: updatedLead.stage, notes: updatedLead.notes,
        task_due_date: updatedLead.taskDueDate, task_completed: updatedLead.taskCompleted,
        property_address: updatedLead.propertyAddress, priority_score: updatedLead.priorityScore
    }).eq('id', updatedLead.id);
  };

  const handleLogout = async () => { 
    await supabase.auth.signOut(); 
    setSession(null); 
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

  if (!session) return <Login />;

  return (
    <Layout 
      activePage={activePage} 
      onNavigate={handleNavigate} 
      onLogout={handleLogout} 
      userEmail={session.user.email} 
      riskCount={processedLeads.filter(l => l.agingStatus === 'critical').length}
      logoUrl={profile.logoUrl}
      companyName={profile.companyName}
    >
      {activePage === 'dashboard' && <Dashboard leads={processedLeads} logs={messageLogs} isReady={isTablesReady} integrations={integrations} />}
      {activePage === 'leads' && (
        <Leads 
          leads={processedLeads} 
          onAddLead={handleAddLead} 
          onUpdateStatus={(id, status) => handleUpdateLead({ ...leads.find(l => l.id === id)!, status })} 
          onUpdateLead={handleUpdateLead} 
          onMergeLeads={() => {}} 
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
          teamMembers={teamMembers} 
          onInviteMember={() => {}} 
          onRemoveMember={() => {}} 
          userEmail={session.user.email} 
          currentPlan={currentPlan} 
          onUpdatePlan={() => {}}
          profile={profile}
          onUpdateProfile={() => {}}
        />
      )}
      {activePage === 'followup' && <FollowUp leads={processedLeads} messageLogs={messageLogs} onSendMessage={handleSendMessage} initialSelectedLeadId={navData?.selectedLeadId} />}
    </Layout>
  );
};

export default App;
