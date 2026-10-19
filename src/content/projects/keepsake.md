---
title: Keepsake, a wearable memory assistant
tools: [Python, FastAPI, YOLO, CLIP, MediaPipe, Expo, React, TypeScript, Photon Spectrum, Grok API, SQLite, Vercel]
links:
  - label: GitHub
    href: https://github.com/rayhanrinzan/keepsake
  - label: Demo
    href: https://keepsake-demo.vercel.app/
order: 1
---

Built at HackHarvard 2026 with a four-person team as a memory aid. A chest-worn iPhone streams to a laptop that recognizes six everyday items and keeps the last real sighting of each, with a photo. Ask "where are my keys?" and it answers with when it last saw them, a description of what was around them, and the photo. My focus was the reminder system and pulling the team's work into one app: when an item you had stays out of view, it texts a gentle iMessage reminder with the photo through Photon Spectrum. The hard part was keeping a worn camera honest. It can't tell where in a room something is, so answers cite only the time and the photo. A CLIP second opinion drops look-alike detections, and reminders are opt-in, cancelled when the camera is dark or frozen, and checked again just before they're sent. The hosted demo replays real photos from one session.
