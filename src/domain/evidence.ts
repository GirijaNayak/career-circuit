import { EvidenceCategory } from '../types';

export interface EvidenceDescriptor {
  label: string;
  shortLabel: string;
  description: string;
  badgeClass: string;
  confidenceRank: number; // 3 = highest
}

export const EVIDENCE_METADATA: Record<EvidenceCategory, EvidenceDescriptor> = {
  official_source: {
    label: 'Official Source',
    shortLabel: 'Official',
    description: 'Documented directly by the employer, corporate engineering blog, or verified university recruiter disclosures.',
    badgeClass: 'evidence-badge-official',
    confidenceRank: 3,
  },
  community_reported: {
    label: 'Community Reported',
    shortLabel: 'Community',
    description: 'Sourced from candidate debriefs, forum reports, and community aggregations. Timing, question formats, and stages may vary by region or year.',
    badgeClass: 'evidence-badge-community',
    confidenceRank: 2,
  },
  original_practice: {
    label: 'Original Practice',
    shortLabel: 'Practice Material',
    description: 'Developed by CareerCircuit to test core computer science & systems concepts. This is not an official or leaked employer exam.',
    badgeClass: 'evidence-badge-original',
    confidenceRank: 2,
  },
  unknown: {
    label: 'Unknown / Unverified',
    shortLabel: 'Unverified',
    description: 'Insufficient public evidence exists. Treat as unconfirmed until reliable primary documentation is available.',
    badgeClass: 'evidence-badge-unknown',
    confidenceRank: 1,
  },
};

export function getEvidenceMeta(category: EvidenceCategory): EvidenceDescriptor {
  return EVIDENCE_METADATA[category] || EVIDENCE_METADATA.unknown;
}

export function formatRecency(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return isoDateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return isoDateString;
  }
}
