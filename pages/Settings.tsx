
import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Integrations, TeamMember, Profile } from '../types';
/* Added missing Radio import */
import { 
  Copy, Facebook, Globe, Smartphone, Link as LinkIcon, 
  CheckCircle, Settings2, Code, ShieldCheck, 
  Mail, Image as ImageIcon, MessageCircle, Wifi, Database, 
  Key, Zap, Activity, ShieldAlert, ArrowRight, ExternalLink,
  MessageSquare, Phone, Info, Send, CreditCard, Check, Sparkles, TrendingUp, Loader2, Upload, AlertCircle, X as XIcon, Lock, Globe2, Radio
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabaseClient';

interface SettingsProps {
    integrations: Integrations;
    onUpdate: (integrations: Integrations) => void;
    teamMembers: TeamMember[];
    onInviteMember: (email: string, role: 'Admin' | 'Agent' | 'Viewer') => void;
    onRemoveMember: (id: string) => void;
    userEmail: string;
    currentPlan: string;
    onUpdatePlan: (plan: string) => void;
    profile: Partial<Profile>;
    onUpdateProfile: (updates: Partial<Profile>) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
    integrations, 
    onUpdate, 
    teamMembers, 
    onInviteMember, 
    onRemoveMember, 
    userEmail,
    currentPlan,
    onUpdatePlan,
    profile,
    onUpdateProfile
}) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'integrations' | 'webhooks' | 'billing'>('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [paystackPublicKey, setPaystackPublicKey] = useState(localStorage.getItem('paystack_pk') || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateIntegrations = (service: keyof Integrations, updates: any) => {
        onUpdate({ ...integrations, [service]: { ...integrations[service], ...updates } });
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleFileClick = () => fileInputRef.current?.click();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        setUploadError(null);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `logos/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('logos').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(filePath);
            onUpdateProfile({ logoUrl: publicUrl });
        } catch (error: any) {
            setUploadError(error.message || "Upload failed.");
        } finally {
            setIsUploading(false);
        }
    };

    const handlePaystackPayment = (plan: string, amount: number) => {
        if (!paystackPublicKey) {
            alert("Please provide a Paystack Public Key in the Billing settings first.");
            return;
        }
        // @ts-ignore
        if (window.PaystackPop) {
            // @ts-ignore
            const handler = window.PaystackPop.setup({
                key: paystackPublicKey,
                email: userEmail,
                amount: amount * 100, // Paystack expects amount in minor units (pesewas/cents)
                currency: 'GHS',
                metadata: { custom_fields: [{ display_name: "Plan", variable_name: "plan", value: plan }] },
                callback: function(response: any) {
                    onUpdatePlan(plan);
                    alert(`Subscription successfully upgraded to ${plan}!`);
                },
                onClose: function() { console.log('Window closed.'); }
            });
            handler.openIframe();
        } else {
            alert("Paystack library not loaded. Ensure index.html includes the script.");
        }
    };

    const savePaystackKey = () => {
        localStorage.setItem('paystack_pk', paystackPublicKey);
        alert("Paystack Live Details Saved Locally.");
    };

    const getBaseUrl = () => {
        try { return new URL(supabase.supabaseUrl).hostname; } catch { return 'project.supabase.co'; }
    };
    
    const webhookUrl = `https://${getBaseUrl()}/functions/v1/lead-inbound`;
    const verifyToken = "levrix_v1_" + userEmail.split('@')[0];

    const PLANS = [
        {
            name: 'Starter',
            price: 0,
            features: ['Up to 500 Leads', 'SMS & Email Basics', '1 Team Member', 'Standard Analytics'],
            color: 'bg-slate-100',
            textColor: 'text-slate-600',
            trial: 'Includes 14 days free'
        },
        {
            name: 'Growth',
            price: 500,
            features: ['Unlimited Leads', 'WhatsApp Cloud API', 'Real-time Webhooks', 'Gemini AI Studio', '5 Team Members'],
            popular: true,
            color: 'bg-emerald-500',
            textColor: 'text-white',
            trial: 'Includes 14 days free'
        },
        {
            name: 'Enterprise',
            price: 1500,
            features: ['White-label Branding', 'Custom Lead Routing', 'Dedicated Account Manager', 'Advanced API Access', 'Unlimited Team'],
            color: 'bg-slate-900',
            textColor: 'text-white',
            trial: 'Custom Onboarding'
        }
    ];

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Workspace Hub</h2>
                    <p className="text-slate-500 mt-1">Unified API and real-time connectivity hub.</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
                    {['profile', 'integrations', 'webhooks', 'billing'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                                activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'profile' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-[40px]">
                        <CardHeader><CardTitle>Branding & Profile</CardTitle></CardHeader>
                        <CardContent className="space-y-8">
                            <div className="flex flex-col md:flex-row items-center gap-10">
                                <div className="relative group">
                                    <div onClick={handleFileClick} className={cn("w-40 h-40 rounded-[48px] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner cursor-pointer transition-all hover:border-emerald-500 hover:bg-emerald-50/30", isUploading && "opacity-50 cursor-wait")}>
                                        {profile.logoUrl ? <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain p-4" /> : <div className="text-center space-y-2"><ImageIcon className="w-10 h-10 text-slate-300 mx-auto" /><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Logo</p></div>}
                                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[48px]"><div className="text-white text-center"><Upload className="w-6 h-6 mx-auto mb-1" /><p className="text-[10px] font-black uppercase tracking-widest">Update Logo</p></div></div>
                                        {isUploading && <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>}
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                </div>
                                <div className="flex-1 w-full space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <Input label="Workspace Name" value={profile.companyName || ''} onChange={(e) => onUpdateProfile({ companyName: e.target.value })} placeholder="e.g. Levrix Real Estate" />
                                        <Input label="Primary Agent Name" value={profile.fullName || ''} onChange={(e) => onUpdateProfile({ fullName: e.target.value })} placeholder="e.g. John Smith" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'integrations' && (
                <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Meta Suite */}
                        <Card className="rounded-[40px] border-slate-100 shadow-xl overflow-hidden">
                           <div className="p-8 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="p-3 bg-blue-500 rounded-2xl text-white shadow-lg"><Facebook className="w-6 h-6" /></div>
                                 <div>
                                    <h3 className="font-bold text-slate-900">Meta Integration Suite</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600/60">Facebook & WhatsApp</p>
                                 </div>
                              </div>
                              <div className={cn("px-3 py-1 rounded-full text-[9px] font-black border uppercase", integrations.facebook.connected ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200")}>
                                 {integrations.facebook.connected ? 'ACTIVE' : 'READY'}
                              </div>
                           </div>
                           <CardContent className="p-8 space-y-6">
                              <p className="text-sm text-slate-500 leading-relaxed font-medium">Connect your Facebook Pages and WhatsApp Business API for automated lead capture and instant message triggers.</p>
                              <div className="space-y-4">
                                 <Input label="Meta Page ID" value={integrations.facebook.pageId} onChange={e => updateIntegrations('facebook', { pageId: e.target.value })} placeholder="1098234710..." />
                                 <Button className="w-full bg-blue-600 text-white rounded-2xl h-12 shadow-lg shadow-blue-600/20">
                                    <LinkIcon className="w-4 h-4 mr-2" /> Connect Meta Cloud
                                 </Button>
                              </div>
                           </CardContent>
                        </Card>

                        {/* Google Cloud */}
                        <Card className="rounded-[40px] border-slate-100 shadow-xl overflow-hidden">
                           <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm"><Globe2 className="w-6 h-6 text-slate-400" /></div>
                                 <div>
                                    <h3 className="font-bold text-slate-900">Google Ads API</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Search & Display Leads</p>
                                 </div>
                              </div>
                              <div className={cn("px-3 py-1 rounded-full text-[9px] font-black border uppercase", integrations.google.connected ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200")}>
                                 {integrations.google.connected ? 'ACTIVE' : 'READY'}
                              </div>
                           </div>
                           <CardContent className="p-8 space-y-6">
                              <p className="text-sm text-slate-500 leading-relaxed font-medium">Enable real-time synchronization with Google Lead Form Extensions and search conversion tracking.</p>
                              <div className="space-y-4">
                                 <Input label="Customer ID" value={integrations.google.customerId} onChange={e => updateIntegrations('google', { customerId: e.target.value })} placeholder="000-000-0000" />
                                 <Button variant="outline" className="w-full border-slate-200 text-slate-700 rounded-2xl h-12">
                                    <ArrowRight className="w-4 h-4 mr-2" /> Authorize G-Cloud
                                 </Button>
                              </div>
                           </CardContent>
                        </Card>
                    </div>

                    {/* Telecom Hub */}
                    <Card className="rounded-[40px] border-slate-100 shadow-xl overflow-hidden">
                       <div className="p-10 border-b border-slate-100 bg-indigo-50/30 flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="flex items-center gap-6">
                             <div className="p-4 bg-indigo-500 rounded-[28px] text-white shadow-xl shadow-indigo-500/20"><Smartphone className="w-8 h-8" /></div>
                             <div>
                                <h3 className="text-xl font-bold text-slate-900">Telecom & SMS Hub</h3>
                                <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mt-1">Twilio Integration Engine</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="flex items-center gap-1.5 px-4 py-2 bg-white border border-indigo-100 rounded-2xl text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-sm">
                                <Radio className="w-3 h-3 animate-pulse" /> Live Status
                             </div>
                             <button onClick={() => updateIntegrations('sms', { enabled: !integrations.sms.enabled })} className={cn("w-14 h-8 rounded-full relative transition-all", integrations.sms.enabled ? "bg-indigo-500" : "bg-slate-200")}><div className={cn("w-6 h-6 bg-white rounded-full absolute top-1 shadow-md transition-all", integrations.sms.enabled ? "left-7" : "left-1")} /></button>
                          </div>
                       </div>
                       <CardContent className="p-10">
                          <div className="grid md:grid-cols-2 gap-10">
                             <div className="space-y-6">
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">Power your automated follow-ups via Twilio. Enter your Account SID and Auth Token to enable real-time SMS triggers.</p>
                                <div className="space-y-4">
                                   <Input label="Account SID" value={integrations.sms.accountSid} onChange={e => updateIntegrations('sms', { accountSid: e.target.value })} type="password" />
                                   <Input label="Auth Token" value={integrations.sms.authToken} onChange={e => updateIntegrations('sms', { authToken: e.target.value })} type="password" />
                                </div>
                             </div>
                             <div className="bg-slate-50 rounded-[32px] p-8 space-y-4 border border-slate-100">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Twilio Config</h4>
                                <Input label="Sender Number / ID" value={integrations.sms.senderId} onChange={e => updateIntegrations('sms', { senderId: e.target.value })} placeholder="+1234567890" />
                                <div className="flex items-center gap-3 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                                   <Info className="w-4 h-4 text-indigo-500" />
                                   <p className="text-[10px] font-bold text-indigo-700">Ensure your Twilio number is SMS-enabled for inbound real-time parsing.</p>
                                </div>
                             </div>
                          </div>
                       </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'webhooks' && (
                <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="bg-[#0f2925] text-white border-none shadow-2xl overflow-hidden rounded-[40px] p-12 space-y-10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                           <div className="flex items-center gap-6">
                              <div className="p-4 bg-emerald-500/20 rounded-[28px] border border-emerald-500/20 shadow-xl"><Code className="w-8 h-8 text-emerald-400" /></div>
                              <div>
                                 <h3 className="text-3xl font-black">Webhook Architecture</h3>
                                 <p className="text-teal-200/40 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Real-Time Payload Router</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Socket Protocol Active</span>
                           </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-teal-200/40 ml-1">Universal Endpoint URL</label>
                                <div className="p-6 bg-black/40 rounded-[32px] border border-white/10 flex items-center justify-between group">
                                    <code className="text-emerald-400 text-xs md:text-sm truncate font-mono">{webhookUrl}</code>
                                    <button onClick={() => handleCopy(webhookUrl, 'webhook')} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/40 hover:text-white transition-all">
                                       {copied === 'webhook' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-[9px] text-teal-200/20 font-medium px-4">Use this URL in Facebook Developer Portal, Google Ads Webhook Setup, or Twilio Callback URLs.</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                               <div className="p-8 bg-white/5 rounded-[32px] border border-white/5 space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-teal-200/40">Verification Token</label>
                                  <div className="flex items-center justify-between">
                                     <code className="text-teal-50 font-mono text-sm">{verifyToken}</code>
                                     <button onClick={() => handleCopy(verifyToken, 'token')} className="text-teal-200/40 hover:text-white transition-colors"><Copy className="w-4 h-4" /></button>
                                  </div>
                                  <div className="pt-4 flex items-center gap-3 text-teal-200/30">
                                     <ShieldCheck className="w-4 h-4" />
                                     <p className="text-[9px] font-bold uppercase tracking-widest">HMAC-SHA256 Ready</p>
                                  </div>
                               </div>
                               <div className="p-8 bg-emerald-500/5 rounded-[32px] border border-emerald-500/10 space-y-4">
                                  <h4 className="text-xs font-bold text-emerald-400">Meta/Facebook Guide</h4>
                                  <p className="text-[10px] text-teal-100/60 leading-relaxed font-medium">1. Go to App Dashboard > Webhooks.<br/>2. Select 'Page' object.<br/>3. Subscribe to 'leadgen' fields.<br/>4. Paste URL and Token above.</p>
                                  <Button variant="ghost" className="h-8 px-0 text-emerald-400 hover:text-emerald-300 text-[10px] font-black uppercase tracking-widest border-none">
                                     View Documentation <ExternalLink className="w-3 h-3 ml-2" />
                                  </Button>
                               </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'billing' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="bg-white border-slate-100 overflow-hidden rounded-[40px] shadow-2xl">
                        <div className="p-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-slate-50/50">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-white shadow-xl"><CreditCard className="w-10 h-10" /></div>
                                <div><p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Current Plan</p><h3 className="text-3xl font-black text-slate-900">{currentPlan}</h3><p className="text-xs font-bold text-emerald-600">₵500.00 / Month (GHS)</p></div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase border border-emerald-100 shadow-sm"><Sparkles className="w-3 h-3" /> 2 Weeks Free Trial Active</div>
                            </div>
                        </div>

                        <div className="p-12 border-t border-slate-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 border border-blue-100 shadow-sm"><Lock className="w-6 h-6" /></div>
                                <div><h4 className="text-lg font-bold text-slate-900">Paystack Live Integration</h4><p className="text-xs text-slate-500">Provide your Paystack Public Key for GHS processing.</p></div>
                            </div>
                            <div className="grid md:grid-cols-4 gap-4 items-end">
                                <div className="md:col-span-3"><Input label="Paystack Public Key (pk_live_...)" value={paystackPublicKey} onChange={e => setPaystackPublicKey(e.target.value)} type="password" placeholder="pk_live_xxxxxxxxxxxxxxxxxxxxxxxx" /></div>
                                <Button onClick={savePaystackKey} className="h-11 bg-slate-900 rounded-xl">Save Keys</Button>
                            </div>
                        </div>

                        <div className="p-12 grid md:grid-cols-3 gap-8 pt-0">
                            {PLANS.map((plan) => (
                                <div key={plan.name} className={cn("p-10 rounded-[40px] border-2 transition-all flex flex-col relative", currentPlan === plan.name ? "border-emerald-500 bg-emerald-50/20" : "border-slate-50 hover:border-slate-200")}>
                                    <h4 className="text-xl font-bold text-slate-900">{plan.name}</h4>
                                    <div className="flex items-baseline mt-4"><span className="text-4xl font-black text-slate-900">₵{plan.price}</span><span className="text-slate-400 text-sm font-medium ml-1">/mo</span></div>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-2">{plan.trial}</p>
                                    <div className="space-y-4 flex-1 my-8">
                                        {plan.features.map((f, i) => (<div key={i} className="flex items-start gap-3"><div className="mt-1 w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0"><Check className="w-2.5 h-2.5 text-emerald-600" /></div><p className="text-sm text-slate-600 font-medium">{f}</p></div>))}
                                    </div>
                                    <Button onClick={() => handlePaystackPayment(plan.name, plan.price)} className={cn("w-full h-14 rounded-2xl font-black uppercase tracking-widest transition-all", currentPlan === plan.name ? "bg-emerald-500 text-white" : "bg-slate-900 text-white")} disabled={currentPlan === plan.name}>{currentPlan === plan.name ? 'Active' : `Subscribe (₵${plan.price})`}</Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
