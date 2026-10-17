import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Scale,
  X,
  Building2,
  MapPin,
  ExternalLink,
  ArrowUpDown,
} from 'lucide-react';
import { getAllEmployers } from '../data';
import {
  getBookmarkedEmployerIds,
  toggleEmployerBookmark,
  getComparedEmployerIds,
  toggleEmployerComparison,
  clearComparison,
  subscribeToStorage,
} from '../storage/localStorageService';
import { EvidenceBadge } from '../components/common/EvidenceBadge';
import { formatRecency } from '../domain/evidence';
import { EmptyState } from '../components/common/EmptyState';

export const CompaniesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const allEmployers = useMemo(() => getAllEmployers(), []);

  const [bookmarkedIds, setBookmarkedIds] = useState(getBookmarkedEmployerIds());
  const [comparedIds, setComparedIds] = useState(getComparedEmployerIds());

  useEffect(() => {
    return subscribeToStorage(() => {
      setBookmarkedIds(getBookmarkedEmployerIds());
      setComparedIds(getComparedEmployerIds());
    });
  }, []);

  // Filter state synced with URL search params
  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || 'all';
  const selectedLevel = searchParams.get('level') || 'all';
  const selectedEvidence = searchParams.get('evidence') || 'all';
  const sortBy = searchParams.get('sort') || 'name'; // 'name', 'recency', 'confidence'

  const updateParam = (key: string, value: string) => {
    const updated = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      updated.delete(key);
    } else {
      updated.set(key, value);
    }
    setSearchParams(updated, { replace: true });
  };

  const clearAllFilters = () => {
    setSearchParams({}, { replace: true });
  };

  // Distinct categories and locations for filter dropdowns
  const categories = useMemo(() => {
    return Array.from(new Set(allEmployers.map((e) => e.category)));
  }, [allEmployers]);

  // Filtered & Sorted employers
  const filteredEmployers = useMemo(() => {
    let result = [...allEmployers];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (emp) =>
          emp.name.toLowerCase().includes(q) ||
          emp.aliases.some((a) => a.toLowerCase().includes(q)) ||
          emp.overview.toLowerCase().includes(q) ||
          emp.engineeringHubs.some((h) => h.toLowerCase().includes(q)) ||
          emp.roleTracks.some((t) =>
            t.typicalTechStack.some((tech) => tech.toLowerCase().includes(q))
          )
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((emp) => emp.category === selectedCategory);
    }

    // Level filter
    if (selectedLevel !== 'all') {
      result = result.filter((emp) =>
        emp.roleTracks.some((t) => t.level === selectedLevel)
      );
    }

    // Evidence filter
    if (selectedEvidence !== 'all') {
      result = result.filter((emp) =>
        emp.hiringStages.some((stage) => stage.evidenceCategory === selectedEvidence)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'recency') {
        return new Date(b.lastReviewedDate).getTime() - new Date(a.lastReviewedDate).getTime();
      }
      if (sortBy === 'confidence') {
        const rank = { high: 3, medium: 2, low: 1 };
        return rank[b.evidenceConfidence] - rank[a.evidenceConfidence];
      }
      // default: name A-Z
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [allEmployers, searchQuery, selectedCategory, selectedLevel, selectedEvidence, sortBy]);

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedCategory !== 'all' ||
    selectedLevel !== 'all' ||
    selectedEvidence !== 'all' ||
    sortBy !== 'name';

  return (
    <div className="page-container">
      {/* Title & Overview */}
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
            Hiring Intelligence
          </span>
        </div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
          Employer Hiring Directory
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem', maxWidth: '750px' }}>
          Verified hiring stages, evidence levels, engineering hubs, and question formats. Every claim is attributed to official employer sources or dated community debriefs.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div
        className="surface-card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search companies, tech (e.g. Go, Rust), or hubs..."
              value={searchQuery}
              onChange={(e) => updateParam('q', e.target.value)}
              aria-label="Search employers by name, technology, or location"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => updateParam('q', '')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)',
                }}
                aria-label="Clear search text"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div style={{ flex: '0 1 180px' }}>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => updateParam('category', e.target.value)}
              aria-label="Filter by industry category"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Role Level Dropdown */}
          <div style={{ flex: '0 1 150px' }}>
            <select
              className="form-select"
              value={selectedLevel}
              onChange={(e) => updateParam('level', e.target.value)}
              aria-label="Filter by candidate level"
            >
              <option value="all">All Levels</option>
              <option value="intern">Internships</option>
              <option value="new_grad">New Grad</option>
            </select>
          </div>

          {/* Evidence Category Dropdown */}
          <div style={{ flex: '0 1 180px' }}>
            <select
              className="form-select"
              value={selectedEvidence}
              onChange={(e) => updateParam('evidence', e.target.value)}
              aria-label="Filter by evidence category"
            >
              <option value="all">All Evidence Types</option>
              <option value="official_source">Official Source Only</option>
              <option value="community_reported">Community Reported</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div style={{ flex: '0 1 170px' }}>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => updateParam('sort', e.target.value)}
              aria-label="Sort employers list"
            >
              <option value="name">Sort: Name (A-Z)</option>
              <option value="recency">Sort: Recently Reviewed</option>
              <option value="confidence">Sort: Evidence Confidence</option>
            </select>
          </div>
        </div>

        {/* Results Counter and Active Filter Tags */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div>
            Showing <strong>{filteredEmployers.length}</strong> of {allEmployers.length} employers
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={clearAllFilters}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <X size={13} />
              <span>Clear all filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Sticky Comparison Bar if employers selected */}
      {comparedIds.length > 0 && (
        <div
          style={{
            position: 'sticky',
            top: 'calc(var(--header-height) + 10px)',
            zIndex: 25,
            background: 'var(--bg-surface)',
            border: '2px solid var(--accent-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1.25rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Scale size={18} style={{ color: 'var(--accent-primary)' }} />
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                Comparing {comparedIds.length} of 4 employers:
              </span>{' '}
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {comparedIds
                  .map((id) => allEmployers.find((e) => e.id === id)?.name)
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={clearComparison}>
              Clear
            </button>
            <Link to="/compare" className="btn btn-primary btn-sm">
              View Side-by-Side Comparison →
            </Link>
          </div>
        </div>
      )}

      {/* Employers List / Table */}
      {filteredEmployers.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No employers match your search"
          description="Try removing some filters, checking for typos in the employer name, or clearing the category constraint."
          actionText="Clear Filters"
          onAction={clearAllFilters}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredEmployers.map((emp) => {
            const isBookmarked = bookmarkedIds.includes(emp.id);
            const isCompared = comparedIds.includes(emp.id);
            const primaryStage = emp.hiringStages[0];

            return (
              <div
                key={emp.id}
                className="surface-card"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                      <Link
                        to={`/companies/${emp.id}`}
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {emp.name}
                      </Link>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.15rem 0.5rem',
                          background: 'var(--bg-subtle)',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-secondary)',
                          fontWeight: 500,
                        }}
                      >
                        {emp.category}
                      </span>
                      {primaryStage && (
                        <EvidenceBadge category={primaryStage.evidenceCategory} />
                      )}
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '820px', lineHeight: 1.5 }}>
                      {emp.overview}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => toggleEmployerComparison(emp.id)}
                      title={isCompared ? 'Remove from comparison' : 'Add to side-by-side comparison (max 4)'}
                      style={{
                        background: isCompared ? 'var(--accent-subtle)' : undefined,
                        borderColor: isCompared ? 'var(--border-focus)' : undefined,
                      }}
                    >
                      <Scale size={14} />
                      <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                    </button>

                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => toggleEmployerBookmark(emp.id)}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark employer'}
                      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark employer'}
                      style={{ color: isBookmarked ? '#f59e0b' : 'var(--text-tertiary)' }}
                    >
                      {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    </button>
                  </div>
                </div>

                {/* Stages Preview & Metadata */}
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
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', color: 'var(--text-tertiary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} />
                      <span>{emp.engineeringHubs.slice(0, 3).join(', ')}{emp.engineeringHubs.length > 3 ? ' +' : ''}</span>
                    </div>

                    <div>
                      <strong>{emp.hiringStages.length}</strong> verified stages
                    </div>

                    <div>
                      Reviewed: <strong>{formatRecency(emp.lastReviewedDate)}</strong>
                    </div>

                    {emp.uncertaintyNotes.length > 0 && (
                      <span style={{ color: 'var(--status-community-text)' }}>
                        Notice: {emp.uncertaintyNotes[0]}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/companies/${emp.id}`}
                    style={{
                      fontWeight: 600,
                      color: 'var(--accent-primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <span>Full Hiring Stages & Sources</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
