
import { Lead, DataHealth } from '../types';

/**
 * Standardizes a string to Title Case (e.g. "SARAH johnson" -> "Sarah Johnson")
 */
export const standardizeName = (name: string): string => {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();
};

/**
 * Basic heuristic to detect fake/test emails
 */
export const isFakeEmail = (email: string): boolean => {
  const fakePatterns = [
    'test@',
    'asdf@',
    'example@',
    'qwerty@',
    'none@',
    'noemail@',
    'user@'
  ];
  const e = email.toLowerCase();
  
  // Syntax check
  if (!/^\S+@\S+\.\S+$/.test(e)) return true;
  
  // Pattern check
  if (fakePatterns.some(p => e.startsWith(p))) return true;
  
  // Repeating characters (e.g. aaaaa@...)
  const localPart = e.split('@')[0];
  if (localPart.length > 3 && /^(\w)\1+$/.test(localPart)) return true;

  return false;
};

/**
 * Analyzes a list of leads and identifies health issues
 */
export const analyzeLeadHealth = (lead: Lead, allLeads: Lead[]): DataHealth => {
  const duplicates = allLeads.filter(l => 
    l.id !== lead.id && 
    (
      (l.phone && lead.phone && l.phone.replace(/\D/g,'') === lead.phone.replace(/\D/g,'')) ||
      (l.email && lead.email && l.email.toLowerCase() === lead.email.toLowerCase())
    )
  );

  return {
    isDuplicate: duplicates.length > 0,
    duplicateIds: duplicates.map(d => d.id),
    isInvalidEmail: isFakeEmail(lead.email),
    needsStandardization: lead.name !== standardizeName(lead.name)
  };
};
