
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { ChevronLeft, ChevronRight, MessageSquare, Phone, MoreHorizontal, Mail, Users, Video, FileText, CheckCircle } from 'lucide-react';
import { Lead, MessageLog } from '../types';
import { cn } from '../lib/utils';

interface CalendarViewProps {
  leads: Lead[];
  messageLogs: MessageLog[];
  className?: string;
  onEventClick?: (id: string, type: 'followup' | 'message') => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ leads, messageLogs, className, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getTaskIcon = (task: string) => {
      const t = task.toLowerCase();
      if (t.includes('email')) return <Mail className="w-2.5 h-2.5 flex-shrink-0" />;
      if (t.includes('meeting')) return <Users className="w-2.5 h-2.5 flex-shrink-0" />;
      if (t.includes('demo') || t.includes('video')) return <Video className="w-2.5 h-2.5 flex-shrink-0" />;
      if (t.includes('proposal')) return <FileText className="w-2.5 h-2.5 flex-shrink-0" />;
      if (t.includes('review')) return <CheckCircle className="w-2.5 h-2.5 flex-shrink-0" />;
      return <Phone className="w-2.5 h-2.5 flex-shrink-0" />; // Default to phone/call
  };

  const getEventsForDay = (day: number) => {
    const targetDateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
    
    const events: { id: string, type: 'followup' | 'message', title: string, time?: string, status?: string, task?: string }[] = [];

    // 1. Leads with Task Due Date
    leads.forEach(lead => {
        // Prioritize taskDueDate if set
        const dateToUse = lead.taskDueDate || lead.nextFollowUp;
        if (dateToUse) {
            const d = new Date(dateToUse);
            if (d.toDateString() === targetDateStr) {
                const taskDescription = lead.nextFollowUpTask || 'Follow-up';
                events.push({
                    id: lead.id,
                    type: 'followup',
                    title: `${taskDescription}: ${lead.name}`,
                    task: taskDescription,
                    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
            }
        }
    });

    // 2. Scheduled Messages
    messageLogs.forEach(log => {
        if (log.scheduledAt) {
            const d = new Date(log.scheduledAt);
            if (d.toDateString() === targetDateStr) {
                events.push({
                    id: log.id,
                    type: 'message',
                    title: `${log.channel.toUpperCase()} to ${log.leadName}`,
                    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: log.status
                });
            }
        }
    });

    return events;
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const startDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startDay }, (_, i) => i);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className={cn("flex flex-col h-full", className)}>
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-bold text-slate-700 text-lg">
                {monthName} <span className="text-slate-400 font-normal">{year}</span>
            </h3>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <Button variant="ghost" size="sm" onClick={prevMonth} className="h-7 w-7 p-0 rounded-md hover:bg-white hover:shadow-sm">
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                </Button>
                <Button variant="ghost" size="sm" onClick={nextMonth} className="h-7 w-7 p-0 rounded-md hover:bg-white hover:shadow-sm">
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                </Button>
            </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-white">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-slate-200 gap-px">
                {/* Empty cells for previous month */}
                {emptyDays.map(i => (
                    <div key={`empty-${i}`} className="bg-slate-50/50 min-h-[80px]" />
                ))}

                {/* Days of current month */}
                {days.map(day => {
                    const events = getEventsForDay(day);
                    const isToday = new Date().toDateString() === new Date(year, currentDate.getMonth(), day).toDateString();

                    return (
                        <div key={day} className={cn("bg-white p-2 min-h-[80px] group transition-colors hover:bg-slate-50 flex flex-col gap-1 relative", isToday && "bg-blue-50/30")}>
                            <div className="flex justify-between items-start">
                                <span className={cn(
                                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full transition-colors", 
                                    isToday ? "bg-blue-600 text-white shadow-sm" : "text-slate-700"
                                )}>
                                    {day}
                                </span>
                            </div>
                            
                            <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[80px] no-scrollbar">
                                {events.map((event, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onEventClick) onEventClick(event.id, event.type);
                                        }}
                                        className={cn(
                                            "text-[9px] px-1.5 py-1 rounded border truncate font-medium flex items-center gap-1 transition-all cursor-pointer hover:scale-[1.02]",
                                            event.type === 'followup' 
                                                ? "bg-amber-50 text-amber-800 border-amber-100 hover:border-amber-300" 
                                                : "bg-emerald-50 text-emerald-800 border-emerald-100 hover:border-emerald-300"
                                        )}
                                        title={event.title}
                                    >
                                        {event.type === 'followup' ? getTaskIcon(event.task || '') : <MessageSquare className="w-2.5 h-2.5 flex-shrink-0" />}
                                        <span className="truncate flex-1">{event.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
                
                {/* Fill remaining grid */}
                {Array.from({ length: 42 - (daysInMonth + startDay) }).map((_, i) => (
                    <div key={`next-empty-${i}`} className="bg-slate-50/50 min-h-[80px]" />
                ))}
            </div>
        </div>
    </div>
  );
};
