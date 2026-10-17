import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EvidenceBadge } from '../components/common/EvidenceBadge';
import { NotFoundPage } from '../pages/NotFoundPage';
import { EmptyState } from '../components/common/EmptyState';

describe('UI Component Rendering & Safety Checks', () => {
  it('renders official evidence badge with accessible label and text', () => {
    render(<EvidenceBadge category="official_source" />);
    const badge = screen.getByLabelText(/Evidence confidence: Official Source/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Official');
  });

  it('renders community reported evidence badge with warning descriptor', () => {
    render(<EvidenceBadge category="community_reported" />);
    const badge = screen.getByLabelText(/Evidence confidence: Community Reported/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Community');
  });

  it('renders NotFoundPage with clear navigation recovery controls', () => {
    render(
      <MemoryRouter initialEntries={['/non-existent-route-12345']}>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Page Not Found \(404\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse Employers/i)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard Overview/i)).toBeInTheDocument();
  });

  it('safely renders untrusted text in EmptyState as text rather than raw HTML', () => {
    const maliciousScript = '<script>alert("xss")</script><img src="x" onerror="alert(1)">';
    render(
      <EmptyState
        title={maliciousScript}
        description={maliciousScript}
      />
    );

    // Text must be escaped and rendered literally inside text nodes
    const matches = screen.getAllByText(maliciousScript, { exact: false });
    expect(matches.length).toBe(2);
    // Must NOT contain an active img with onerror or script tag in the DOM
    expect(document.querySelector('img[onerror]')).toBeNull();
    expect(document.querySelector('script')).toBeNull();
  });
});
