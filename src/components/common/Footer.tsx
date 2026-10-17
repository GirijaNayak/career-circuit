import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HardDrive, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        padding: '2.5rem 1.5rem 2rem',
        fontSize: '0.8125rem',
        color: 'var(--text-secondary)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--max-content-width)',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>CareerCircuit</span>
          </div>
          <p style={{ lineHeight: 1.6, color: 'var(--text-tertiary)' }}>
            Transparent technical hiring research, verified stage timelines, and honest assessment practice for early-career software engineers.
          </p>
        </div>

        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Research & Practice
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <li><Link to="/companies" style={{ color: 'var(--text-secondary)' }}>Employer Directory</Link></li>
            <li><Link to="/practice" style={{ color: 'var(--text-secondary)' }}>Assessment Catalog</Link></li>
            <li><Link to="/practice/drills" style={{ color: 'var(--text-secondary)' }}>Targeted Skill Drills</Link></li>
            <li><Link to="/interview-prep" style={{ color: 'var(--text-secondary)' }}>Interview Prep Modules</Link></li>
          </ul>
        </div>

        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Evidence & Integrity
          </div>
          <p style={{ lineHeight: 1.6, color: 'var(--text-tertiary)' }}>
            Every employer stage is labeled as Official, Community Reported, or Unverified. Practice questions are original simulations and never represented as official leaked tests.
          </p>
        </div>

        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Privacy & Storage
          </div>
          <p style={{ lineHeight: 1.6, color: 'var(--text-tertiary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span><HardDrive size={13} style={{ display: 'inline', marginRight: '4px' }} /> Local-first client storage.</span>
            <span><ShieldCheck size={13} style={{ display: 'inline', marginRight: '4px' }} /> No analytics telemetry or ads.</span>
            <Link to="/settings" style={{ color: 'var(--accent-primary)', marginTop: '0.25rem' }}>Export backup or reset data →</Link>
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: 'var(--max-content-width)',
          margin: '0 auto',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          color: 'var(--text-tertiary)',
        }}
      >
        <div>
          © {new Date().getFullYear()} CareerCircuit. Built with honest scoring and guest-first principles.
        </div>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <Link to="/settings">Data Settings</Link>
          <Link to="/onboarding">Edit Preparation Goals</Link>
        </div>
      </div>
    </footer>
  );
};
