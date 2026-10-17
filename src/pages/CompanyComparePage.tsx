import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, X, Building2, ExternalLink, ShieldCheck, MapPin, Layers, ArrowLeft } from 'lucide-react';
import { getEmployerById, getAllEmployers } from '../data';
import {
  getComparedEmployerIds,
  toggleEmployerComparison,
  clearComparison,
  subscribeToStorage,
} from '../storage/localStorageService';
import { EvidenceBadge } from '../components/common/EvidenceBadge';
import { formatRecency } from '../domain/evidence';
import { EmptyState } from '../components/common/EmptyState';

import { Employer } from '../types';

export const CompanyComparePage: React.FC = () => {
  const [comparedIds, setComparedIds] = useState(getComparedEmployerIds());

  useEffect(() => {
    return subscribeToStorage(() => {
      setComparedIds(getComparedEmployerIds());
    });
  }, []);

  const comparedEmployers = comparedIds
    .map((id) => getEmployerById(id))
    .filter((e): e is Employer => Boolean(e));

  if (comparedEmployers.length === 0) {
    return (
      <div className="page-container">
        <nav className="breadcrumbs">
          <Link to="/companies">Employers</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Compare</span>
        </nav>
        <EmptyState
          icon={Scale}
          title="No employers selected for comparison"
          description="Select up to 4 employers from the Employer Directory to compare their hiring stages, role tracks, and evidence confidence side by side."
          actionText="Browse Employers"
          onAction={() => window.location.assign('/companies')}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs">
        <Link to="/companies">Employers</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Compare</span>
      </nav>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Employer Side-by-Side Comparison
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Comparing {comparedEmployers.length} of 4 selected employers across role tracks, stages, and evidence recency.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={clearComparison}>
            Clear All
          </button>
          <Link to="/companies" className="btn btn-secondary btn-sm">
            + Add Another Employer
          </Link>
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div
        style={{
          overflowX: 'auto',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)',
          background: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
              <th style={{ padding: '1rem 1.25rem', width: '200px', fontSize: '0.875rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                Attribute
              </th>
              {comparedEmployers.map((emp) => (
                <th key={emp.id} style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div>
                      <Link
                        to={`/companies/${emp.id}`}
                        style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}
                      >
                        {emp.name}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                        {emp.category}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-icon"
                      style={{ width: '24px', height: '24px' }}
                      onClick={() => toggleEmployerComparison(emp.id)}
                      title={`Remove ${emp.name} from comparison`}
                      aria-label={`Remove ${emp.name} from comparison`}
                    >
                      <X size={13} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ fontSize: '0.875rem' }}>
            {/* Engineering Hubs */}
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-subtle)' }}>
                Engineering Hubs
              </td>
              {comparedEmployers.map((emp) => (
                <td key={emp.id} style={{ padding: '1rem 1.25rem', verticalAlign: 'top', color: 'var(--text-primary)' }}>
                  {emp.engineeringHubs.join(', ')}
                </td>
              ))}
            </tr>

            {/* Role Tracks */}
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-subtle)' }}>
                Target Role Tracks
              </td>
              {comparedEmployers.map((emp) => (
                <td key={emp.id} style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {emp.roleTracks.map((r, i) => (
                      <li key={i}>
                        <strong>{r.track}</strong> ({r.level.replace('_', ' ')})
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>

            {/* Hiring Stages Progression */}
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-subtle)' }}>
                Hiring Stages Flow
              </td>
              {comparedEmployers.map((emp) => (
                <td key={emp.id} style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                  <ol style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {emp.hiringStages.map((stg) => (
                      <li key={stg.id}>
                        <span style={{ fontWeight: 600 }}>{stg.name}</span>
                        {stg.durationMins && (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}> ({stg.durationMins}m)</span>
                        )}
                        <div style={{ marginTop: '0.2rem' }}>
                          <EvidenceBadge category={stg.evidenceCategory} />
                        </div>
                      </li>
                    ))}
                  </ol>
                </td>
              ))}
            </tr>

            {/* Evidence Quality & Recency */}
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-subtle)' }}>
                Evidence Confidence & Review Date
              </td>
              {comparedEmployers.map((emp) => (
                <td key={emp.id} style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                  <div style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {emp.evidenceConfidence} Confidence
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                    Last verified: {formatRecency(emp.lastReviewedDate)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {emp.sources.length} documented source citations
                  </div>
                </td>
              ))}
            </tr>

            {/* Practice Options */}
            <tr>
              <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-subtle)' }}>
                Practice Assessment
              </td>
              {comparedEmployers.map((emp) => (
                <td key={emp.id} style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                  <Link
                    to={`/companies/${emp.id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    View Company Profile →
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
