# Phase 2 Context: Frontend Core UI & Design System

## 1. Scope & Objective
Phase 2 establishes the mobile-first frontend foundation using React 19, TypeScript, and Tailwind CSS. It delivers a pixel-faithful reproduction of the Figma visual design, including the responsive mobile container frame, the Onboarding screen, the 7-day calendar strip selector, the weekly summary cards, and the weekly progress indicator.

## 2. Requirements Mapped to this Phase
- **REQ-UI-01**: Onboarding Screen matching Figma Frame 1 (`onboarding-bg.png`, title, subtitle, "Get Started" CTA, `localStorage` flag).
- **REQ-UI-02**: Home Screen structural layout (top search bar, header icons, calendar strip, summary cards, progress bar, section headers, FAB `+` button).
- **REQ-UI-05**: Responsive mobile-first layout (full-screen mobile viewport on mobile devices, centered simulated mobile container with subtle drop-shadow on desktop browsers).
- **REQ-WEEK-02**: Task Summary Cards ("Task Complete" with checkmark icon and "Task Pending" with clock/cross icon, each displaying weekly counts and "This Week" subtitle).
- **REQ-WEEK-03**: Weekly Progress Bar (visual percentage display reflecting completed vs total tasks for the week).
- **REQ-WEEK-04**: 7-Day Date Strip Selector (horizontal day picker with day-of-week abbreviation, date number, and blue pill active indicator with white dot).

## 3. Visual Design Tokens (from Figma)
- **Primary Accent / CTA**: `#3866F2` (Deep vibrant blue)
- **Active Selection**: `#2F58D6`
- **Complete Card Background**: `#EBF2FE` (Soft pastel blue)
- **Complete Icon / Badge**: `#3866F2`
- **Pending Card Background**: `#FDEBEB` (Soft salmon / blush red)
- **Pending Icon / Badge**: `#F87171`
- **App Canvas Background (Desktop)**: `#F1F5F9` (Slate 100)
- **Mobile Container Surface**: `#FFFFFF`
- **Text Headings**: `#0F172A` (Slate 900)
- **Text Muted / Subtitles**: `#64748B` (Slate 500)
- **Border / Divider**: `#E2E8F0` (Slate 200)

## 4. Component Architecture
```text
Frontend/src/
├── assets/
│   ├── onboarding-bg.png       # Figma onboarding hero graphic
├── components/
│   ├── layout/
│   │   ├── MobileContainer.tsx # Responsive shell (centered on desktop, 100% on mobile)
│   │   └── Header.tsx          # Settings, search bar, notifications
│   ├── onboarding/
│   │   └── OnboardingScreen.tsx # Screen 1 with CTA & persistent state
│   ├── home/
│   │   ├── DateStrip.tsx       # 7-day weekly calendar picker
│   │   ├── SummaryCards.tsx    # "Task Complete" & "Task Pending" cards
│   │   └── ProgressBar.tsx     # "Weekly Progress" indicator
│   └── ui/
│       └── FloatingActionButton.tsx # Bottom center '+' button
├── types/
│   └── task.ts                 # Shared frontend TypeScript interfaces
├── utils/
│   └── date.ts                 # Frontend date helpers matching backend conventions
├── App.tsx                     # Screen router (Onboarding vs Home)
└── index.css                   # Tailwind CSS styling and theme tokens
```

## 5. Scope Fences
- **In Scope**:
  - Tailwind CSS integration and theme configuration.
  - Lucide icons setup.
  - MobileContainer shell with desktop simulator frame.
  - Onboarding Screen with navigation and `localStorage` persistence.
  - Dynamic Date Strip selector generating current week days.
  - Summary cards and weekly progress bar with props and mock/state bindings.
  - Floating Action Button and empty "Tasks Today" placeholder layout.
- **Out of Scope (Deferred to Phase 3 & 4)**:
  - Add/Edit task bottom sheet modal and form logic (Phase 3).
  - Swipe-to-delete touch gestures and task list row interactions (Phase 3).
  - Search view Screen 4 (Phase 3).
  - Live backend API fetching and TanStack Query / Axios client sync (Phase 4).

