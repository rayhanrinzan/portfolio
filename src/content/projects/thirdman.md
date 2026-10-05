---
title: ThirdMan, an AI football tactics sandbox
tools: [Next.js, TypeScript, React, SVG, Motion, Zod, OpenAI API, Vercel]
links:
  - label: GitHub
    href: https://github.com/rayhanrinzan/thirdman
  - label: Demo
    href: https://thirdman-one.vercel.app/
order: 2
---

Ask it a tactics question in plain language and it animates the answer on an editable 22-player pitch. The hard part was the simulation engine behind the model's structured output: it models how defenders react, checks passing lanes and interceptions, and searches for supporting runs. Playback is deterministic, with pause, scrubbing and replay, plus opponent-response comparisons and undo/redo. It still works in full when the AI service is unavailable.
