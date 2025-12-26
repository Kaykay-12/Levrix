
import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus, FollowUpStage } from '../types';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Search, MoreHorizontal, Mail, ChevronLeft, ChevronRight, Download, Home, Megaphone, AlertCircle, ShieldAlert, CheckCircle2, Copy, Sparkles, Wand2, Facebook, Globe, RefreshCw } from 'lucide-react';
import { LeadModal } from '../components/LeadModal';
import { LeadDetails } from '../components/LeadDetails';
import { cn } from '../lib/utils';

interface LeadsProps {
  leads: Lead[];
  onAddLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onUpdateLead: (lead: Lead) => void;
  onMergeLeads: (masterId: string, duplicateIds: string[]) => void;
  onNavigateToFollowUp: (leadId: string) => void;
  onSyncFacebook?: () => Promise<void>;
  onSyncGoogle?: () => Promise<void>;
}

const ITEMS_PER_PAGE = 10;

export const Leads: React.FC<LeadsProps> = ({ leads, onAddLead, onUpdateStatus, onUpdateLead, onMergeLeads, onNavigateToFollowUp, onSyncFacebook, onSyncGoogle }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [mergeConfirmId, setMergeConfirmId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGoogleSyncing, setIsGoogleSyncing] = useState(false);
  
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.propertyAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'All') matchesStatus = true;
    else if (statusFilter === 'Critical') matchesStatus = lead.agingStatus === 'critical';
    else if (statusFilter === 'Warning') matchesStatus = lead.agingStatus === 'warning';
    else if (statusFilter === 'Follow Up Needed') {
      matchesStatus = lead.status === 'Follow Up Needed' || (!!lead.taskDueDate && !lead.taskCompleted);
    }
    else if (statusFilter === 'Dirty') {
      matchesStatus = !!(lead.health?.isDuplicate || lead.health?.isInvalidEmail || lead.health?.needsStandardization);
    }
    else if (statusFilter === 'Won') matchesStatus = lead.status === 'Won';
    else if (statusFilter === 'Lost') matchesStatus = lead.status === 'Lost';

    return matchesSearch && matchesStatus;
  });

  const dirtyCount = leads.filter(l => l.health?.isDuplicate || l.health?.isInvalidEmail || l.health?.needsStandardization).length;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleFBSync = async () => {
    if (!onSyncFacebook) return;
    setIsSyncing(true);
    try { await onSyncFacebook(); } finally { setIsSyncing(false); }
  };

  const handleGoogleSync = async () => {
    if (!onSyncGoogle) return;
    setIsGoogleSyncing(true);
    try { await onSyncGoogle(); } finally { setIsGoogleSyncing(false); }
  };

  const getStageColor = (stage?: FollowUpStage) => {
    switch (stage) {
        case 'Inquiry': return 'text-blue-600 bg-blue-50 border-blue-100';
        case 'First Contact': return 'text-purple-600 bg-purple-50 border-purple-100';
        case 'Property Viewing': return 'text-amber-600 bg-amber-50 border-amber-100';
        case 'Offer Made': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        case 'Closed': return 'text-slate-900 bg-slate-100 border-slate-200';
        default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Buyer Pipeline</h2>
          <p className="text-slate-500 mt-1">Behavioral tracking for property inquiries.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="flex gap-1">
                {onSyncFacebook && (
                    <Button 
                        variant="outline" 
                        className="border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 h-11" 
                        onClick={handleFBSync}
                        isLoading={isSyncing}
                    >
                        <Facebook className="w-4 h-4" />
                    </Button>
                )}
                {onSyncGoogle && (
                    <Button 
                        variant="outline" 
                        className="border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 h-11" 
                        onClick={handleGoogleSync}
                        isLoading={isGoogleSyncing}
                    >
                        <Globe className="w-4 h-4" />
                    </Button>
                )}
            </div>
            {dirtyCount > 0 && (
                <Button variant="outline" className="border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100" onClick={() => setStatusFilter('Dirty')}>
                    <Sparkles className="w-4 h-4 mr-2" /> Clean ({dirtyCount})
                </Button>
            )}
            <Button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none">
                <Plus className="w-4 h-4 mr-2" /> New Inquiry
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b bg-slate-50/30">
            <div className="flex flex-col lg:flex-row gap-4 justify-between">
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search buyers, listings, campaigns..." className="pl-9 h-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                    {['All', 'Critical', 'Warning', 'Follow Up Needed', 'Dirty', 'Won', 'Lost'].map((s) => (
                         <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={cn(
                                "px-3 py-1.5 text-[10px] rounded-full border transition-all font-black uppercase tracking-widest whitespace-nowrap shadow-sm",
                                statusFilter === s 
                                    ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10" 
                                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            )}
                         >
                            {s}
                         </button>
                    ))}
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50 border-b border-slate-100 tracking-widest font-black">
                <tr>
                  <th className="px-6 py-4 w-10">Health</th>
                  <th className="px-4 py-4">Buyer Info</th>
                  <th className="px-4 py-4">Current Stage</th>
                  <th className="px-4 py-4">Listing Interest</th>
                  <th className="px-4 py-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-24 text-center text-slate-300 font-medium">No inquiries matching your behavioral filters.</td></tr>
                ) : (
                    paginatedLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors cursor-pointer group" onClick={() => setSelectedLead(lead)}>
                        <td className="px-6 py-5">
                            <div className="flex gap-1.5">
                                <div className={cn(
                                    "w-3 h-3 rounded-full shadow-sm",
                                    lead.agingStatus === 'critical' ? "bg-rose-500 animate-pulse shadow-rose-500/20" : 
                                    lead.agingStatus === 'warning' ? "bg-amber-400" : "bg-emerald-500"
                                )} title={`Aging: ${lead.agingStatus}`} />
                            </div>
                        </td>
                        <td className="px-4 py-5">
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                                {lead.name}
                                {lead.source === 'Facebook' && <Facebook className="w-3 h-3 text-blue-500" />}
                                {lead.source === 'Google' && <Globe className="w-3 h-3 text-slate-400" />}
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-tighter font-bold">{lead.email}</div>
                        </td>
                        <td className="px-4 py-5">
                            <span className={cn("px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border", getStageColor(lead.stage))}>
                                {lead.stage || 'Inquiry'}
                            </span>
                        </td>
                        <td className="px-4 py-5">
                            <div className="font-bold text-slate-700">{lead.propertyAddress || 'General Search'}</div>
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{lead.campaignSource || 'Direct'}</div>
                        </td>
                        <td className="px-4 py-5 text-right pr-6">
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100">
                                <MoreHorizontal className="w-4 h-4 text-slate-400" />
                            </Button>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={onAddLead} />
      <LeadDetails lead={selectedLead} isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} onUpdate={onUpdateLead} onNavigateToFollowUp={onNavigateToFollowUp} />
    </div>
  );
};
