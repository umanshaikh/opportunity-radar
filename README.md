# OpportunityRadar

> **Find opportunities. Beat deadlines.**

OpportunityRadar is an algorithmic opportunity discovery engine and deadline tracker built specifically for students and early-career builders. It aggregates hackathons, internships, scholarships, competitions, fellowships, college symposiums, and free learning programs into a single radar screen.

---

## Key Differentiators & Highlights

1. **Deterministic 0–100 Match Score (Zero Paid AI Cost):**
   - **40% Interests & Category:** Evaluates exact and semantic interest overlap.
   - **30% Skills & Tech Stack:** Analyzes applicant skills against prerequisites and surfaces *missing skills to prepare*.
   - **20% Academic Eligibility:** Matches education levels to prevent disqualified submissions.
   - **10% Format & Cost:** Respects remote/in-person and stipend preferences.
   - Transparent mathematical breakdown with a strict legal disclaimer that match score is a relevance estimate, not a probability of selection.

2. **Deadline Radar Center:**
   - Unified chronological urgency categorization: **Overdue**, **Due within 24 Hours**, **Due within 3 Days**, **Due this Week (≤ 7 Days)**, and **Later**.
   - Safe date parsing that never fabricates deadline hours when only a calendar date is specified.

3. **Application Pipeline Tracker:**
   - 7 lifecycle states: `Interested`, `Preparing`, `Applied`, `Shortlisted`, `Rejected`, `Completed`, `Withdrawn`.
   - Dual view: **Kanban Board** and **Interactive Data Table**.
   - Note drafts, milestone action tracking, and deadline countdown tags.

4. **100% Free & Open-Source Architecture (₹0 Budget):**
   - Zero paid APIs, no OpenAI or LLM token costs, zero backend server bills.
   - Versioned browser `localStorage` layer with automated schema validation, corrupted data fallback, JSON backup export, and verified JSON import.
   - Decoupled `DataRepository` design ready for a direct plug-in to Supabase PostgreSQL whenever scaling beyond hackathons.

5. **Demo Data Transparency:**
   - All sample listings are visibly tagged `DEMO DATA — NOT A REAL OPPORTUNITY`.
   - Uses safe placeholder URLs (`https://example.com/demo/...`) to prevent deceptive links.

---

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling & Design System:** Tailwind CSS v4
- **Routing:** React Router v7
- **Icons:** Lucide React
- **Persistence:** Versioned `localStorage` with JSON export/import and typed repository abstraction
- **Testing:** Vitest (17 passing unit tests covering matching logic, dates, storage, and repositories)

---

## Project Structure

```
opportunity-radar/
├── public/
│   ├── 404.html               # SPA fallback for static hosting
│   ├── _redirects             # Netlify/Cloudflare SPA rewrite rule
│   └── radar.svg              # Custom radar brand mark
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── ApplicationModal.tsx      # Add/edit tracker status & milestones
│   │   │   ├── ConfirmationModal.tsx    # Accessible confirmation dialogs
│   │   │   ├── MatchBreakdownModal.tsx  # Transparent 4-part score breakdown
│   │   │   ├── OnboardingModal.tsx      # 3-step skippable student setup
│   │   │   └── OpportunityCard.tsx      # Rich opportunity card
│   │   └── layout/
│   │       ├── AppLayout.tsx            # Main shell with responsive drawer
│   │       ├── Sidebar.tsx              # Desktop & drawer navigation
│   │       └── TopBar.tsx               # Header with search & urgent deadline alerts
│   ├── context/
│   │   └── RadarContext.tsx         # Unified state & real-time stats
│   ├── data/
│   │   └── sampleOpportunities.ts   # 12 demo opportunities across all 5 deadline states
│   ├── pages/
│   │   ├── Dashboard.tsx            # KPI stats, recommendations, urgent deadlines
│   │   ├── Deadlines.tsx            # Deadline center grouped by urgency
│   │   ├── Explore.tsx              # Multi-filter search, sorting, load more
│   │   ├── NotFound.tsx             # Friendly 404 page
│   │   ├── OpportunityDetail.tsx    # Deep criteria, eligibility matrix, actions
│   │   ├── Profile.tsx              # Match preferences & live preview
│   │   ├── Saved.tsx                # Saved shortlist with search & remove
│   │   ├── Settings.tsx             # Storage diagnostics, export/import, reset
│   │   └── Tracker.tsx              # Application Kanban & Table pipeline
│   ├── services/
│   │   ├── repository.ts            # DataRepository interface & LocalStorage implementation
│   │   ├── storage.ts               # Versioned storage, JSON export/import, corruption safety
│   │   └── __tests__/
│   │       └── storageAndRepository.test.ts
│   ├── types/
│   │   └── index.ts                 # TypeScript data contracts
│   └── utils/
│       ├── dateUtils.ts             # Date parsing, urgency grouping, badges
│       ├── matching.ts              # Deterministic match algorithm
│       └── __tests__/
│           ├── dateUtils.test.ts    # Date unit tests
│           └── matching.test.ts     # Match engine unit tests
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites
- Node.js `v18+` or `v20+` or `v22+`
- npm `v9+` or `v10+`

### Installation & Development
```bash
# 1. Clone or navigate into the directory
cd opportunity-radar

# 2. Install dependencies
npm install

# 3. Run development server with Hot Module Replacement
npm run dev

# 4. Run automated test suite (Vitest)
npm test

# 5. Build for production
npm run build

# 6. Preview production build locally
npm run preview
```

---

## Running the Automated Test Suite

OpportunityRadar includes comprehensive unit and integration tests. Run:
```bash
npm test
```
**Test Results Summary:**
- `src/utils/__tests__/matching.test.ts`: 6 tests passing (deterministic calculation, empty profiles, missing skills detection, education rank incompatibility, badge thresholds).
- `src/utils/__tests__/dateUtils.test.ts`: 4 tests passing (time detection, date-only parsing, invalid dates tolerance, urgency classifications).
- `src/services/__tests__/storageAndRepository.test.ts`: 7 tests passing (repository operations, save/unsave toggle, pipeline status updates, JSON export, verified schema import, corrupted storage fallback).

---

## Free Static Hosting Deployment Guide

OpportunityRadar is built as a static Single Page Application (SPA). It can be deployed to any free static hosting tier with **₹0 recurring expenses**.

### Option 1: Vercel (Recommended)
1. Push your repository to GitHub.
2. Sign in to [vercel.com](https://vercel.com) (Hobby Free Tier).
3. Click **Add New Project** and select your `opportunity-radar` repository.
4. Framework Preset: **Vite**.
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**. Vercel provides free HTTPS and automated global edge CDN.

### Option 2: Netlify
1. Sign in to [netlify.com](https://netlify.com) (Free Starter Tier).
2. Choose **Deploy with GitHub**.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. The included `public/_redirects` file automatically handles direct URL refreshes without 404s.

### Option 3: GitHub Pages
1. In `vite.config.ts`, set `base: './'`.
2. Push to GitHub and go to **Settings > Pages**.
3. Select **GitHub Actions** and use the standard Vite static deploy workflow.
4. The included `public/404.html` ensures client-side routing works seamlessly.

### Provider Free Tier Limits
- **Vercel Hobby:** 100 GB bandwidth/month, unlimited personal projects, ₹0 cost.
- **Netlify Starter:** 100 GB bandwidth/month, 300 build minutes/month, ₹0 cost.
- **GitHub Pages:** 1 GB storage limit, 100 GB bandwidth/month, ₹0 cost.

*Notice: No cloud services were purchased or published during this hackathon development.*

---

## Architecture Overview & Future Supabase Integration

```
[UI Components & Pages]
        │
        ▼
[RadarContext State Provider]
        │
        ▼
[DataRepository Abstraction Interface]
        │
   ┌────┴──────────────────────────┐
   ▼                               ▼
[LocalStorageRepository]     [SupabaseRepository]
(Current MVP Implementation)   (Future Production Scale)
   │                               │
   ▼                               ▼
Browser LocalStorage         PostgreSQL + Row-Level Security
(₹0 cost, offline-first)     (Multi-device sync, Team accounts)
```

The application strictly separates data operations behind `DataRepository`. Switching from localStorage to Supabase only requires implementing the `DataRepository` interface with `@supabase/supabase-js`, without modifying pages or UI components.

---

## Implemented Features vs Known Limitations

### Implemented Features
- [x] Complete interactive dashboard with live application statistics and urgent deadlines.
- [x] Discovery engine (`/explore`) with full-text search, 6 multi-select filters, and 4 sort modes.
- [x] Detailed opportunity views (`/opportunity/:id`) with eligibility matrix and prep checklists.
- [x] Application pipeline tracker (`/tracker`) with dual Kanban and Table views.
- [x] Deadline Center (`/deadlines`) with 5 urgency tiers.
- [x] Deterministic 0–100 matching engine with transparent explanations and missing skill alerts.
- [x] Saved opportunities shortlist (`/saved`) with add/remove persistence.
- [x] Skippable 3-step onboarding flow.
- [x] Versioned localStorage with schema validation, corrupted data fallback, JSON export, and JSON import.
- [x] Reset demo data and full factory reset with accessible confirmation dialogs.
- [x] Clean dark navy aesthetic, electric violet accents, and visible focus accessibility.
- [x] 17 automated tests with 100% pass rate.

### Known Limitations
- **Device-Bound Storage:** In this MVP release, data is saved in browser `localStorage`. Clearing browser cookies will reset local changes (mitigated by the built-in JSON backup export/import).
- **Background Push Notifications:** Operating system background push notifications require a service worker and push notification server. The MVP provides in-app urgent alerts and permission-based browser alert simulation.
- **Live Opportunity Scraping:** To respect the ₹0 budget and avoid unstable web scrapers, opportunities are represented by 12 comprehensive sample records clearly labeled `DEMO DATA`.

---

## Hackathon Presentation Guide

### 8-Step Interactive Demo Path
1. **Open the Dashboard (`/`):**
   - Highlight the clean dark navy & electric violet interface.
   - Point out real-time stats: Saved count, Active tracker items, and Deadlines ≤ 7 days.
2. **Tune Profile Preferences (`/profile`):**
   - Select `Undergraduate` education level, interests in `AI/ML` and `Python`, and add skills `Python` and `React`.
   - Watch the **Live Match Preview** dynamically calculate relevance scores.
3. **Explore Ranked Opportunities (`/explore`):**
   - Observe opportunities sorted by match score.
   - Click on the **Match Score Pill** (e.g., `85% Match · Strong`) to open the **Transparent Match Score Breakdown** showing the exact 4-part weights (40% Interest, 30% Skill, 20% Education, 10% Format) and missing skills to prepare.
4. **Inspect Listing Detail (`/opportunity/demo-opp-01`):**
   - Review the detailed overview, education eligibility matrix (`Satisfied` / `Needs Confirmation`), benefits, and application steps.
   - Note the prominent `DEMO DATA — NOT A REAL OPPORTUNITY` badge and relevance estimate disclaimer.
5. **Save an Opportunity:**
   - Click the **Save** button. Notice the navbar badge instantly increments to reflect the change.
6. **Track an Application in Pipeline (`/tracker`):**
   - Click **Track Opportunity**, set status to `Preparing`, add milestone *"Draft case study by Friday"*, and save.
   - Navigate to `/tracker` and view the Kanban card in the `Preparing` column. Toggle to **List View** to show data density.
7. **Deadline Center Urgency (`/deadlines`):**
   - View opportunities categorized chronologically: Overdue, < 24 Hours, ≤ 3 Days, ≤ 7 Days, and Later.
   - Demonstrate the browser alert test button.
8. **Browser Refresh & Data Export (`/settings`):**
   - Refresh the page to prove 100% persistence across reloads.
   - Open `/settings`, show the storage metrics (KB used, record counts), and download a JSON backup.

---

## 90-Second Hackathon Pitch Script

> **The Problem:**
> *"Every semester, ambitious students miss life-changing internships, hackathons, and research fellowships—not because they weren't qualified, but because application deadlines are scattered across dozens of portals, eligibility rules are buried in PDFs, and finding relevant programs feels like searching for a needle in a haystack."*
>
> **The Solution:**
> *"Introducing OpportunityRadar—Find opportunities. Beat deadlines. OpportunityRadar is an all-in-one discovery radar and application tracker that automatically matches students to top opportunities based on their education level, interests, and technical skills."*
>
> **The Key Differentiator:**
> *"Unlike black-box AI platforms that hallucinate or require expensive API subscriptions, OpportunityRadar uses a 100% transparent, deterministic 0–100 matching formula: 40% interest alignment, 30% skills, 20% academic eligibility, and 10% format preferences. More importantly, it tells students exactly which skills they are missing to help them prepare ahead of time."*
>
> **Technology & Feasibility:**
> *"Built with React 19, TypeScript, Vite, and Tailwind CSS, OpportunityRadar runs entirely on an open-source, ₹0 budget stack with offline-resilient local storage, JSON backup portability, and a decoupled DataRepository architecture ready for Supabase cloud sync."*
>
> **Impact:**
> *"OpportunityRadar turns chaotic bookmark folders into an organized application pipeline, empowering every student to discover their potential and never miss a deadline again."*
