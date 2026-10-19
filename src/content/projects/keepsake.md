---
title: Keepsake, a wearable memory aid for people with Alzheimer's and dementia
tools: [Python, FastAPI, YOLO, CLIP, MediaPipe, Expo, React, TypeScript, Photon Spectrum, Grok API, SQLite, Vercel]
links:
  - label: GitHub
    href: https://github.com/rayhanrinzan/keepsake
  - label: Demo
    href: https://keepsake-demo.vercel.app/
order: 1
---

Built at HackHarvard 2026 with a four-person team for people living with Alzheimer's and dementia, for whom losing everyday things is a daily source of stress. A chest-worn iPhone streams to a laptop that recognizes six everyday items and keeps the last real sighting of each, with a photo. Ask "where are my keys?" and it answers with when it last saw them, what was around them, and the photo. The app keeps to one big microphone button, a caregiver help button, and three levels of help, from listening only when tapped to checking in on its own. My focus was the reminder system and pulling the team's work into one app: when an item you had stays out of view, it texts a gentle iMessage reminder with the photo through Photon Spectrum. The hard part was keeping a worn camera honest, because confusing answers do real harm to this audience. Answers cite only the time and the photo, a CLIP second opinion drops look-alike detections, and reminders are opt-in and checked again just before they're sent.
