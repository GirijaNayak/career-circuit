import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Award,
  Layers,
  Sparkles,
  Zap,
  ArrowRight,
  Filter,
  CheckCircle,
} from 'lucide-react';
import { getAllAssessments, getAllEmployers } from '../data';
import { EvidenceBadge } from '../components/common/EvidenceBadge';

export const PracticePage: React.FC = () => {
  const assessments = useMemo(() => getAllAssessments(), []);
  const employers = useMemo(() => getAllEmployers(), []);

  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');

  // Extract unique skills across assessments
  const allSkills = useMemo(() => {
    const set = new Set<string>();
    assessments.forEach((a) => a.skills.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [assessments]);

  const filteredAssessments = useMemo(() => {
    return assessments.filter((ass) => {
      if (selectedDifficulty !== 'all' && ass.difficulty !== selectedDifficulty) {
        return false;
      }
      if (selectedSkill !== 'all' && !ass.skills.includes(selectedSkill)) {
        return false;
      }
      return true;
    });
  }, [assessments, selectedDifficulty, selectedSkill]);

  return (
    <div className="page-container">
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)',
            }}
          >
            Technical Simulation
          </span>
        </div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
          Assessment Catalog & Targeted Drills
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem', maxWidth: '750px' }}>
          Full-length diagnostic simulations and skill-specific drills. Choose timed mode to simulate recruitment pressure or untimed mode for deliberate practice.
        </p>
      </div>

      {/* Quick Launch Banner for Targeted Skill Drills */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Zap size={18} style={{ color: '#d97706' }} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Looking for fast, focused practice?
            </h2>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Start a targeted skill drill on specific topics (Algorithms, SQL, Concurrency, Networks, Debugging) with progressive hints and immediate explanations.
          </p>
        </div>

        <Link
          to="/practice/drills"
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <span>Launch Skill Drill</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Catalog Filters */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ flex: '0 1 200px' }}>
          <select
            className="form-select"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            aria-label="Filter assessments by difficulty"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div style={{ flex: '0 1 220px' }}>
          <select
            className="form-select"
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            aria-label="Filter assessments by topic or skill"
          >
            <option value="all">All Topics & Skills</option>
            {allSkills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>

        {(selectedDifficulty !== 'all' || selectedSkill !== 'all') && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSelectedDifficulty('all');
              setSelectedSkill('all');
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Assessments Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredAssessments.map((ass) => {
          const associatedCompanyNames = ass.associatedEmployerIds
            .map((id) => employers.find((e) => e.id === id)?.name)
            .filter(Boolean);

          return (
            <div
              key={ass.id}
              className="surface-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {ass.title}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-xs)',
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                      }}
                    >
                      {ass.difficulty}
                    </span>
                    <EvidenceBadge category={ass.evidenceCategory} />
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '820px', lineHeight: 1.5 }}>
                    {ass.description}
                  </p>
                </div>

                <Link
                  to={`/practice/${ass.id}/briefing`}
                  className="btn btn-primary"
                  style={{ alignSelf: 'flex-start' }}
                >
                  <span>Review Briefing & Start →</span>
                </Link>
              </div>

              {/* Assessment Attributes & Associated Employers */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.8125rem',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem', color: 'var(--text-tertiary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={14} />
                    <span>~{ass.estimatedDurationMins} minutes</span>
                  </div>
                  <div>
                    <strong>{ass.questionIds.length}</strong> questions
                  </div>
                  <div>
                    Topics: <strong style={{ color: 'var(--text-secondary)' }}>{ass.skills.join(', ')}</strong>
                  </div>
                </div>

                {associatedCompanyNames.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    Relevant for: <strong>{associatedCompanyNames.join(', ')}</strong>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
