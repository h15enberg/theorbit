# Orbit Tracker

Build a mobile-first web app called "Orbit" — a personal tracker for every 

opportunity a student is waiting to hear back from: job applications, 

internships, scholarships, and competitions.

CORE FUNCTIONALITY

- Add an "opportunity" with: title, organization name, type (Job / 

  Internship / Scholarship / Competition), deadline or expected response 

  date, status (Applied, Interview, Accepted, Rejected, No Response Yet), 

  and an optional note.

- A dashboard/home view listing all opportunities, sorted by soonest 

  deadline first.

- Each item shows how many days remain until its deadline, with a subtle 

  visual distinction for anything due within 3 days (not a loud red alert 

  — just a quiet visual cue like a colored left border or small dot).

- Ability to edit status and delete an opportunity.

- A simple stats view: total applied, how many are still pending, response 

  rate (%), and average days waited for a response.

- Empty state for when no opportunities are added yet — encouraging, not 

  a generic "no data" message.

- No login/auth needed — single-user, all data stored in the database 

  directly, works immediately with no sign-up friction.

DESIGN DIRECTION — READ CAREFULLY, THIS MATTERS MOST

This must NOT look like a typical AI-generated app. Specifically avoid:

- Purple, indigo, or blue gradient backgrounds or buttons

- Glassmorphism, frosted glass, or heavy blur effects

- Glowing shadows or neon accent colors

- Overuse of emoji or generic stock icons in every card

- Bright, saturated, "SaaS landing page" color schemes

Instead, design it like a calm, minimal productivity tool:

- A neutral, muted color palette — off-white or soft warm-grey background, 

  near-black (not pure black) text, and ONE single restrained accent color 

  (a muted teal, forest green, or clay/rust tone — not bright blue or 

  purple) used sparingly, only for primary actions and status indicators.

- Generous white space, clean alignment, no clutter.

- Thin 1px borders instead of heavy drop shadows to separate cards/sections.

- Typography-led design: a distinct serif or editorial-style font for 

  headings, paired with a clean sans-serif for body text and data. Numbers 

  (day counts, stats) should feel precise — tabular/monospaced alignment.

- Rounded corners should be subtle (small radius), not pill-shaped buttons 

  everywhere.

- Status should be shown through small, quiet indicators (a colored dot, 

  a thin left border, or muted badge text) — not loud colored chips.

MOBILE-FIRST REQUIREMENTS

- Design and think through the PHONE layout first, not desktop scaled down.

- Single-column layout by default; content stacks vertically.

- All buttons and tap targets at least 44px tall.

- Input fields large enough to tap easily, font size 16px minimum so 

  mobile browsers don't auto-zoom on focus.

- The "Add opportunity" action should be easy to reach with a thumb — 

  consider a fixed/floating action button at the bottom right, or a 

  clearly placed button at the top of the list.

- If there's a multi-step form (adding an opportunity), keep it to one 

  screen if possible rather than a multi-page wizard.

- On larger screens (tablet/desktop), the layout can expand to a 

  two-column or wider grid — but the mobile view is the priority and 

  should never feel like a cramped desktop layout.

PAGES/VIEWS NEEDED

1. Home/Dashboard — list of all opportunities sorted by deadline urgency

2. Add/Edit opportunity — simple form

3. Stats — small summary view (can be a section at the top of the 

   dashboard rather than a separate page, your call on what feels 

   cleaner on mobile)

Keep the overall feel closer to a minimalist note-taking app or a clean 

personal finance tracker than a typical colorful startup dashboard.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://theorbit.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/66fb4394-e5b5-4838-995c-d854eb774ea3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
