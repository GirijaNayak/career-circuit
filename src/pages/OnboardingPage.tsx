import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Calendar, Clock, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { getAllEmployers } from '../data';
import { generatePreparationPlan } from '../domain/planGenerator';
import { savePreparationPlan, getPreparationPlan } from '../storage/localStorageService';
import { HiringTrack, QuestionDifficulty } from '../types';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const employers = getAllEmployers();
  const existingPlan = getPreparationPlan();

  // Form states
  const [targetRole, setTargetRole] = useState(existingPlan?.targetRole || 'Early-Career Software Engineer');
  const [hiringTrack, setHiringTrack] = useState<HiringTrack>(existingPlan?.hiringTrack || 'campus');
  const [selectedEmployerIds, setSelectedEmployerIds] = useState<string[]>(
    existingPlan?.targetEmployerIds || ['emp-stripe']
  );
  const [skillLevel, setSkillLevel] = useState<QuestionDifficulty>(existingPlan?.skillLevel || 'intermediate');
  const [focusSkills, setFocusSkills] = useState<string[]>(
    existingPlan?.focusSkills || ['Algorithms', 'System Design']
  );
  const [targetDate, setTargetDate] = useState<string>(existingPlan?.targetDate || '');
  const [weeklyHours, setWeeklyHours] = useState<number>(existingPlan?.weeklyHours || 8);

  const allAvailableSkills = [
    'Algorithms',
    'Data Structures',
    'System Design',
    'SQL',
    'Concurrency',
    'Networks',
    'Debugging',
    'Complexity Analysis',
  ];

  const handleToggleEmployer = (id: string) => {
    setSelectedEmployerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSkill = (skill: string) => {
    setFocusSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const plan = generatePreparationPlan({
      targetRole,
      hiringTrack,
      targetEmployerIds: selectedEmployerIds,
      skillLevel,
      focusSkills: focusSkills.length > 0 ? focusSkills : ['Algorithms'],
      targetDate: targetDate || undefined,
      weeklyHours,
    });

    savePreparationPlan(plan);
    navigate('/');
  };

  return (
    <div className="page-container" style={{ maxWidth: '780px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
            Goal Alignment
          </span>
        </div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Build Your Preparation Plan
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
          Calibrate your weekly timeline based on your target hiring track and available study hours. You can skip, edit, or regenerate your plan at any time.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="surface-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Role & Hiring Track */}
        <div className="grid-2">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Target Role Family</label>
            <input
              type="text"
              className="form-input"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Backend Software Engineer, New Grad"
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Hiring Pipeline Track</label>
            <select
              className="form-select"
              value={hiringTrack}
              onChange={(e) => setHiringTrack(e.target.value as HiringTrack)}
            >
              <option value="campus">University Campus Recruitment</option>
              <option value="internship">Summer Internship Pipeline</option>
              <option value="off_campus">Off-Campus Direct Application</option>
              <option value="experienced">Early Career / Junior Lateral</option>
            </select>
          </div>
        </div>

        {/* Target Employers */}
        <div>
          <label className="form-label">Target Employers of Interest</label>
          <p className="form-help" style={{ marginBottom: '0.65rem' }}>
            Select employers to tailor diagnostic recommendations to their publicly verified stage formats:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {employers.map((emp) => {
              const isSelected = selectedEmployerIds.includes(emp.id);
              return (
                <button
                  type="button"
                  key={emp.id}
                  onClick={() => handleToggleEmployer(emp.id)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: isSelected
                      ? '2px solid var(--border-focus)'
                      : '1px solid var(--border-default)',
                    background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                    color: isSelected ? 'var(--accent-text)' : 'var(--text-primary)',
                  }}
                >
                  {emp.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Skill Level & Focus Topics */}
        <div>
          <label className="form-label">Self-Assessed Skill Level</label>
          <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
            {(['beginner', 'intermediate', 'advanced'] as QuestionDifficulty[]).map((lvl) => {
              const isSelected = skillLevel === lvl;
              return (
                <div
                  key={lvl}
                  onClick={() => setSkillLevel(lvl)}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected
                      ? '2px solid var(--border-focus)'
                      : '1px solid var(--border-default)',
                    background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    {lvl}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {lvl === 'beginner' && 'Focus on core syntax, array loops, basic trees'}
                    {lvl === 'intermediate' && 'Standard algorithmic patterns, basic system design'}
                    {lvl === 'advanced' && 'Concurrency, distributed trade-offs, complex graphs'}
                  </div>
                </div>
              );
            })}
          </div>

          <label className="form-label">Priority Skills to Emphasize</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {allAvailableSkills.map((skill) => {
              const isSelected = focusSkills.includes(skill);
              return (
                <button
                  type="button"
                  key={skill}
                  onClick={() => handleToggleSkill(skill)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    border: isSelected
                      ? '1px solid var(--accent-primary)'
                      : '1px solid var(--border-default)',
                    background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                    color: isSelected ? 'var(--accent-text)' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 600 : 500,
                  }}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Interview Date & Weekly Hours */}
        <div className="grid-2">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Target Application / Interview Date (Optional)</label>
            <input
              type="date"
              className="form-input"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
            <p className="form-help">Leave blank for a default 4-week structured ramp.</p>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Available Study Time per Week: {weeklyHours} Hours</label>
            <input
              type="range"
              min="2"
              max="25"
              step="1"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              style={{ width: '100%', marginTop: '0.5rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              <span>2 hrs (Light)</span>
              <span>10 hrs (Standard)</span>
              <span>25 hrs (Intensive)</span>
            </div>
          </div>
        </div>

        {/* Transparent Rationale Notice */}
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
          <strong>Transparency Notice:</strong> CareerCircuit plan recommendations are generated to organize study habits. They are never presented as hiring guarantees or algorithmic hiring predictors.
        </div>

        {/* Submission Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <Link to="/" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Skip for now →
          </Link>

          <button type="submit" className="btn btn-primary btn-lg">
            <Sparkles size={16} />
            <span>Generate Preparation Plan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
