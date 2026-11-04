# Phase 2 Research: Frontend Framework Setup, Design Tokens & Mobile Responsive Architecture

## 1. Executive Summary
Phase 2 translates the visual specifications from Figma into modular, reusable React 19 components styled with Tailwind CSS. The primary design challenge is creating a mobile-first user experience that feels like a native mobile app on handheld devices while elegantly presenting a simulated mobile phone chassis on desktop screens.

## 2. Technical Decisions & Findings

### 2.1 Tailwind CSS Integration with React 19 and Vite
- Using `@tailwindcss/vite` provides native Vite integration without PostCSS overhead.
- In `Frontend/src/index.css`:
  ```css
  @import "tailwindcss";

  @theme {
    --color-brand-primary: #3866f2;
    --color-brand-active: #2b52d4;
    --color-brand-complete-bg: #ebf2fe;
    --color-brand-complete-text: #3866f2;
    --color-brand-pending-bg: #fdebeb;
    --color-brand-pending-text: #ef4444;
  }
  ```
- This guarantees uniform color consistency across cards, buttons, badges, and progress indicators.

### 2.2 Responsive Mobile Shell Architecture
- To satisfy both the assessment ("mobile UI for the app, based on the Figma") and reviewers evaluating on desktop browsers:
  - Outer Wrapper (`min-h-screen bg-slate-100 flex justify-center items-start sm:py-8`):
    - Desktop: Provides neutral slate backdrop and centers a `max-w-[420px]` container with rounded corners (`rounded-[36px]`), subtle border (`border border-slate-200`), and drop shadow (`shadow-2xl`).
    - Mobile (`< 640px`): Expands to `w-full min-h-screen rounded-none shadow-none` for seamless native mobile browsing.
  - Inner Screen: `relative flex flex-col min-h-full bg-white pb-24` (with bottom padding accommodating the floating action button).

### 2.3 Date Strip Algorithm
- In Figma Frame 2, the horizontal date strip displays the 7 days of the active week.
- For maximum usability:
  - Generate the 7 days starting from Monday through Sunday (or Sunday to Saturday) based on the active reference date.
  - Each item renders:
    - Day abbreviation (e.g. `Mon`, `Tue`, `Wed`)
    - Day number (e.g. `10`, `11`, `12`)
    - Active state: Blue pill (`bg-[#3866F2] text-white`) with a small white dot below.
    - Inactive state: Subtle gray text (`text-slate-400 hover:text-slate-700`).
  - Clicking any day immediately updates the selected day state.

### 2.4 Weekly Summary Cards & Progress Calculation
- Summary cards require high visual fidelity:
  - Complete card:
    - Background: `#EBF2FE`
    - Icon badge: Blue square with checkmark icon
    - Primary metric: Large bold integer (e.g. `50`)
    - Label: "Task Complete"
    - Subtitle: "This Week"
  - Pending card:
    - Background: `#FDEBEB`
    - Icon badge: Salmon square with clock/alert icon
    - Primary metric: Large bold integer (e.g. `08`)
    - Label: "Task Pending"
    - Subtitle: "This Week"
- Weekly Progress Bar:
  - Rounded track with height `h-3.5` or `h-4`.
  - Background track: `#E2E8F0` / `#EEF2FF`.
  - Active fill: `#2B52D4` with smooth width transition (`transition-all duration-500 ease-out`).
  - If `total === 0`, render 0% fill with an empty indicator.

### 2.5 Navigation & Onboarding Persistence
- Simple, robust screen routing via React state:
  ```typescript
  type Screen = 'onboarding' | 'home';
  ```
- On initial load:
  - Check `localStorage.getItem('has_onboarded')`.
  - If `'true'`, default to `'home'`.
  - If not set, display `'onboarding'`.
  - Tapping "Get Started" sets `localStorage.setItem('has_onboarded', 'true')` and switches to `'home'`.
  - Allow an option (e.g. from header settings) to reset or revisit onboarding.
