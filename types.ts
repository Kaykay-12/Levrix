
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won' | 'Lost' | 'Archived' | 'Follow Up Needed';
export type FollowUpStage = 'Inquiry' | 'First Contact' | 'Property Viewing' | 'Offer Made' | 'Contract' | 'Closed';
export type AgingStatus = 'critical' | 'warning' | 'healthy';

export interface DataHealth {
  isDuplicate: boolean;
  duplicateIds: string[];
  isInvalidEmail: boolean;
  needsStandardization: boolean;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: 'Facebook' | 'Google' | 'Manual' | 'Referral';
  status: LeadStatus;
  stage: FollowUpStage;
  agingStatus?: AgingStatus;
  health?: DataHealth;
  createdAt: string;
  lastContacted?: string;
  firstContactedAt?: string;
  propertyAddress?: string;
  campaignSource?: string;
  notes?: string;
  nextFollowUp?: string;
  nextFollowUpTask?: string;
  taskDueDate?: string;
  taskCompleted?: boolean;
  taskDetails?: string;
  user_id?: string;
  priorityScore?: number;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent';
}

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Agent' | 'Viewer';
  status: 'Active' | 'Pending';
  joinedAt: string;
}

export interface Metric {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export type MessageChannel = 'email' | 'sms' | 'whatsapp';
export type MessageStatus = 'Queued' | 'Sent' | 'Delivered' | 'Failed';

export interface MessageLog {
  id: string;
  leadId: string;
  leadName: string;
  channel: MessageChannel;
  status: MessageStatus;
  content: string;
  sentAt: string;
  scheduledAt?: string;
  user_id?: string;
}

export interface IntegrationStatus {
  enabled: boolean;
  connected: boolean;
  statusMessage?: string;
  lastTested?: string;
}

export interface Integrations {
  email: IntegrationStatus & {
    provider: 'sendgrid' | 'mailgun' | 'smtp';
    apiKey: string;
    fromEmail: string;
  };
  sms: IntegrationStatus & {
    provider: 'twilio';
    accountSid: string;
    authToken: string;
    senderId: string;
    adminPhone: string;
    criticalAlertsEnabled: boolean;
    taskRemindersEnabled: boolean;
  };
  whatsapp: IntegrationStatus & {
    businessId: string;
    accessToken: string;
    phoneNumberId: string;
  };
  google: IntegrationStatus & {
    customerId: string;
    developerToken: string;
    lastSync?: string;
  };
  facebook: IntegrationStatus & {
    pageId: string;
    pageName?: string;
    accessToken: string;
  };
}

export interface Profile {
  id: string;
  email: string;
  fullName?: string;
  companyName?: string;
  logoUrl?: string;
  integrations: Integrations;
  subscriptionPlan: string;
}
