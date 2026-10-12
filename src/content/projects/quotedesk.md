---
title: QuoteDesk, a live manufacturing quoting assistant
tools: [Next.js, TypeScript, React, Gemini Live API, Supabase, PostgreSQL, Zod, Vercel]
links:
  - label: GitHub
    href: https://github.com/dcgursoy/quote-desk
  - label: Demo
    href: https://quote-desk-hack.vercel.app/
order: 1
---

Built for Google DeepMind New Agentic Economy 2026 with a three-person team. It turns a buyer's email and engineering drawing into a provisional quote by asking for missing details through Gemini Live. My focus was connecting the voice conversation to the quoting system. The hard part was making spoken answers reliable state changes: schema-defined tool calls pass through server-side validation, version checks prevent conflicting updates, and duplicate-call protection keeps retries from applying an answer twice. Supabase stores the shared specification and event history, while Realtime subscriptions and a polling fallback update the estimator dashboard. Buyers can speak or type, correct earlier answers to trigger deterministic repricing, and request discounts that are flagged for vendor review rather than automatically accepted.
