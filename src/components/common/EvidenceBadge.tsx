import React from 'react';
import { EvidenceCategory } from '../../types';
import { getEvidenceMeta } from '../../domain/evidence';
import { ShieldCheck, Users, Code, HelpCircle } from 'lucide-react';

interface EvidenceBadgeProps {
  category: EvidenceCategory;
  showIcon?: boolean;
  interactive?: boolean;
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  category,
  showIcon = true,
}) => {
  const meta = getEvidenceMeta(category);

  const renderIcon = () => {
    switch (category) {
      case 'official_source':
        return <ShieldCheck size={13} aria-hidden="true" />;
      case 'community_reported':
        return <Users size={13} aria-hidden="true" />;
      case 'original_practice':
        return <Code size={13} aria-hidden="true" />;
      default:
        return <HelpCircle size={13} aria-hidden="true" />;
    }
  };

  return (
    <span
      className={`evidence-badge ${meta.badgeClass}`}
      title={meta.description}
      aria-label={`Evidence confidence: ${meta.label}. ${meta.description}`}
    >
      {showIcon && renderIcon()}
      <span>{meta.shortLabel}</span>
    </span>
  );
};
