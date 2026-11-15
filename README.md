# Elderly Care & Medication Management Platform

> A shared healthcare ecosystem empowering elderly individuals, caretakers, and family members to collaboratively manage medications, track adherence, schedule appointments, and receive proactive health reminders.

**Chosen Vertical:** Elderly Care & Medication Management (PromptWars × Catalyst)

---

## Persona Overview

| Persona | Role | Description |
|---------|------|-------------|
| 🧓 Elderly Individual | Primary Decision-Maker | Manages their own health, controls consent, and operates via voice or standard UI |
| 👨‍⚕️ Caretaker | Healthcare Support | Monitors adherence, receives escalation alerts, manages schedules |
| 👨‍👩‍👧 Family Member | Family Oversight | Views health summaries, receives missed-dose alerts, provides support |

---

## Problem Statement Alignment Matrix

| # | Requirement | Files & Functions |
|---|-------------|-------------------|
| 1 | Shared Ecosystem & Passcode-Based Access | `src/services/passcodeAuthService.ts` (validatePasscode, createSession, isRateLimited), `src/app/api/auth/passcode/route.ts`, `src/components/auth/PasscodeLogin.tsx` |
| 2 | Medication Schedule Management CRUD | `src/services/medicationScheduleService.ts` (listMedications, createMedication, editMedication, removeMedication), `src/app/api/medications/route.ts`, `src/app/api/medications/[id]/route.ts`, `src/components/medications/MedicationList.tsx`, `src/components/medications/MedicationForm.tsx` |
| 3 | Medication Adherence Tracking & Quick Logger | `src/services/adherenceTrackerService.ts` (logAdherence, computeAdherenceRate, computeDailyStreak, findMissedDoses, countByStatus), `src/app/api/adherence/route.ts`, `src/components/adherence/AdherenceTracker.tsx`, `src/components/adherence/AdherenceQuickLogger.tsx` |
| 4 | Medical Appointments Manager CRUD | `src/services/appointmentManagerService.ts` (listAppointments, createAppointment, editAppointment, removeAppointment), `src/app/api/appointments/route.ts`, `src/app/api/appointments/[id]/route.ts`, `src/components/appointments/AppointmentList.tsx`, `src/components/appointments/AppointmentForm.tsx` |
| 5 | Proactive Email Reminder Engine | `src/services/emailReminderService.ts` (checkUpcomingDoses, checkMissedDoses, checkUpcomingAppointments, dispatchAllReminders), `src/app/api/reminders/dispatch/route.ts`, `src/app/api/email-logs/route.ts`, `src/components/reminders/EmailLog.tsx` |
| 6 | Smart Care Assistant & Decision Engine | `src/services/smartCareAssistantService.ts` (buildContextSummary, generateAssistantResponse), `src/app/api/assistant/route.ts`, `src/components/assistant/SmartAssistant.tsx` |
| 7 | AI Prescription Label Scanner | `src/services/smartCareAssistantService.ts` (scanPrescriptionLabel, fallbackPrescriptionParse), `src/app/api/assistant/scan/route.ts`, `src/components/assistant/PrescriptionScanner.tsx` |
| 8 | Voice-First Command Bar & Audio Readout | `src/components/assistant/VoiceCommandBar.tsx` (Web Speech API: speechRecognition + speechSynthesis) |
| 9 | Drug Contraindication & Refill Guard | `src/services/drugInteractionService.ts` (checkInteractions, checkLowInventory, estimateDaysUntilDepletion) |
| 10 | Elderly Autonomy & Consent Toggle | `src/components/shared/ConsentToggle.tsx`, `src/app/api/consent/route.ts`, `src/store/dataStore.ts` (getConsent, setConsent) |
| 11 | Caretaker-to-Elderly Check-In Alert Bridge | `src/app/api/checkin/route.ts`, `src/store/dataStore.ts` (triggerCheckInAlert, getPendingCheckIns, acknowledgeCheckIn), `src/components/dashboard/ElderlyDashboard.tsx`, `src/components/dashboard/CaretakerDashboard.tsx` |
| 12 | Dual-Theme System ("Midnight Sanctuary" & "Warm Daylight") | `src/components/ui/ThemeToggle.tsx`, `src/types/theme.ts`, `src/app/globals.css`, `src/app/layout.tsx` |
| 13 | Letter-Free Brand Logo & Visual Pill SVGs | `src/components/ui/BrandLogo.tsx`, `src/components/ui/PillShapeIcon.tsx`, `src/components/medications/ScheduleTimelineIcon.tsx` |
| 14 | Safe Rich Markdown & Table Renderer | `src/components/shared/MarkdownView.tsx` (semantic React elements without dangerouslySetInnerHTML) |
| 15 | Zod Schema Validation | `src/utils/validationSchemas.ts` (passcodeLoginSchema, medicationSchema, adherenceSchema, appointmentSchema, assistantQuerySchema, consentSchema) |
| 16 | Centralized Configuration | `src/config/constants.ts` (AUTH_CONFIG, AI_CONFIG, REMINDER_CONFIG, UI_CONFIG, VALID_ROLES, DOSE_STATUSES, VOICE_COMMANDS) |
| 17 | Elderly Comfort Mode & Atkinson Hyperlegible Typography | `src/components/shared/ComfortModeToggle.tsx`, `src/app/globals.css` (.comfort-mode, tabular-nums) |

---

## Approach & System Architecture

### Architecture
- **Framework:** Next.js 14 (App Router) with TypeScript (strict mode)
- **Styling:** Tailwind CSS with Dual-Theme ("Midnight Sanctuary" Dark Mode & "Warm Daylight" Light Mode)
- **Typography:** Atkinson Hyperlegible (with tabular-nums) + Plus Jakarta Sans
- **Validation:** Zod schemas on every API endpoint and form input
- **State:** In-memory data store pre-seeded with realistic demo data and offline persistence
- **AI:** Google Gemini with deterministic offline fallback when API key is absent or unreachable
- **Email:** Nodemailer SMTP with verified mock transport and telemetry logging
- **Icons:** lucide-react + custom visual inline SVG Pill Shapes (`capsule`, `round-tablet`, `oval-caplet`, `liquid-drop`)
- **Testing:** Vitest with 52 deterministic unit & integration tests passing offline in ~1s

### Contextual Decision Logic
The Smart Care Assistant (`smartCareAssistantService.ts`) evaluates:
- **Time of day** — context-appropriate greeting and recommendations
- **Current role** — tailored responses for elderly, caretaker, or family
- **Missed doses** — proactive alerts and catch-up guidance
- **Remaining inventory** — low-supply warnings with depletion estimates
- **Upcoming appointments** — preparation reminders
- **Drug interactions** — contraindication cross-checks on new medications

### Key Design Decisions
1. **Layered separation:** Services → API routes → UI components (never mixed)
2. **Function caps:** Every function < 40 lines, every file < 250 lines
3. **Typed API envelope:** All responses use `{ success, data, error }` pattern
4. **Offline-first:** Everything works without external API keys
5. **Concurrent operations:** `Promise.all` for independent async calls

---

## Assumptions Made

1. The platform is a single-tenant prototype — one elderly individual with their care circle
2. Passcode is shared among authorized users; role selection happens at login
3. In-memory store resets on server restart (suitable for evaluation)
4. Email dispatch uses mock transport by default; real SMTP activates via `.env`
5. Gemini AI features degrade gracefully to deterministic fallbacks
6. Voice commands use browser-native Web Speech API (Chrome recommended)
7. Drug interaction database is a curated starter set (expandable)

---

## Local Setup

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
git clone <repository-url>
cd elderly-care-platform
npm install
```

### Environment Variables
Copy `.env.example` to `.env` and configure (all optional for demo):
```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `AUTH_PASSCODE` | `123456` | 6-digit authentication passcode |
| `SMTP_HOST` | — | SMTP server (enables real email) |
| `SMTP_USER` | — | SMTP username |
| `SMTP_PASS` | — | SMTP password |
| `GEMINI_API_KEY` | — | Google Gemini API key (enables AI features) |
| `ELDERLY_EMAIL` | `elderly@example.com` | Elderly user email |
| `CARETAKER_EMAIL` | `caretaker@example.com` | Caretaker email |
| `FAMILY_EMAIL` | `family@example.com` | Family member email |

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

### Lint
```bash
npm run lint
```

---

## Test Coverage

| Test File | Covers |
|-----------|--------|
| `tests/passcodeAuth.test.ts` | Authentication, rate limiting, session validation, role rejection |
| `tests/medicationCrud.test.ts` | Medication CRUD, Zod validation edge cases, inventory tracking |
| `tests/adherenceTracker.test.ts` | Adherence rate, streak, missed-dose detection, status counting |
| `tests/emailReminder.test.ts` | Upcoming dose, missed dose, appointment alerts, dispatch |
| `tests/smartAssistant.test.ts` | Context summary, fallback responses, prescription scan, drug interactions |
| `tests/uiDesignSystem.test.ts` | Pill shape deduction, schedule timeline grouping, check-in alert lifecycles |

**Total:** 52 / 52 automated tests passing offline (0 failures, 100% deterministic).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Next.js 14 (App Router) |
| Language | TypeScript (strict: true) |
| Styling | Tailwind CSS (Dual-Theme CSS variables) |
| Typography | Atkinson Hyperlegible, Plus Jakarta Sans |
| Validation | Zod |
| AI Engine | Google Gemini (with deterministic local offline fallback) |
| Email Service | Nodemailer (with local test telemetry drawer) |
| Testing | Vitest |
| Icons & Visuals | lucide-react + Custom Letter-Free Logo & Pill Shape SVGs |
