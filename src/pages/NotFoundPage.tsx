import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft, Search, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container" style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--bg-subtle)',
          color: 'var(--text-tertiary)',
          marginBottom: '1.25rem',
        }}
      >
        <HelpCircle size={28} />
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        Page Not Found (404)
      </h1>

      <p style={{ color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto 2rem', fontSize: '0.9375rem', lineHeight: 1.6 }}>
        The requested URL does not match any valid CareerCircuit route or employer profile. Check for typos or use the navigation below to find what you are looking for.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>

        <Link to="/" className="btn btn-primary">
          <Compass size={16} />
          <span>Dashboard Overview</span>
        </Link>

        <Link to="/companies" className="btn btn-secondary">
          <Search size={16} />
          <span>Browse Employers</span>
        </Link>
      </div>
    </div>
  );
};
