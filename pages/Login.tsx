
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabaseClient';
import { 
  Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, 
  Settings2, Database, ShieldCheck, 
  HelpCircle, ChevronDown, ChevronUp, Loader2, Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { createClient } from '@supabase/supabase-js';

export const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  
  const [dbUrl, setDbUrl] = useState(localStorage.getItem('sb_url') || '');
  const [dbKey, setDbKey] = useState(localStorage.getItem('sb_key') || '');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    if (params.get('error')) {
      const errorMsg = params.get('error_description') || 'Authentication failed';
      setError(errorMsg);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const handleTestConnection = async () => {
    if (!dbUrl || !dbKey) return;
    setTestStatus('testing');
    try {
        const client = createClient(dbUrl, dbKey);
        const { error } = await client.from('profiles').select('id').limit(1);
        if (error && error.code !== 'PGRST116') throw error;
        setTestStatus('success');
    } catch (err) {
        setTestStatus('failed');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { emailRedirectTo: window.location.origin }
        });
        if (signUpError) throw signUpError;
        
        if (data.user && data.session) {
           setMessage("Account created! Logging you in...");
        } else {
           setMessage("Check your email inbox (and spam) for a verification link.");
           setShowTroubleshooting(true);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          if (signInError.message.includes('Email not confirmed')) {
            setShowTroubleshooting(true);
          }
          throw signInError;
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (authError) throw authError;
    } catch (err: any) {
      setError(err.message || "Google login failed.");
      setIsGoogleLoading(false);
    }
  };

  const handleSaveConfig = () => {
    localStorage.setItem('sb_url', dbUrl);
    localStorage.setItem('sb_key', dbKey);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#0f2925] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-lg flex flex-col gap-4 relative z-10">
        <Card className="w-full shadow-2xl border-0 relative overflow-hidden backdrop-blur-md bg-white/95 max-w-md mx-auto rounded-[48px]">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
            
            <CardHeader className="text-center pt-12 pb-6">
                <div className="mx-auto mb-6 flex items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-4xl font-black tracking-tighter text-slate-900">
                        levrix<span className="text-emerald-500">.</span>
                    </span>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">
                    {isSignUp ? 'Join the Future' : 'Welcome Back'}
                </CardTitle>
                <p className="text-slate-500 text-xs mt-2 px-6 font-medium">
                    Automated Real Estate Lead Intelligence.
                </p>
            </CardHeader>

            <CardContent className="space-y-6 px-10 pb-12">
                {error && (
                    <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-2xl border border-rose-100 flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-bold mb-1">Authorization Error</p>
                            <p className="opacity-80">{error}</p>
                        </div>
                    </div>
                )}
                
                {message && (
                    <div className="p-4 bg-emerald-50 text-emerald-700 text-xs rounded-2xl border border-emerald-100 flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{message}</span>
                    </div>
                )}
                
                {!message && (
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Work Email</label>
                            <Input 
                                type="email" 
                                placeholder="name@company.com" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 rounded-xl"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                            <Input 
                                type="password" 
                                placeholder="••••••••" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 rounded-xl"
                            />
                        </div>
                        <Button className="w-full h-14 text-sm bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest mt-2" type="submit" isLoading={isLoading}>
                            {isSignUp ? 'Create Account' : 'Sign In'}
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </form>
                )}

                {!message && (
                    <>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-100" />
                            </div>
                            <div className="relative flex justify-center text-[9px] uppercase font-bold tracking-[0.2em] text-slate-300">
                                <span className="bg-white/95 px-3">secure gateway</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button 
                                variant="outline" 
                                className="w-full h-12 bg-white border-slate-200 text-slate-700 rounded-xl font-bold" 
                                type="button" 
                                onClick={handleGoogleLogin}
                                isLoading={isGoogleLoading}
                            >
                                Continue with Google
                            </Button>

                            <button 
                                type="button" 
                                onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); setShowTroubleshooting(false); }}
                                className="w-full py-2 text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors"
                            >
                                {isSignUp ? 'Already have an account? Sign In' : "New to the platform? Create account"}
                            </button>
                        </div>
                    </>
                )}

                <div className="pt-4 mt-2 border-t border-slate-100 text-center">
                    <button 
                        onClick={() => setShowConfig(!showConfig)}
                        className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-slate-500 transition-colors flex items-center justify-center gap-1 mx-auto"
                    >
                        <Settings2 className="w-3 h-3" /> System Configuration
                    </button>
                </div>
            </CardContent>
        </Card>

        {showConfig && (
            <Card className="animate-in slide-in-from-bottom-2 duration-300 border-none bg-slate-800 text-white shadow-2xl max-w-md mx-auto w-full rounded-[32px]">
                <CardHeader className="p-6 pb-0 text-center">
                    <Database className="w-6 h-6 text-emerald-400 mx-auto mb-4" />
                    <CardTitle className="text-sm text-white">Project Connection</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="space-y-3">
                        <Input label="Supabase URL" value={dbUrl} onChange={(e) => setDbUrl(e.target.value)} placeholder="https://..." className="bg-slate-900 border-slate-700 text-white" />
                        <Input label="Anon Key" type="password" value={dbKey} onChange={(e) => setDbKey(e.target.value)} placeholder="eyJ..." className="bg-slate-900 border-slate-700 text-white" />
                        <Button onClick={handleTestConnection} className="w-full h-9 text-[10px] uppercase bg-slate-700" isLoading={testStatus === 'testing'}>
                            {testStatus === 'success' ? 'Connected' : testStatus === 'failed' ? 'Failed' : 'Test Connection'}
                        </Button>
                    </div>
                    <Button className="w-full h-11 bg-emerald-500 text-white font-bold rounded-xl" onClick={handleSaveConfig}>Apply & Restart</Button>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
};
