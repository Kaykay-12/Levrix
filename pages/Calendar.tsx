import React from 'react';
import { Card } from '../components/ui/Card';
import { Lead, MessageLog } from '../types';
import { CalendarView } from '../components/CalendarView';

interface CalendarProps {
  leads: Lead[];
  messageLogs: MessageLog[];
}

export const Calendar: React.FC<CalendarProps> = ({ leads, messageLogs }) => {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Calendar</h2>
        <p className="text-slate-500 mt-1">Schedule and view upcoming tasks and messages.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-lg p-6">
        <CalendarView leads={leads} messageLogs={messageLogs} className="h-full" />
      </Card>
    </div>
  );
};