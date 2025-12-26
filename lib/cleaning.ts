
import { Lead, DataHealth } from '../types';
import { GoogleGenAI } from "@google/genai";

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
 * Validates an email address using an external verification pattern.
 * This simulates a third-party API call (like AbstractAPI or ZeroBounce).
 */
export const validateEmailAddress = async (email: string): Promise<boolean> => {
  const e = email.toLowerCase().trim();
  
  // 1. Basic Regex Syntax Check
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(e)) return false;

  // 2. Disposable Email / Known Fake Pattern Heuristics
  const fakePatterns = ['test@', 'asdf@', 'example@', 'qwerty@', 'none@', 'noemail@', 'tempmail', 'guerrillamail'];
  if (fakePatterns.some(p => e.includes(p))) return false;

  // 3. Deep Verification using Gemini (Simulating Third-Party API logic for deliverability)
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a deliverability and risk assessment for this email: ${e}. 
      Is this a valid, likely deliverable, non-disposable work or personal email? 
      Respond with exactly "valid" or "invalid".`,
    });
    
    const result = response.text?.toLowerCase().trim();
    return result === 'valid';
  } catch (error) {
    console.error("Third-party email validation failed, falling back to regex", error);
    return emailRegex.test(e);
  }
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
    isInvalidEmail: !!lead.health?.isInvalidEmail, // Persist current state if already checked
    needsStandardization: lead.name !== standardizeName(lead.name)
  };
};
