
import React, { useState } from 'react';
import { Lead } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { X, Wand2, User, Mail, Phone, Globe, FileText, Sparkles, Calendar, Home, Megaphone, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Omit<Lead, 'id' | 'createdAt'>) => void | Promise<void>;
}

export const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'Manual' as const,
    status: 'New' as const,
    notes: '',
    taskDueDate: '',
    propertyAddress: '',
    campaignSource: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        await onSave(formData);
        onClose();
        // Reset form for next time
        setFormData({
            name: '',
            email: '',
            phone: '',
            source: 'Manual',
            status: 'New',
            notes: '',
            taskDueDate: '',
            propertyAddress: '',
            campaignSource: ''
        });
    } catch (err) {
        console.error("Save failed", err);
    } finally {
        setIsSaving(false);
    }
  };

  const generateEnrichment = async () => {
    if (!formData.name && !formData.notes) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Context: Real Estate Lead. Name: ${formData.name}, Property: ${formData.propertyAddress}. Notes: ${formData.notes}. Generate a professional next-step suggestion.`,
      });
      setFormData(prev => ({
        ...prev,
        notes: (prev.notes ? prev.notes + '\n\n' : '') + `AI Insight: ${response.text}`
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20 relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent pointer-events-none" />
        <div className="flex justify-between items-center p-8 pb-2 relative z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Add Buyer Profile</h2>
            <p className="text-slate-500 text-sm mt-1">Capture details for new property inquiries.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 hover:bg-slate-100/80 p-2 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" placeholder="Jane Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required disabled={isSaving} />
            <Input label="Email Address" type="email" placeholder="jane@company.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required disabled={isSaving} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 ml-1 flex items-center gap-2"><Home className="w-3 h-3" /> Property Interest</label>
                <Input placeholder="e.g. 123 Ocean Blvd" value={formData.propertyAddress} onChange={(e) => setFormData({...formData, propertyAddress: e.target.value})} disabled={isSaving} />
            </div>
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 ml-1 flex items-center gap-2"><Megaphone className="w-3 h-3" /> Ad Campaign</label>
                <Input placeholder="e.g. Summer Penthouses FB" value={formData.campaignSource} onChange={(e) => setFormData({...formData, campaignSource: e.target.value})} disabled={isSaving} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 ml-1">Acquisition Source</label>
                  <select 
                      className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all focus:bg-white disabled:opacity-50"
                      value={formData.source}
                      onChange={(e) => setFormData({...formData, source: e.target.value as any})}
                      disabled={isSaving}
                  >
                      <option value="Manual">Manual Entry</option>
                      <option value="Facebook">Facebook Ads</option>
                      <option value="Google">Google Ads</option>
                      <option value="Referral">Referral</option>
                  </select>
              </div>
              <Input label="Task Due Date" type="datetime-local" value={formData.taskDueDate} onChange={(e) => setFormData({...formData, taskDueDate: e.target.value})} disabled={isSaving} />
          </div>
          <div className="relative group">
            <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-slate-700 ml-1">Discovery Notes</label>
                <button type="button" onClick={generateEnrichment} disabled={isGenerating || isSaving} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full hover:bg-indigo-100 disabled:opacity-50">
                    {isGenerating ? <Sparkles className="w-3 h-3 mr-1 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />}
                    AI Enrichment
                </button>
            </div>
            <textarea className="flex w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[80px] resize-none disabled:opacity-50" placeholder="Notes on budget, location preference, or family size..." value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} disabled={isSaving} />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>Cancel</Button>
            <Button type="submit" className="bg-slate-900 text-white px-8" isLoading={isSaving}>
                {isSaving ? "Creating..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
