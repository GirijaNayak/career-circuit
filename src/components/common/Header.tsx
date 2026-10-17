import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Compass,
  Building2,
  BookOpen,
  Layers,
  BarChart3,
  Settings,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  HardDrive,
} from 'lucide-react';
import { getPreferences, savePreferences, subscribeToStorage } from '../../storage/localStorageService';
import { CommandPalette } from './CommandPalette';
import { SyncStatusModal } from './SyncStatusModal';

export const Header: React.FC = () => {
  const [prefs, setPrefs] = useState(getPreferences());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    return subscribeToStorage(() => {
      setPrefs(getPreferences());
    });
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Global Ctrl/Cmd + K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    const currentTheme = prefs.theme;
    let nextTheme: 'light' | 'dark' | 'system' = 'light';
    if (currentTheme === 'light') nextTheme = 'dark';
    else if (currentTheme === 'dark') nextTheme = 'system';
    else nextTheme = 'light';
    const updated = savePreferences({ theme: nextTheme });
    setPrefs(updated);
  };

  return (
    <>
      <header className="site-header" role="banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/" className="header-brand" aria-label="CareerCircuit Home">
            <svg
              className="brand-circuit-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M7 7h3v3H7z" />
              <path d="M14 14h3v3h-3z" />
              <path d="M10 8.5h4v7h-4" />
            </svg>
            <span>CareerCircuit</span>
          </Link>

          <nav className="nav-links" aria-label="Main Navigation">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Compass size={16} aria-hidden="true" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/companies" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Building2 size={16} aria-hidden="true" />
              <span>Companies</span>
            </NavLink>
            <NavLink to="/practice" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BookOpen size={16} aria-hidden="true" />
              <span>Practice</span>
            </NavLink>
            <NavLink to="/interview-prep" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Layers size={16} aria-hidden="true" />
              <span>Interview Prep</span>
            </NavLink>
            <NavLink to="/progress" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BarChart3 size={16} aria-hidden="true" />
              <span>Progress</span>
            </NavLink>
          </nav>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-icon"
            onClick={() => setIsSearchOpen(true)}
            title="Search employers & practice (Cmd/Ctrl + K)"
            aria-label="Search employers and practice"
          >
            <Search size={16} />
          </button>

          <button
            type="button"
            className="guest-sync-pill"
            onClick={() => setIsSyncModalOpen(true)}
            title="Data storage and privacy status"
            aria-label="Guest local storage mode status"
          >
            <span className="status-dot" aria-hidden="true" />
            <HardDrive size={13} aria-hidden="true" />
            <span>Local Storage</span>
          </button>

          <button
            type="button"
            className="btn-icon"
            onClick={toggleTheme}
            title={`Current theme: ${prefs.theme}. Click to switch.`}
            aria-label={`Current theme: ${prefs.theme}. Click to switch theme.`}
          >
            {prefs.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <Link
            to="/settings"
            className="btn-icon"
            title="Settings & Data Management"
            aria-label="Settings and Data Management"
          >
            <Settings size={16} />
          </Link>

          <button
            type="button"
            className="btn-icon mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle mobile menu"
            style={{ display: 'none' }}
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          style={{
            position: 'fixed',
            top: 'var(--header-height)',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '1.5rem',
            zIndex: 35,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <NavLink
            to="/"
            end
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start' }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Compass size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/companies"
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start' }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Building2 size={18} />
            <span>Companies</span>
          </NavLink>
          <NavLink
            to="/practice"
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start' }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <BookOpen size={18} />
            <span>Practice & Drills</span>
          </NavLink>
          <NavLink
            to="/interview-prep"
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start' }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Layers size={18} />
            <span>Interview Prep</span>
          </NavLink>
          <NavLink
            to="/progress"
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start' }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <BarChart3 size={18} />
            <span>Progress & Accuracy</span>
          </NavLink>
          <NavLink
            to="/settings"
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start' }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Settings size={18} />
            <span>Settings & Data Backup</span>
          </NavLink>
        </div>
      )}

      {/* Quick Search Dialog */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Guest Storage Disclosure Modal */}
      <SyncStatusModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} />
    </>
  );
};
