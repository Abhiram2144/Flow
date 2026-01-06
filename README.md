🌊 Flow — Features
🧭 Core Philosophy

Flow is a mobile-first personal finance app that helps users understand their financial momentum, not just their numbers.
It combines deterministic logic, lightweight ML, and explainable AI to reflect the user’s current state through a weather-based interface.

✨ Key Features
1. Bank Statement Bootstrapping (Day-One Value)

Upload bank statements (CSV / PDF) to initialise Flow instantly

Learns historical spending patterns and rhythm, not item-level details

Past data is used only to suggest baselines, never to enforce behaviour

2. Real-Time Transactions (Present Overrides Past)

Manual transaction entry for live spending

Real-time inputs always override historical assumptions

Keeps Flow aligned with the user’s actual day-to-day behaviour

3. Receipt Upload & Intent Confirmation

Upload receipts via camera or image picker

OCR + rule-based parsing (no black-box AI)

Confirms what a transaction was for to improve confidence

Receipt data is optional and privacy-first

4. Merchant Pattern Intelligence

Builds merchant profiles automatically

Detects:

recurring merchants

spending intervals (e.g. weekly essentials)

typical spend ranges

Infers need duration (e.g. groceries last ~7 days)

5. Need Fulfilment Detection

Tracks whether essential needs are likely fulfilled

Enables insights like:

“This week’s essentials are probably covered”

Uses explainable rules, not guesswork

6. Financial Momentum Engine

Computes a continuous momentum score

Considers:

time remaining

spending pace

fulfilled vs pending needs

Focuses on flow rather than strict budgeting

7. Weather-Based UI States 🌤️🌧️⛈️

Flow reflects momentum emotionally through weather:

Sunny / Clear Night → Within limits, smooth flow

Cloudy → Approaching limits, awareness needed

Rain → Slightly over limit, slow down

Thunderstorm → Far beyond limit, stabilisation mode

The UI atmosphere changes gradually — no sudden alarms.

8. Explainable AI by Design

Every insight is backed by:

observation

detected pattern

inference

confidence level

No hidden decisions

Users can always understand why Flow says something

9. Lightweight Machine Learning (Assist-Only)

ML is used only to improve perception:

Weekly behaviour clustering

Anomaly detection for unusual spending

Confidence calibration

ML never:

predicts exact future spending

enforces budgets

communicates directly with the UI

10. LLM-Powered Narrative (Optional, Controlled)

LLM is used only for text generation

Converts structured system state into human-friendly language

One-way flow:

system → LLM → UI

No raw data access, no decision authority

11. Privacy-First Architecture

Local device storage as primary data store

Optional backend sync for derived insights only

No requirement to upload raw receipts or statements

User stays in control at all times

12. Mobile-First Experience

Built with Expo (React Native)

Designed for:

quick receipt capture

fast manual entry

calm, glanceable insights

Optimised for real-life usage, not dashboards

🛠️ Tech Stack (High-Level)

Frontend: Expo (React Native, TypeScript)

Backend: FastAPI (Python)

ML: Rules + statistics + lightweight ML (scikit-learn)

AI (LLM): Narrative layer only (explainability)

Storage: Local-first, optional backend sync

🚧 Project Status

Flow is currently under active development.
The system architecture is finalised, and implementation is in progress.