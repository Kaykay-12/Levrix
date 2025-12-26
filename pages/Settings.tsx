
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Integrations, TeamMember, Profile } from '../types';
import { 
  Copy, Facebook, Globe, Smartphone, Link as LinkIcon, 
  CheckCircle, Settings2, Code, ShieldCheck, 
  Mail, Image as ImageIcon, MessageCircle, Wifi, Database, 
  Key, Zap, Activity, ShieldAlert, ArrowRight, ExternalLink,
  MessageSquare, Phone, Info, Send, CreditCard, Check, Sparkles, TrendingUp, Loader2, Upload, AlertCircle, X as XIcon, Lock, Globe2, Radio, Terminal, RefreshCw, ToggleLeft, ToggleRight, Users
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabaseClient';

const PAYSTACK_PUBLIC_KEY = 'pk_live_e298950c4992954648ca2f51a7ce540f68012cc1';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

interface SettingsProps {
    integrations: Integrations;
    onUpdate: (integrations: Integrations) => void;
    onTestIntegration: (service: keyof Integrations) => Promise<{connected: boolean, message: string}>;
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
    onTestIntegration,
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
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [testingService, setTestingService] = useState<string | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateIntegrations = (service: keyof Integrations, updates: any) => {
        onUpdate({ ...integrations, [service]: { ...integrations[service], ...updates } });
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleTest = async (service: keyof Integrations) => {
        setTestingService(service);
        await onTestIntegration(service);
        setTestingService(null);
    };

    const handleFileClick = () => fileInputRef.current?.click();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 1024 * 1024) {
            setUploadError("Logo too large (Max 1MB). Please use a smaller image.");
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                await onUpdateProfile({ logoUrl: base64String });
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error: any) {
            setUploadError("Upload failed.");
            setIsUploading(false);
        }
    };

    const handleSubscribe = (planName: string, price: number) => {
        setIsProcessingPayment(planName);

        const handler = window.PaystackPop.setup({
            key: PAYSTACK_PUBLIC_KEY,
            email: userEmail,
            amount: price * 100, // Amount in subunits (GHS pesewas)
            currency: 'GHS',
            callback: (response: any) => {
                onUpdatePlan(planName);
                setIsProcessingPayment(null);
                alert(`Subscription to ${planName} Plan Successful! Reference: ${response.reference}`);
            },
            onClose: () => {
                setIsProcessingPayment(null);
            }
        });

        handler.openIframe();
    };

    const getBaseUrl = () => {
        try { return new URL(supabase.supabaseUrl).hostname; } catch { return 'project.supabase.co'; }
    };
    
    const webhookUrl = `https://${getBaseUrl()}/functions/v1/lead-inbound`;

    const PLANS = [
        { 
            name: 'Starter', 
            price: 199, 
            features: [
                'Lead Pipeline Tracking',
                'Email & SMS Outreach',
                'AI Strategic Assistant',
                'Performance Analytics',
                'Smart Buyer Profiles'
            ], 
            color: 'slate' 
        },
        { 
            name: 'Growth', 
            price: 399, 
            features: [
                'WhatsApp Business Integration',
                'AI Voice Intel Logs',
                'Automated Priority Scoring',
                'Marketing Hub Access',
                'Advanced Campaign Tracking'
            ], 
            color: 'emerald' 
        },
        { 
            name: 'Pro', 
            price: 799, 
            features: [
                'AI Property Render Studio',
                'AI Flyer PDF Generation',
                'Custom White-label Branding',
                'Webhook Router API Access',
                'Priority Success Manager'
            ], 
            color: 'indigo' 
        }
    ];

    const StatusBadge = ({ connected, message, lastTested }: { connected: boolean, message?: string, lastTested?: string }) => (
        <div className="mt-2 space-y-1">
            <div className={cn(
                "flex items-center gap-2 text-[9px] font-black uppercase tracking-widest",
                connected ? "text-emerald-500" : "text-rose-500"
            )}>
                <div className={cn("w-2 h-2 rounded-full", connected ? "bg-emerald-500" : "bg-rose-500 animate-pulse")} />
                {connected ? "Active Connection" : "Connection Failure"}
            </div>
            {message && <p className="text-[10px] text-slate-400 leading-tight font-medium">{message}</p>}
            {lastTested && <p className="text-[8px] text-slate-300 italic">Last checked: {new Date(lastTested).toLocaleTimeString()}</p>}
        </div>
    );

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Workspace Hub</h2>
                    <p className="text-slate-500 mt-1">Unified API and real-time branding center.</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
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
                                <div className="relative group flex flex-col items-center">
                                    <div 
                                        onClick={handleFileClick} 
                                        className={cn(
                                            "w-40 h-40 rounded-[48px] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner cursor-pointer transition-all hover:border-emerald-500 hover:bg-emerald-50/30", 
                                            isUploading && "opacity-50 cursor-wait",
                                            uploadError && "border-rose-400 bg-rose-50/50"
                                        )}
                                    >
                                        {profile.logoUrl && profile.logoUrl !== './logo.png' ? (
                                            <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain p-4 animate-in fade-in duration-500" />
                                        ) : (
                                            <div className="text-center space-y-2">
                                                <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
                                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Logo</p>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[48px]">
                                            <div className="text-white text-center">
                                                <Upload className="w-6 h-6 mx-auto mb-1" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">Instant Upload</p>
                                            </div>
                                        </div>
                                        {isUploading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                                                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                                    {uploadError && (
                                        <div className="mt-4 max-w-[200px] text-center">
                                            <p className="text-[10px] text-rose-500 font-bold leading-tight flex items-center gap-1 justify-center">
                                                <AlertCircle className="w-3 h-3 shrink-0" /> {uploadError}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 w-full space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <Input label="Workspace Name" value={profile.companyName || ''} onChange={(e) => onUpdateProfile({ companyName: e.target.value })} placeholder="e.g. Levrix Estate" />
                                        <Input label="Primary Agent Name" value={profile.fullName || ''} onChange={(e) => onUpdateProfile({ fullName: e.target.value })} placeholder="e.g. Jane Doe" />
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold border border-emerald-100">
                                            <Sparkles className="w-3.5 h-3.5" /> Direct Cloud Sync
                                        </div>
                                        <Button variant="outline" className="rounded-xl h-10 text-xs" onClick={() => onUpdateProfile({ logoUrl: './logo.png' })} disabled={profile.logoUrl === './logo.png'}>
                                            Reset to Default
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'integrations' && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-2 pb-12">
                    <Card className="rounded-[40px] border-slate-100 shadow-xl overflow-hidden flex flex-col">
                       <div className="p-6 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="p-2.5 bg-emerald-500 rounded-xl text-white shadow-lg"><Mail className="w-5 h-5" /></div>
                             <div>
                                <h3 className="font-bold text-slate-900 text-sm">Email Outreach</h3>
                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/60">SMTP / SendGrid</p>
                             </div>
                          </div>
                          <button onClick={() => updateIntegrations('email', { enabled: !integrations.email.enabled })}>
                            {integrations.email.enabled ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                          </button>
                       </div>
                       <CardContent className="p-6 space-y-4 flex-1">
                            <Input label="From Email" value={integrations.email.fromEmail} onChange={e => updateIntegrations('email', { fromEmail: e.target.value })} placeholder="alerts@yourdomain.com" />
                            <Input label="API Key" type="password" value={integrations.email.apiKey} onChange={e => updateIntegrations('email', { apiKey: e.target.value })} placeholder="SG.xxxx" />
                            <StatusBadge connected={integrations.email.connected} message={integrations.email.statusMessage} lastTested={integrations.email.lastTested} />
                            <Button variant="outline" className="w-full text-xs h-10 rounded-xl" onClick={() => handleTest('email')} isLoading={testingService === 'email'}>Verify Connection</Button>
                       </CardContent>
                    </Card>

                    <Card className="rounded-[40px] border-slate-100 shadow-xl overflow-hidden flex flex-col">
                       <div className="p-6 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg"><Facebook className="w-5 h-5" /></div>
                             <div>
                                <h3 className="font-bold text-slate-900 text-sm">Meta Lead Ads</h3>
                                <p className="text-[9px] font-black uppercase tracking-widest text-blue-600/60">FB Sync</p>
                             </div>
                          </div>
                          <button onClick={() => updateIntegrations('facebook', { enabled: !integrations.facebook.enabled })}>
                            {integrations.facebook.enabled ? <ToggleRight className="w-8 h-8 text-blue-600" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                          </button>
                       </div>
                       <CardContent className="p-6 space-y-4 flex-1">
                            <Input label="Page ID" value={integrations.facebook.pageId} onChange={e => updateIntegrations('facebook', { pageId: e.target.value })} />
                            <Input label="Access Token" type="password" value={integrations.facebook.accessToken} onChange={e => updateIntegrations('facebook', { accessToken: e.target.value })} />
                            <StatusBadge connected={integrations.facebook.connected} message={integrations.facebook.statusMessage} lastTested={integrations.facebook.lastTested} />
                            <Button variant="outline" className="w-full text-xs h-10 rounded-xl" onClick={() => handleTest('facebook')} isLoading={testingService === 'facebook'}>Fetch Pages</Button>
                       </CardContent>
                    </Card>

                    <Card className="rounded-[40px] border-slate-100 shadow-xl overflow-hidden flex flex-col">
                       <div className="p-6 bg-teal-50/50 border-b border-teal-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="p-2.5 bg-teal-500 rounded-xl text-white shadow-lg"><MessageCircle className="w-5 h-5" /></div>
                             <div>
                                <h3 className="font-bold text-slate-900 text-sm">WhatsApp Cloud</h3>
                                <p className="text-[9px] font-black uppercase tracking-widest text-teal-600/60">Business API</p>
                             </div>
                          </div>
                          <button onClick={() => updateIntegrations('whatsapp', { enabled: !integrations.whatsapp.enabled })}>
                            {integrations.whatsapp.enabled ? <ToggleRight className="w-8 h-8 text-teal-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                          </button>
                       </div>
                       <CardContent className="p-6 space-y-4 flex-1">
                            <Input label="Business Account ID" value={integrations.whatsapp.businessId} onChange={e => updateIntegrations('whatsapp', { businessId: e.target.value })} />
                            <Input label="Phone Number ID" value={integrations.whatsapp.phoneNumberId} onChange={e => updateIntegrations('whatsapp', { phoneNumberId: e.target.value })} />
                            <StatusBadge connected={integrations.whatsapp.connected} message={integrations.whatsapp.statusMessage} lastTested={integrations.whatsapp.lastTested} />
                            <Button variant="outline" className="w-full text-xs h-10 rounded-xl" onClick={() => handleTest('whatsapp')} isLoading={testingService === 'whatsapp'}>Verify Webhook</Button>
                       </CardContent>
                    </Card>

                    <Card className="rounded-[40px] border-slate-100 shadow-xl overflow-hidden flex flex-col">
                       <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-lg"><Smartphone className="w-5 h-5" /></div>
                             <div>
                                <h3 className="font-bold text-slate-900 text-sm">Twilio SMS</h3>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Outbound Alerts</p>
                             </div>
                          </div>
                          <button onClick={() => updateIntegrations('sms', { enabled: !integrations.sms.enabled })}>
                            {integrations.sms.enabled ? <ToggleRight className="w-8 h-8 text-slate-900" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                          </button>
                       </div>
                       <CardContent className="p-6 space-y-4 flex-1">
                            <Input label="Account SID" value={integrations.sms.accountSid} onChange={e => updateIntegrations('sms', { accountSid: e.target.value })} />
                            <Input label="Auth Token" type="password" value={integrations.sms.authToken} onChange={e => updateIntegrations('sms', { authToken: e.target.value })} />
                            <StatusBadge connected={integrations.sms.connected} message={integrations.sms.statusMessage} lastTested={integrations.sms.lastTested} />
                            <Button variant="outline" className="w-full text-xs h-10 rounded-xl" onClick={() => handleTest('sms')} isLoading={testingService === 'sms'}>Validate Credentials</Button>
                       </CardContent>
                    </Card>

                    <Card className="rounded-[40px] border-slate-100 shadow-xl overflow-hidden flex flex-col">
                       <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm"><Globe2 className="w-5 h-5 text-slate-400" /></div>
                             <div>
                                <h3 className="font-bold text-slate-900 text-sm">Google Ads API</h3>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Search Sync</p>
                             </div>
                          </div>
                          <button onClick={() => updateIntegrations('google', { enabled: !integrations.google.enabled })}>
                            {integrations.google.enabled ? <ToggleRight className="w-8 h-8 text-slate-900" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                          </button>
                       </div>
                       <CardContent className="p-6 space-y-4 flex-1">
                            <Input label="Customer ID" value={integrations.google.customerId} onChange={e => updateIntegrations('google', { customerId: e.target.value })} />
                            <Input label="Developer Token" type="password" value={integrations.google.developerToken} onChange={e => updateIntegrations('google', { developerToken: e.target.value })} />
                            <StatusBadge connected={integrations.google.connected} message={integrations.google.statusMessage} lastTested={integrations.google.lastTested} />
                            <Button variant="outline" className="w-full text-xs h-10 rounded-xl" onClick={() => handleTest('google')} isLoading={testingService === 'google'}>OAuth Connection</Button>
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
                                 <h3 className="text-3xl font-black">Webhook Router</h3>
                                 <p className="text-teal-200/40 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Real-Time Connectivity</p>
                              </div>
                           </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-teal-200/40 ml-1">Universal Endpoint</label>
                            <div className="p-6 bg-black/40 rounded-[32px] border border-white/10 flex items-center justify-between group">
                                <code className="text-emerald-400 text-xs md:text-sm truncate font-mono">{webhookUrl}</code>
                                <button onClick={() => handleCopy(webhookUrl, 'webhook')} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/40 hover:text-white transition-all">
                                    {copied === 'webhook' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'billing' && (
                <div className="grid gap-8 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="bg-white border-slate-100 overflow-hidden rounded-[40px] shadow-2xl">
                        <div className="p-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-slate-50/50">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-white shadow-xl"><CreditCard className="w-10 h-10" /></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Active Membership</p>
                                    <h3 className="text-3xl font-black text-slate-900">{currentPlan}</h3>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5" /> Per User Billing
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold">Billing for {teamMembers.length} active seat(s)</p>
                            </div>
                        </div>
                        <div className="p-12 grid md:grid-cols-3 gap-8 pt-8">
                            {PLANS.map((plan) => (
                                <div key={plan.name} className={cn(
                                    "p-10 rounded-[40px] border-2 transition-all flex flex-col relative group", 
                                    currentPlan === plan.name ? "border-emerald-500 bg-emerald-50/20" : "border-slate-50 hover:border-slate-200"
                                )}>
                                    {currentPlan === plan.name && (
                                        <div className="absolute top-6 right-6">
                                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                                        </div>
                                    )}
                                    <h4 className="text-xl font-bold text-slate-900">{plan.name}</h4>
                                    <div className="flex items-baseline mt-4">
                                        <span className="text-4xl font-black text-slate-900">₵{plan.price}</span>
                                        <div className="ml-2">
                                            <p className="text-[9px] font-black uppercase text-slate-400">per user</p>
                                            <p className="text-[9px] font-black uppercase text-slate-400">/ month</p>
                                        </div>
                                    </div>
                                    <div className="mt-8 space-y-3 flex-1">
                                        {plan.features.map((feat, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                                                <span className="text-xs text-slate-500 font-medium">{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <Button 
                                        className={cn(
                                            "w-full h-14 rounded-2xl font-black uppercase tracking-widest mt-10 transition-all", 
                                            currentPlan === plan.name ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" : "bg-slate-900 text-white shadow-xl shadow-slate-900/10"
                                        )} 
                                        onClick={() => handleSubscribe(plan.name, plan.price)}
                                        disabled={currentPlan === plan.name}
                                        isLoading={isProcessingPayment === plan.name}
                                    >
                                        {currentPlan === plan.name ? 'Active Plan' : `Checkout ₵${plan.price}`}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
