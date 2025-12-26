
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Integrations, TeamMember, Profile } from '../types';
import { 
  Copy, Facebook, Globe, Smartphone, Link as LinkIcon, 
  CheckCircle, Settings2, Code, ShieldCheck, 
  Mail, Image as ImageIcon, MessageCircle, Wifi, Database, 
  Key, Zap, Activity, ShieldAlert, ArrowRight, ExternalLink,
  MessageSquare, Phone, Info, Send, CreditCard, Check, Sparkles, TrendingUp
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
    const [copied, setCopied] = useState<string | null>(null);

    const updateIntegrations = (service: keyof Integrations, updates: any) => {
        onUpdate({ ...integrations, [service]: { ...integrations[service], ...updates } });
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const handlePaystackPayment = (plan: string, amount: number) => {
        // @ts-ignore - Paystack is loaded in index.html
        if (window.PaystackPop) {
            // @ts-ignore
            const handler = window.PaystackPop.setup({
                key: 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Placeholder for actual key
                email: userEmail,
                amount: amount * 100, // Amount in kobo/cents
                currency: 'USD',
                metadata: {
                    custom_fields: [
                        { display_name: "Plan", variable_name: "plan", value: plan }
                    ]
                },
                callback: function(response: any) {
                    onUpdatePlan(plan);
                    alert(`Subscription successfully upgraded to ${plan}!`);
                },
                onClose: function() {
                    console.log('Window closed.');
                }
            });
            handler.openIframe();
        } else {
            // Fallback for simulation
            setIsSaving(true);
            setTimeout(() => {
                onUpdatePlan(plan);
                setIsSaving(false);
                alert(`Mock Upgrade to ${plan} successful.`);
            }, 1000);
        }
    };

    const webhookUrl = `https://${new URL(supabase.supabaseUrl).hostname}/functions/v1/lead-inbound`;
    const verifyToken = "levrix_secure_" + userEmail.split('@')[0];

    const PLANS = [
        {
            name: 'Starter',
            price: 0,
            features: ['Up to 500 Leads', 'SMS & Email Basics', '1 Team Member', 'Standard Analytics'],
            color: 'bg-slate-100',
            textColor: 'text-slate-600'
        },
        {
            name: 'Growth',
            price: 49,
            features: ['Unlimited Leads', 'WhatsApp Cloud API', 'Real-time Webhooks', 'Gemini AI Studio', '5 Team Members'],
            popular: true,
            color: 'bg-emerald-500',
            textColor: 'text-white'
        },
        {
            name: 'Enterprise',
            price: 199,
            features: ['White-label Branding', 'Custom Lead Routing', 'Dedicated Account Manager', 'Advanced API Access', 'Unlimited Team'],
            color: 'bg-slate-900',
            textColor: 'text-white'
        }
    ];

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Workspace Hub</h2>
                    <p className="text-slate-500 mt-1">Full API and integration management.</p>
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
                <Card>
                    <CardHeader><CardTitle>Branding & Profile</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-8">
                            <div className="w-32 h-32 rounded-[32px] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                                {profile.logoUrl ? <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain p-4" /> : <ImageIcon className="w-10 h-10 text-slate-300" />}
                            </div>
                            <div className="flex-1 grid md:grid-cols-2 gap-4">
                                <Input label="Workspace Name" value={profile.companyName} onChange={(e) => onUpdateProfile({ companyName: e.target.value })} />
                                <Input label="Lead Agent Name" value={profile.fullName} onChange={(e) => onUpdateProfile({ fullName: e.target.value })} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'integrations' && (
                <div className="grid gap-8">
                    {/* Twilio SMS Engine */}
                    <Card className={cn("border-2 transition-all overflow-hidden", integrations.sms.enabled ? "border-indigo-500/20" : "border-slate-100")}>
                        <div className="h-1 w-full bg-indigo-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm"><Smartphone className="w-6 h-6" /></div>
                                <div>
                                    <CardTitle>Twilio SMS Engine</CardTitle>
                                    <p className="text-xs text-slate-500 font-medium">Official SMS & critical alert gateway.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => updateIntegrations('sms', { enabled: !integrations.sms.enabled })}
                                className={cn("w-14 h-7 rounded-full relative transition-all", integrations.sms.enabled ? "bg-indigo-500" : "bg-slate-200")}
                            >
                                <div className={cn("w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all", integrations.sms.enabled ? "left-8" : "left-1")} />
                            </button>
                        </CardHeader>
                        <CardContent className="space-y-6 border-t border-slate-50 pt-8">
                            <div className="grid md:grid-cols-3 gap-6">
                                <Input label="Account SID" value={integrations.sms.accountSid} onChange={e => updateIntegrations('sms', { accountSid: e.target.value })} placeholder="AC..." />
                                <Input label="Auth Token" type="password" value={integrations.sms.authToken} onChange={e => updateIntegrations('sms', { authToken: e.target.value })} />
                                <Input label="Sender ID / Number" value={integrations.sms.senderId} onChange={e => updateIntegrations('sms', { senderId: e.target.value })} placeholder="+1..." />
                            </div>
                        </CardContent>
                    </Card>

                    {/* WhatsApp Cloud API */}
                    <Card className={cn("border-2 transition-all overflow-hidden", integrations.whatsapp.enabled ? "border-emerald-500/20" : "border-slate-100")}>
                        <div className="h-1 w-full bg-emerald-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-sm"><MessageCircle className="w-6 h-6" /></div>
                                <div>
                                    <CardTitle>WhatsApp Business (Cloud API)</CardTitle>
                                    <p className="text-xs text-slate-500 font-medium">Native engagement via Meta Graph API v17.0.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => updateIntegrations('whatsapp', { enabled: !integrations.whatsapp.enabled })}
                                className={cn("w-14 h-7 rounded-full relative transition-all", integrations.whatsapp.enabled ? "bg-emerald-500" : "bg-slate-200")}
                            >
                                <div className={cn("w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all", integrations.whatsapp.enabled ? "left-8" : "left-1")} />
                            </button>
                        </CardHeader>
                        <CardContent className="space-y-6 border-t border-slate-50 pt-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <Input label="Phone Number ID" value={integrations.whatsapp.phoneNumberId} onChange={e => updateIntegrations('whatsapp', { phoneNumberId: e.target.value })} />
                                <Input label="System User Token" type="password" value={integrations.whatsapp.accessToken} onChange={e => updateIntegrations('whatsapp', { accessToken: e.target.value })} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-8">
                        <Card className={cn("border-2 transition-all", integrations.facebook.connected ? "border-blue-500/20" : "border-slate-100")}>
                            <CardHeader className="pb-4"><CardTitle className="text-base flex items-center gap-2"><Facebook className="w-5 h-5 text-blue-500" /> Meta Leads</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <Input label="Page ID" value={integrations.facebook.pageId} onChange={e => updateIntegrations('facebook', { pageId: e.target.value })} />
                                <Button className="w-full bg-blue-600 h-10 rounded-xl text-white" onClick={() => updateIntegrations('facebook', { connected: true })}>Authorize Form Sync</Button>
                            </CardContent>
                        </Card>
                        <Card className={cn("border-2 transition-all", integrations.google.connected ? "border-amber-500/20" : "border-slate-100")}>
                            <CardHeader className="pb-4"><CardTitle className="text-base flex items-center gap-2"><Globe className="w-5 h-5 text-slate-600" /> Google Ads</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <Input label="Customer ID" value={integrations.google.customerId} onChange={e => updateIntegrations('google', { customerId: e.target.value })} />
                                <Button className="w-full bg-slate-900 h-10 rounded-xl text-white" onClick={() => updateIntegrations('google', { connected: true })}>Verify G-Ads Connection</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'webhooks' && (
                <div className="grid gap-6">
                    <Card className="bg-[#0f2925] text-white border-none shadow-2xl relative overflow-hidden rounded-[40px]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                        <CardContent className="p-12 relative z-10 space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-emerald-500/20 rounded-[28px] border border-emerald-500/20 shadow-xl">
                                    <Code className="w-8 h-8 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">Inbound Data Webhook</h3>
                                    <p className="text-teal-100/40 text-xs font-black uppercase tracking-[0.2em]">Universal Integration Gateway</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-teal-200/40 ml-1">Payload Endpoint</label>
                                    <div className="p-5 bg-black/30 rounded-3xl border border-white/10 flex items-center justify-between group">
                                        <code className="text-emerald-400 text-xs truncate mr-4">{webhookUrl}</code>
                                        <button onClick={() => handleCopy(webhookUrl, 'webhook')} className="shrink-0 text-white/40 hover:text-white transition-colors">
                                            {copied === 'webhook' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-teal-200/40 ml-1">Verification Token</label>
                                    <div className="p-5 bg-black/30 rounded-3xl border border-white/10 flex items-center justify-between group">
                                        <code className="text-teal-200 text-xs truncate mr-4">{verifyToken}</code>
                                        <button onClick={() => handleCopy(verifyToken, 'token')} className="shrink-0 text-white/40 hover:text-white transition-colors">
                                            {copied === 'token' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'billing' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <Card className="bg-white border-slate-100 overflow-hidden rounded-[40px] shadow-2xl">
                        <div className="p-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-slate-50/50">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-white shadow-xl">
                                    <CreditCard className="w-10 h-10" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Current Subscription</p>
                                    <h3 className="text-3xl font-black text-slate-900">{currentPlan} Plan</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-xs font-bold text-emerald-600">Active & Billing Monthly</p>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" className="h-14 px-10 rounded-2xl border-slate-200 font-bold hover:bg-white shadow-sm">
                                View Invoices
                            </Button>
                        </div>

                        <div className="p-12 grid md:grid-cols-3 gap-8">
                            {PLANS.map((plan) => (
                                <div key={plan.name} className={cn(
                                    "p-10 rounded-[40px] border-2 transition-all flex flex-col relative",
                                    currentPlan === plan.name ? "border-emerald-500 bg-emerald-50/20" : "border-slate-50 hover:border-slate-200"
                                )}>
                                    {plan.popular && (
                                        <div className="absolute top-0 right-10 -translate-y-1/2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                                            Recommended
                                        </div>
                                    )}
                                    <div className="mb-8">
                                        <h4 className="text-xl font-bold text-slate-900">{plan.name}</h4>
                                        <div className="flex items-baseline mt-4">
                                            <span className="text-4xl font-black text-slate-900">${plan.price}</span>
                                            <span className="text-slate-400 text-sm font-medium ml-1">/mo</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4 flex-1 mb-10">
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="mt-1 w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                                                </div>
                                                <p className="text-sm text-slate-600 font-medium">{feature}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <Button 
                                        onClick={() => handlePaystackPayment(plan.name, plan.price)}
                                        className={cn(
                                            "w-full h-14 rounded-2xl font-black uppercase tracking-widest transition-all",
                                            currentPlan === plan.name ? "bg-emerald-500 text-white" : "bg-slate-900 text-white"
                                        )}
                                        disabled={currentPlan === plan.name}
                                    >
                                        {currentPlan === plan.name ? 'Current Plan' : `Upgrade to ${plan.name}`}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="bg-[#0f2925] border-none text-white rounded-[40px] shadow-2xl overflow-hidden relative">
                         <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                         <div className="p-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="max-w-md space-y-6 text-center md:text-left">
                                <div className="w-16 h-16 rounded-[24px] bg-emerald-500/20 flex items-center justify-center mx-auto md:mx-0">
                                    <TrendingUp className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h3 className="text-3xl font-black">Scale your property volume.</h3>
                                <p className="text-teal-100/60 leading-relaxed font-medium">
                                    Levrix Growth plans unlock native WhatsApp connectivity and Gemini AI Studio for instant property flyer generation.
                                </p>
                            </div>
                            <div className="p-10 bg-white/5 rounded-[40px] border border-white/10 w-full md:w-80 space-y-4">
                                <div className="flex justify-between items-center text-xs font-bold text-teal-200/40 uppercase tracking-widest">
                                    <span>Workspace Usage</span>
                                    <span>{Math.round((profile?.integrations?.facebook?.connected ? 85 : 12))}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                                </div>
                                <p className="text-[10px] text-teal-100/40 text-center font-medium">Auto-renewing on the 1st of each month.</p>
                            </div>
                         </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
