import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, BookOpen, Layers, X } from 'lucide-react';
import { getAllEmployers, getAllAssessments, getAllInterviewModules } from '../../data';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const employers = getAllEmployers();
  const assessments = getAllAssessments();
  const interviewModules = getAllInterviewModules();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter items
  const cleanQ = query.toLowerCase().trim();

  const matchedEmployers = employers
    .filter(
      (e) =>
        e.name.toLowerCase().includes(cleanQ) ||
        e.aliases.some((a) => a.toLowerCase().includes(cleanQ)) ||
        e.category.toLowerCase().includes(cleanQ)
    )
    .slice(0, 4);

  const matchedAssessments = assessments
    .filter(
      (a) =>
        a.title.toLowerCase().includes(cleanQ) ||
        a.skills.some((s) => s.toLowerCase().includes(cleanQ))
    )
    .slice(0, 4);

  const matchedModules = interviewModules
    .filter(
      (m) =>
        m.title.toLowerCase().includes(cleanQ) ||
        m.category.toLowerCase().includes(cleanQ) ||
        m.recommendedSkills.some((s) => s.toLowerCase().includes(cleanQ))
    )
    .slice(0, 4);

  const allResults = [
    ...matchedEmployers.map((e) => ({
      id: `emp-${e.id}`,
      type: 'employer' as const,
      title: e.name,
      subtitle: `${e.category} · ${e.locations[0] || 'Multiple Locations'}`,
      route: `/companies/${e.id}`,
    })),
    ...matchedAssessments.map((a) => ({
      id: `ass-${a.id}`,
      type: 'assessment' as const,
      title: a.title,
      subtitle: `Assessment · ${a.skills.slice(0, 3).join(', ')} · ${a.estimatedDurationMins}m`,
      route: `/practice/${a.id}/briefing`,
    })),
    ...matchedModules.map((m) => ({
      id: `mod-${m.key}`,
      type: 'module' as const,
      title: m.title,
      subtitle: `Interview Prep · ${m.category}`,
      route: `/interview-prep/${m.key}`,
    })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (allResults.length > 0 ? (prev + 1) % allResults.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        allResults.length > 0 ? (prev - 1 + allResults.length) % allResults.length : 0
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = allResults[selectedIndex];
      if (target) {
        navigate(target.route);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search employers, assessments, and interview prep"
      onClick={onClose}
    >
      <div
        className="modal-content"
        style={{ maxWidth: '580px', marginTop: '-10vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            borderBottom: '1px solid var(--border-subtle)',
            gap: '0.75rem',
          }}
        >
          <Search size={18} style={{ color: 'var(--text-tertiary)' }} />
          <input
            ref={inputRef}
            type="text"
            className="form-input"
            style={{
              border: 'none',
              padding: '0.25rem 0',
              fontSize: '1rem',
              outline: 'none',
              background: 'transparent',
            }}
            placeholder="Search companies, assessment topics, or interview modules..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close search">
            <X size={16} />
          </button>
        </div>

        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '0.5rem' }}>
          {allResults.length === 0 ? (
            <div
              style={{
                padding: '2rem 1rem',
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                fontSize: '0.875rem',
              }}
            >
              No matching companies or practice materials found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {allResults.map((item, index) => {
                const isSelected = index === selectedIndex;
                let Icon = Building2;
                if (item.type === 'assessment') Icon = BookOpen;
                if (item.type === 'module') Icon = Layers;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      navigate(item.route);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--bg-subtle)' : 'transparent',
                      cursor: 'pointer',
                      border: isSelected ? '1px solid var(--border-default)' : '1px solid transparent',
                    }}
                  >
                    <Icon size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-tertiary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div
          style={{
            padding: '0.5rem 1rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
            display: 'flex',
            justifyContent: 'space-between',
            background: 'var(--bg-subtle)',
          }}
        >
          <span>Use ↑ and ↓ arrows to navigate</span>
          <span>Esc to dismiss</span>
        </div>
      </div>
    </div>
  );
};
