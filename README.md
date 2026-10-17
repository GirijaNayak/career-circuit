# CareerCircuit

> Transparent technical interview preparation, verified employer hiring stages, and honest assessment practice for early-career software engineers.

---

## 1. Product Summary

**CareerCircuit** is a free, guest-friendly web platform engineered from scratch for university students, new graduates, and early-career software engineers preparing for technical hiring pipelines.

### Core Principles
1. **Trust & Evidence Transparency:** Clearly distinguishes authoritative employer disclosures, dated community debriefs, and original simulation practice. Every claim about a hiring stage links directly to a source with last-reviewed recency.
2. **Honest Scoring:** Never invents correctness, employer cutoffs, or premature mastery claims. Auto-graded verified questions are kept strictly separated from self-reviewed/rubric responses.
3. **Guest-First & Local Privacy:** 100% of employer research, assessment simulation, preparation planning, and progress tracking runs in the client browser with zero mandatory accounts and no remote tracking cookies.
4. **Resilient Data Mobility:** Full JSON export and schema-validated import (powered by Zod) allowing seamless cross-device migration with atomic merge or replace modes.
5. **Focused Editorial Design:** Built with a refined research aesthetic, calm assessment workspace, accessible typography, high-contrast mode, and reduced-motion support.

---

## 2. Quickstart & Local Installation

### Prerequisites
- **Node.js**: v18.0.0 or later (tested on v22.14.0)
- **npm**: v9.0.0 or later

### Setup Commands

```bash
# 1. Navigate to the project directory
cd career-circuit

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

The application will be live at `http://localhost:5173`.

### Running Production Build & Preview

```bash
# Build optimized production bundle with TypeScript checks
npm run build

# Preview production build locally
npm run preview
```

### Running Automated Test Suite

```bash
# Run all Vitest unit and integration test suites
npm test
```

---

## 3. Implemented Routes & User Journeys

| Route | Feature & Purpose |
| :--- | :--- |
| `/` | **Dashboard:** Next recommended activity, resumable session alert, plan progress, recent attempts, and honest skill trends with sample counts. |
| `/companies` | **Employer Directory:** Multi-faceted search & filter by category, role level, location, evidence category, and recency. Includes side-by-side comparison selection. |
| `/companies/:id` | **Employer Profile:** Sequenced hiring stages timeline, engineering hubs, tech stacks, evidence badges, uncertainty notes, and verified source citations. |
| `/compare` | **Side-by-Side Comparison:** Compares up to 4 employers across locations, tracks, stages, review dates, and evidence ratings. |
| `/practice` | **Assessment Catalog:** Diagnostic tests and simulations filterable by skill, difficulty, and employer association. |
| `/practice/:id/briefing` | **Pre-Assessment Briefing:** Question count, breakdown of auto-graded vs self-reviewed items, evidence disclosure, and timed vs untimed mode selector. |
| `/practice/:id/session` | **Assessment Simulator:** Full testing workspace with question picker, countdown timer with auto-submit, autosave to local storage, review drawer, and confirmation modal. |
| `/practice/:id/results/:attemptId` | **Results & Diagnostic Report:** Distinct auto-graded verified score vs self-reviewed rubric evaluation, question-by-question breakdown, and 1-click drill launch. |
| `/practice/drills` | **Targeted Skill Drills:** Focused practice by skill or missed questions with progressive hint disclosure (Hint 1, Hint 2, Worked Solution). |
| `/interview-prep` | **Interview Preparation Catalog:** 7 interactive modules covering Algorithms & DS, System Design, LLD, OS, Databases, Networks, and Behavioral STAR. |
| `/interview-prep/:moduleKey` | **Interview Module Workspace:** Interactive scenario prompts, structured self-review rubrics, reference solutions, and autosaved candidate notes. |
| `/onboarding` | **Preparation Plan Generator:** Optional, skippable onboarding wizard generating weekly milestones with explainable task rationales. |
| `/plan` | **Roadmap Schedule:** View, reorder, skip, complete, and add custom study goals. |
| `/progress` | **Progress & Accuracy:** Comprehensive attempt history archive and honest skill accuracy breakdown with sample size reliability thresholds. |
| `/settings` | **Settings & Data Management:** JSON backup export, Zod-validated import, local data reset, theme toggle, and optional service configurations. |
| `*` | **Not Found (404):** Error recovery page with direct breadcrumbs and search links. |

---

## 4. Architecture & Technical Decisions

```
career-circuit/
├── src/
│   ├── types/                     # Core TypeScript domain models & backup schemas
│   ├── domain/                    # Pure domain logic (scoring, evidence taxonomy, plan generator, analytics)
│   │   ├── scoring.ts             # Honest scoring engine distinguishing auto vs self-review
│   │   ├── evidence.ts            # Evidence categories metadata, descriptions, badges
│   │   ├── planGenerator.ts       # Deterministic, explainable preparation plan builder
│   │   └── analytics.ts           # Statistical confidence & sample-count calculation
│   ├── data/                      # Structured high-quality seed datasets
│   │   ├── seedEmployers.ts       # Sourced employer profiles (Stripe, Datadog, Bloomberg, etc.)
│   │   ├── seedQuestions.ts       # Question bank covering all 9 question types
│   │   ├── seedAssessments.ts     # Curated diagnostic simulations
│   │   ├── seedInterviewModules.ts# 7 interactive interview prep modules with rubrics
│   │   └── index.ts               # Unified data access and search query interface
│   ├── storage/                   # Local-first persistence & validation
│   │   ├── backupSchema.ts        # Strict Zod schema for versioned import/export
│   │   └── localStorageService.ts # LocalStorage/IndexedDB abstraction with reactive subscriptions
│   ├── services/                  # Typed integration boundaries
│   │   ├── codeExecutionService.ts# Isolated code execution client boundary & security docs
│   │   └── syncService.ts         # Optional cloud sync adapter with local guest status
│   ├── components/                # Accessible design system components
│   │   └── common/                # Header, Footer, EvidenceBadge, CommandPalette, ConfirmDialog, etc.
│   ├── pages/                     # Product feature views
│   ├── styles/                    # Editorial design system tokens, themes, high-contrast, motion
│   └── test/                      # Vitest & Testing Library automated test suite
```

### Evidence Categorization Taxonomy
- **Official Source:** Verified directly via official employer documentation, company engineering blogs, or verified recruiter communications.
- **Community Reported:** Aggregated candidate debriefs, forum reports, and community compilations. Subject to regional and seasonal variations.
- **Original Practice:** Material developed specifically for CareerCircuit to evaluate real-world computer science concepts without claiming to be official or leaked exams.
- **Unknown / Unverified:** Insufficient public evidence exists. Clearly labeled so candidates never make false assumptions.

### Scoring Model & Security Architecture
- **Objective Questions (Single-choice, Multi-select, Output Prediction, Complexity Analysis, Debugging):** Automatically verified against explicit answer keys.
- **Short-Answer Questions:** Normalized (trimmed, internal whitespace collapsed, case-insensitive unless specified) against defined accepted variants.
- **SQL Questions:** Evaluated against relational schema fixtures and expected result sets; marked as self-review if unverified.
- **Coding Questions:**
  - **Security Guarantee:** Candidate code is **NEVER executed using browser `eval()`, `new Function()`, or uncontained workers**.
  - **Execution Boundary:** When configured, code is submitted to an isolated container service (2s CPU timeout, 128MB RAM limit, 1 process limit, network disabled).
  - **Honest Fallback:** If no remote execution endpoint is configured, coding questions are explicitly designated as `self_review` / `ungraded`. Full marks are **never** awarded simply because code was typed into the editor.
- **Written Questions:** Evaluated against structured self-review rubrics.

### Data Validation & Import Atomicity
- All exported files include `schemaVersion: 1`, `appVersion: "1.0.0"`, and an ISO export timestamp.
- The entire backup is parsed through a strict **Zod** schema (`UserDataBackupSchema`) before applying any state changes.
- If validation fails, the current workspace is left completely untouched (atomic failure protection).
- Supports both **Merge** (union of bookmarks and attempts) and **Replace** (full restore).

---

## 5. Verification & Test Report

All 32 automated tests pass across 7 dedicated test suites:

```text
✓ src/test/analytics.test.ts (3 tests)
  - returns empty array when there are no submitted attempts
  - marks skills with fewer than 5 attempts as Insufficient Data to prevent false mastery
  - marks skills with >= 10 attempts and >= 80% as Proficient

✓ src/test/scoring.test.ts (6 tests)
  - normalizes short answers by trimming, collapsing spaces, and lowercasing
  - correctly scores single_choice questions with exact match
  - correctly scores multi_select questions requiring exact subset match
  - correctly scores short_answer against accepted variants with normalization
  - never automatically awards full marks for coding questions without a secure evaluator
  - maintains strict separation between auto-graded and self-reviewed points in aggregate results

✓ src/test/employerSearch.test.ts (7 tests)
  - returns all employers when query and filters are empty
  - matches employers by primary name
  - matches employers by known alias
  - matches employers by tech stack keywords
  - matches employers by engineering hub location
  - combines industry category and role level filters
  - retrieves employers by slug or id

✓ src/test/simulator.test.ts (2 tests)
  - restores active in-progress assessment attempt on page refresh
  - finalizes submitted assessment and clears active session

✓ src/test/planGenerator.test.ts (3 tests)
  - generates a 4-week structured plan when no target date is supplied
  - adjusts duration dynamically when a target date is provided
  - updates task completion status cleanly in stored plan

✓ src/test/backupValidation.test.ts (7 tests)
  - validates a fresh export from exportUserData successfully
  - rejects corrupt or malformed JSON strings without throwing
  - rejects backups with missing schemaVersion
  - safely rejects future unknown schema versions
  - rejects backups with invalid field types and pinpoints error path
  - merges data without overwriting existing bookmarks in merge mode
  - replaces all local data in replace mode

✓ src/test/navigation.test.tsx (4 tests)
  - renders official evidence badge with accessible label and text
  - renders community reported evidence badge with warning descriptor
  - renders NotFoundPage with clear navigation recovery controls
  - safely renders untrusted text in EmptyState as text rather than raw HTML
```

---

## 6. Optional Services & Credentials

CareerCircuit requires **zero credentials** for complete offline and local usage. The following integration boundaries are defined and ready for optional backend connection in `Settings`:

1. **Isolated Code Evaluator (`/evaluate`):**
   - Client adapter: `src/services/codeExecutionService.ts`
   - Configurable in `Settings > Integration Boundaries`.
   - Compatible with Judge0 or custom Docker microservices.
   - Defaults to honest self-review mode when unconfigured.
2. **Cloud Sync Service (`/sync`):**
   - Client adapter: `src/services/syncService.ts`
   - Configurable in `Settings > Integration Boundaries`.
   - Defaults to guest local storage mode when unconfigured.

---

## 7. Recommended Next Improvements

1. **In-Browser WebAssembly SQLite Engine:** Integrate `sql.js` (SQLite compiled to WASM) to execute candidate SQL queries in an in-memory client database against real schema fixtures without needing an external backend.
2. **Interactive System Architecture Canvas:** Provide a lightweight, keyboard-accessible block-diagram drawing tool for system design prompts to complement candidate text notes.
3. **Spaced Repetition Flash Drills:** Implement an SM-2 spaced repetition algorithm for questions that candidates previously answered incorrectly or flagged as difficult.
