import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Clock,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Scale,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  BookOpen,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { getEmployerById, getAssessmentById } from '../data';
import {
  getBookmarkedEmployerIds,
  toggleEmployerBookmark,
  getComparedEmployerIds,
  toggleEmployerComparison,
  subscribeToStorage,
} from '../storage/localStorageService';
import { EvidenceBadge } from '../components/common/EvidenceBadge';
import { formatRecency, getEvidenceMeta } from '../domain/evidence';
import { Assessment } from '../types';

export const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const employer = getEmployerById(id || '');

  const [bookmarkedIds, setBookmarkedIds] = useState(getBookmarkedEmployerIds());
  const [comparedIds, setComparedIds] = useState(getComparedEmployerIds());

  useEffect(() => {
    return subscribeToStorage(() => {
      setBookmarkedIds(getBookmarkedEmployerIds());
      setComparedIds(getComparedEmployerIds());
    });
  }, []);

  if (!employer) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Employer Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          No employer profile was found with ID &ldquo;{id}&rdquo;.
        </p>
        <Link to="/companies" className="btn btn-primary">
          Back to Employer Directory
        </Link>
      </div>
    );
  }

  const isBookmarked = bookmarkedIds.includes(employer.id);
  const isCompared = comparedIds.includes(employer.id);

  // Associated practice assessments
  const associatedAssessments = employer.practiceAssessmentIds
    .map((aid) => getAssessmentById(aid))
    .filter((a): a is Assessment => Boolean(a));

  return (
    <div className="page-container">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/companies">Employers</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
          {employer.name}
        </span>
      </nav>

      {/* Profile Header */}
      <div
        className="surface-card"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
                {employer.name}
              </h1>
              <span
                style={{
                  fontSize: '0.8125rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-default)',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                }}
              >
                {employer.category}
              </span>
            </div>

            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '840px', lineHeight: 1.6 }}>
              {employer.overview}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={16} />
                <span>Hubs: <strong>{employer.engineeringHubs.join(', ')}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={16} />
                <span>Reviewed: <strong>{formatRecency(employer.lastReviewedDate)}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={16} />
                <span>Confidence: <strong style={{ textTransform: 'capitalize' }}>{employer.evidenceConfidence}</strong></span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => toggleEmployerComparison(employer.id)}
              style={{
                background: isCompared ? 'var(--accent-subtle)' : undefined,
                borderColor: isCompared ? 'var(--border-focus)' : undefined,
              }}
            >
              <Scale size={16} />
              <span>{isCompared ? 'In Comparison' : 'Add to Compare'}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => toggleEmployerBookmark(employer.id)}
              style={{ color: isBookmarked ? '#f59e0b' : undefined }}
            >
              {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>
          </div>
        </div>

        {/* Known variations & uncertainty notes alert */}
        {employer.uncertaintyNotes.length > 0 && (
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--status-community-bg)',
              border: '1px solid var(--status-community-border)',
              display: 'flex',
              gap: '0.75rem',
            }}
          >
            <AlertCircle size={20} style={{ color: 'var(--status-community-text)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--status-community-text)' }}>
                Evidence Notice & Known Regional Variations
              </div>
              <ul style={{ margin: '0.35rem 0 0 1.25rem', fontSize: '0.8125rem', color: 'var(--status-community-text)', lineHeight: 1.5 }}>
                {employer.uncertaintyNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Role Tracks */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Target Role Tracks
        </h2>
        <div className="grid-2">
          {employer.roleTracks.map((role, idx) => (
            <div key={idx} className="surface-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {role.track}
                </h3>
                <span
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  {role.level.replace('_', ' ')}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                {role.description}
              </p>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, marginRight: '0.5rem' }}>
                  Stack:
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {role.typicalTechStack.join(' · ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Hiring Stages Timeline */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Verified Hiring Stages & Formats
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Sequenced progression from application through final hiring committee.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {employer.hiringStages.map((stage) => {
            const stageSources = employer.sources.filter((s) => stage.sourceIds.includes(s.id));

            return (
              <div
                key={stage.id}
                className="surface-card"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--accent-subtle)',
                        color: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                      }}
                    >
                      {stage.order}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {stage.name}
                      </h3>
                      {stage.durationMins && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          Estimated duration: {stage.durationMins} minutes
                        </div>
                      )}
                    </div>
                  </div>

                  <EvidenceBadge category={stage.evidenceCategory} />
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {stage.format}
                </p>

                {stage.knownVariations && (
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--status-community-text)',
                      background: 'var(--status-community-bg)',
                      padding: '0.4rem 0.65rem',
                      borderRadius: 'var(--radius-xs)',
                    }}
                  >
                    <strong>Variation note:</strong> {stage.knownVariations}
                  </div>
                )}

                {/* Focus Areas */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                    Core Evaluation Areas:
                  </span>
                  {stage.focusAreas.map((area, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.75rem',
                        background: 'var(--bg-subtle)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {area}
                    </span>
                  ))}
                </div>

                {/* Sourced citations reference */}
                {stageSources.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                    Supported by:{' '}
                    {stageSources.map((s, idx) => (
                      <span key={s.id}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}
                        >
                          {s.title}
                        </a>
                        {idx < stageSources.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Relevant Practice Material */}
      {associatedAssessments.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
            Relevant Practice Assessments
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Original simulations designed around competencies tested at {employer.name}.
          </p>

          <div className="grid-2">
            {associatedAssessments.map((ass) => (
              <div key={ass.id} className="surface-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {ass.title}
                    </h3>
                    <EvidenceBadge category={ass.evidenceCategory} />
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    {ass.description}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {ass.questionIds.length} questions · ~{ass.estimatedDurationMins}m · Skills: {ass.skills.join(', ')}
                  </div>
                </div>

                <Link to={`/practice/${ass.id}/briefing`} className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
                  <span>Review Pre-Assessment Briefing →</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Sources & Evidence Trail */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
          Evidence Citations & Source Trail
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Primary references establishing stage formats, durations, and criteria.
        </p>

        <div className="surface-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {employer.sources.map((source) => (
              <div key={source.id} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: 'var(--accent-primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <span>{source.title}</span>
                    <ExternalLink size={13} />
                  </a>
                  <EvidenceBadge category={source.evidenceCategory} />
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  <strong>Publisher:</strong> {source.publisher} · <strong>Claim:</strong> {source.claimSupported}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Published: {source.publishedDate || 'Unspecified'} · Verified: {formatRecency(source.lastReviewedDate)}
                  {source.uncertaintyNotes && ` · Notice: ${source.uncertaintyNotes}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
