
import { Lead, MessageLog } from '../types';

export const INITIAL_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@company.com',
    phone: '555-0123',
    source: 'Facebook',
    campaignSource: 'Luxury Penthouses FB',
    propertyAddress: '124 Park Ave, Unit 4B',
    status: 'New',
    // Added missing required 'stage' property
    stage: 'Inquiry',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    notes: 'Interested in the pro plan.'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'm.chen@startup.io',
    phone: '555-0199',
    source: 'Google',
    campaignSource: 'Downtown Commercial Search',
    propertyAddress: '88 Broad St, Suite 1200',
    status: 'Contacted',
    // Added missing required 'stage' property
    stage: 'First Contact',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    lastContacted: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    firstContactedAt: new Date(Date.now() - 1000 * 60 * 60 * 23.5).toISOString(),
  },
  {
    id: '3',
    name: 'Emma Davis',
    email: 'emma.d@agency.net',
    phone: '555-0255',
    source: 'Manual',
    campaignSource: 'Local Referral',
    propertyAddress: '45 Sunset Blvd',
    status: 'Qualified',
    // Added missing required 'stage' property
    stage: 'Property Viewing',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    taskCompleted: true,
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'j.wilson@corp.org',
    phone: '555-0312',
    source: 'Referral',
    campaignSource: 'Zillow Premium',
    propertyAddress: '22 Ocean Drive',
    status: 'Won',
    // Added missing required 'stage' property
    stage: 'Closed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
   {
    id: '5',
    name: 'Linda Martinez',
    email: 'linda.m@tech.com',
    phone: '555-0456',
    source: 'Facebook',
    campaignSource: 'Suburban Living Ads',
    propertyAddress: '77 Maple Lane',
    status: 'Lost',
    // Added missing required 'stage' property
    stage: 'Inquiry',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    notes: 'Lost due to no response after 3 follow-ups.'
  },
  {
    id: '6',
    name: 'Robert Fox',
    email: 'robert.fox@example.com',
    phone: '555-0789',
    source: 'Manual',
    propertyAddress: '45 Sunset Blvd',
    status: 'Follow Up Needed',
    // Added missing required 'stage' property
    stage: 'First Contact',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    notes: 'Called twice, no answer. Need to try morning.',
    taskDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    taskCompleted: false,
    nextFollowUpTask: 'Morning Callback'
  }
];

export const INITIAL_LOGS: MessageLog[] = [
  {
    id: '101',
    leadId: '1',
    leadName: 'Sarah Johnson',
    channel: 'email',
    status: 'Sent',
    content: 'Subject: Information on 124 Park Ave\n\nHi Sarah, thanks for your interest...',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
  }
];
