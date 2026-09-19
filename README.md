 # Orbit

A mobile-first tracker for every opportunity you're waiting to hear back 
from — job applications, internships, scholarships, and competitions — 
built for **HackDevengers 2.0**.

**Live app:** https://theorbit.lovable.app

## The problem

Students juggle applications across a dozen tabs, emails, and portals, 
with no single place to see what's due next or which ones have gone 
silent. Deadlines get missed and follow-ups get forgotten simply because 
nothing is tracked in one place.

## What Orbit does

- Log any opportunity — job, internship, scholarship, or competition — 
  with its deadline, status, and organization
- Dashboard sorted by soonest deadline, with a quiet visual cue for 
  anything due within 3 days
- **Urgency pill** — deadlines within 24 hours are flagged clearly so 
  nothing slips through at the last minute
- **Follow-up nudges** — flags any application marked "Applied" with no 
  update in 14+ days, so ghosted applications don't get forgotten
- **Add to Calendar** — one tap adds a deadline straight to Google 
  Calendar
- Stats view — total applied, response rate, average wait time
- No login required — works instantly, no sign-up friction

## Tech stack

Built with [Lovable](https://lovable.dev) — React + TypeScript, with data 
persisted directly to a database, no backend setup required.

## Running locally

```sh
git clone https://github.com/h15enberg/theorbit.git
cd theorbit
npm i
npm run dev
```

## Design approach

Deliberately minimal and mobile-first — a muted, editorial-style UI 
(quiet colors, thin borders, typography-led) rather than a typical 
colorful SaaS dashboard, so the focus stays on the deadlines that matter.
