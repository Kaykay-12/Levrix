
import React, { useState, useEffect, useRef } from 'react';
import { Lead, LeadStatus, FollowUpStage } from '../types';
import { X, Mail, Phone, MessageSquare, Calendar, Globe, Clock, Sparkles, Briefcase, Pencil, Save, RotateCcw, Check, AlignLeft, Mic, Loader2, Target, TrendingUp, RefreshCw, Square, CheckCircle2, Circle, ExternalLink, MapPin, CalendarClock, ListTodo, ShieldAlert, Activity } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { cn, formatDate } from '../lib/utils';
import { GoogleGenAI, Type } from "@google/genai";

interface LeadDetailsProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (lead: Lead) => void;
  onNavigateToFollowUp: (leadId: string) => void;
}

const STAGES: FollowUpStage[] = ['Inquiry', 'First Contact', 'Property Viewing', 'Offer Made', 'Contract', 'Closed'];

export const LeadDetails: React.FC<LeadDetailsProps> = ({ lead, isOpen, onClose, onUpdate, onNavigateToFollowUp }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Lead | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (lead) setFormData(lead);
  }, [lead]);

  if (!lead || !formData) return null;

  const currentStageIndex = STAGES.indexOf(formData.stage || 'Inquiry');

  const handleStageClick = (stage: FollowUpStage) => {
    const updated = { ...formData, stage };
    setFormData(updated);
    onUpdate(updated);
  };

  const handleAIScore = async () => {
    setIsScoring(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this real estate lead and give a priority score 0-100.
        Name: ${lead.name}
        Stage: ${formData.stage}
        Property: ${lead.propertyAddress}
        Notes: ${lead.notes}
        Return ONLY a number.`,
      });
      const score = parseInt(response.text?.trim() || '50');
      const updated = { ...formData, priorityScore: score };
      onUpdate(updated);
      setFormData(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScoring(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      alert("Mic access required.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessingVoice(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [
            { inlineData: { mimeType: 'audio/webm', data: base64Audio } },
            { text: "Extract real estate lead details: interaction summary, next follow-up task, and sentiment. Return JSON." }
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                nextStep: { type: Type.STRING },
                sentiment: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative'] },
              },
              required: ['summary', 'nextStep', 'sentiment'],
            },
          },
        });
        const result = JSON.parse(response.text || '{}');
        const updated = {
          ...formData,
          notes: (formData.notes || '') + `\nVoice Summary: ${result.summary}`,
          nextFollowUpTask: result.nextStep,
          sentiment: result.sentiment,
          taskCompleted: false
        };
        setFormData(updated);
        onUpdate(updated);
      };
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Ensure taskDueDate is captured from state before calling the main update
    onUpdate(formData);
    setIsSaving(false);
    setIsEditing(false);
  };

  const toggleTaskStatus = () => {
    setFormData({ ...formData, taskCompleted: !formData.taskCompleted });
  };

  return (
    <>
      <div className={cn("fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={onClose} />
      <div className={cn("fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transition-transform duration-300 transform flex flex-col border-l border-slate-100", isOpen ? "translate-x-0" : "translate-x-full")}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">Buyer Intel <Target className="w-4 h-4 text-emerald-500" /></h2>
            <div className="flex gap-2">
                <button onClick={() => setIsEditing(!isEditing)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar no-scrollbar">
            {/* Pipeline Tracker */}
            <div className="px-6 py-6 border-b bg-slate-50/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Pipeline Progress</p>
                <div className="flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
                    <div className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }} />
                    {STAGES.map((s, i) => (
                        <button 
                            key={s} 
                            onClick={() => handleStageClick(s)}
                            className={cn(
                                "relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 group",
                                i <= currentStageIndex ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white border-2 border-slate-200 text-slate-400"
                            )}
                        >
                            <span className="text-[10px] font-bold">{i + 1}</span>
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[9px] px-2 py-1 rounded transition-opacity z-20">
                                {s}
                            </div>
                        </button>
                    ))}
                </div>
                <div className="mt-10 text-center">
                    <p className="text-sm font-bold text-slate-900">{formData.stage}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Current Milestone</p>
                </div>
            </div>

            <div className="p-8 text-center border-b relative">
                <div className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4 border-4 border-white shadow-xl">
                    {lead.name.substring(0,2).toUpperCase()}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 leading-tight">{lead.name}</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 flex items-center justify-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Captured {formatDate(lead.createdAt)}
                </p>
                
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <div className="bg-white border rounded-xl px-4 py-2 shadow-sm flex items-center gap-3">
                        <Target className="w-4 h-4 text-emerald-500" />
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Buyer Score</p>
                            <p className="text-lg font-bold text-slate-900">{formData.priorityScore || '??'}</p>
                        </div>
                        <button onClick={handleAIScore} disabled={isScoring} className="ml-2 p-1.5 bg-slate-100 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-all">
                            {isScoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        </button>
                    </div>

                    <div className={cn(
                        "bg-white border rounded-xl px-4 py-2 shadow-sm flex items-center gap-3 transition-all",
                        formData.sentiment === 'Negative' && "border-rose-200 bg-rose-50/30"
                    )}>
                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            formData.sentiment === 'Positive' ? "bg-emerald-50 text-emerald-600" :
                            formData.sentiment === 'Negative' ? "bg-rose-100 text-rose-600 animate-pulse" :
                            "bg-slate-50 text-slate-400"
                        )}>
                            {formData.sentiment === 'Positive' ? <TrendingUp className="w-4 h-4" /> :
                             formData.sentiment === 'Negative' ? <ShieldAlert className="w-4 h-4" /> :
                             <Activity className="w-4 h-4" />}
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Sentiment</p>
                            <p className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                formData.sentiment === 'Positive' ? "text-emerald-600" :
                                formData.sentiment === 'Negative' ? "text-rose-600" :
                                "text-slate-900"
                            )}>
                                {formData.sentiment || 'Neutral'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Reminders / Task Section */}
                <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <CalendarClock className="w-4 h-4 text-emerald-500" /> Reminders & Tasks
                    </h4>
                    <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Task Details</span>
                            <button 
                                onClick={toggleTaskStatus}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all",
                                    formData.taskCompleted 
                                        ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" 
                                        : "bg-slate-50 text-slate-400 border-slate-100"
                                )}
                            >
                                {formData.taskCompleted ? <Check className="w-3 h-3 text-white" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                                {formData.taskCompleted ? 'Completed' : 'Pending'}
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            <Input 
                                label="Next Action" 
                                placeholder="e.g. Call to discuss contract"
                                value={formData.nextFollowUpTask || ''}
                                onChange={(e) => setFormData({...formData, nextFollowUpTask: e.target.value})}
                                className={cn(
                                    "h-10 text-xs transition-all",
                                    formData.taskCompleted && "line-through opacity-50 grayscale"
                                )}
                            />
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Due Date & Time</label>
                                <Input 
                                    type="datetime-local"
                                    value={formData.taskDueDate ? formData.taskDueDate.substring(0, 16) : ''}
                                    onChange={(e) => setFormData({...formData, taskDueDate: e.target.value})}
                                    className={cn(
                                        "h-10 text-xs transition-all",
                                        formData.taskCompleted && "line-through opacity-50 grayscale"
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Property Detail Section */}
                <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-slate-400" /> Listing Connection
                    </h4>
                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-emerald-900">{formData.propertyAddress || 'No property linked'}</p>
                            <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-tighter mt-0.5">Primary Interest</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-100">
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Client History & Logs</h4>
                        <div className="flex gap-2">
                           <button onClick={isRecording ? stopRecording : startRecording} className={cn(
                             "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                             isRecording ? "bg-rose-500 text-white animate-pulse" : "bg-white border text-slate-600 hover:bg-slate-50"
                           )}>
                             {isRecording ? <Square className="w-3 h-3 fill-current" /> : <Mic className="w-3.5 h-3.5" />}
                             {isRecording ? "Stop Log" : "Voice Intel"}
                           </button>
                        </div>
                    </div>
                    <div className="relative">
                        <textarea 
                            className="w-full h-40 p-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:bg-white transition-all resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            placeholder="Add discovery notes here..."
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        />
                        {isProcessingVoice && (
                           <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-2xl">
                               <div className="flex flex-col items-center gap-2">
                                   <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                                   <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">AI Processing Intel...</p>
                               </div>
                           </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-8">
                    <div className="bg-white p-4 border rounded-2xl">
                         <Mail className="w-4 h-4 text-slate-400 mb-2" />
                         <p className="text-[10px] uppercase font-bold text-slate-400">Email Address</p>
                         <p className="text-sm font-medium truncate text-slate-900">{lead.email}</p>
                    </div>
                    <div className="bg-white p-4 border rounded-2xl">
                         <Phone className="w-4 h-4 text-slate-400 mb-2" />
                         <p className="text-[10px] uppercase font-bold text-slate-400">Source</p>
                         <p className="text-sm font-medium text-slate-900">{lead.source}</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-6 border-t bg-slate-50/50 flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onNavigateToFollowUp(lead.id)}>
                <MessageSquare className="w-4 h-4 mr-2" /> Follow Up
            </Button>
            <Button className="flex-1 rounded-xl" onClick={handleSave} isLoading={isSaving}>
                <Save className="w-4 h-4 mr-2" /> Update Profile
            </Button>
        </div>
      </div>
    </>
  );
};
