---
title: Keepsake, a wearable memory aid for people with Alzheimer’s and dementia
tools: [Python, FastAPI, YOLO, CLIP, MediaPipe, Expo, React, TypeScript, Photon Spectrum, Grok API, SQLite, Vercel]
links:
  - label: GitHub
    href: https://github.com/rayhanrinzan/keepsake
  - label: Demo
    href: https://devpost.com/software/keepsake-df0gmw
order: 1
---

Built at HackHarvard 2026 with a four-person team for people living with Alzheimer's and dementia. A chest-worn iPhone streams to a laptop running a real-time vision pipeline at 5 fps: an open-vocabulary YOLO-World detector alongside two YOLO models we fine-tuned on our own items, a CLIP second opinion that rejects each item's known look-alikes, and MediaPipe hand tracking as evidence of pick-ups and put-downs. A sighting only counts after three detections within a second, so one false frame never becomes a memory. Ask "where are my keys?" and it answers with when it last saw them, a Grok vision description of what was around them, and the photo. My focus was the reminder system, built to help without nagging: when an item you had stays out of view, it sends one gentle iMessage through Photon Spectrum with the item circled in the photo, worded as "last seen", never "you forgot". Per-item and global cooldowns cap how often it can text, replies like "I have it" or "remind me later" settle it, and a reminder is dropped if the camera goes dark or freezes, then checked again just before it's sent. Support scales with the person: High-Assistance mode texts about ten seconds after any steady sighting goes out of view, Everyday mode waits minutes and acts only on a confirmed put-down, and the app's three help levels range from listening only when tapped to checking in on its own.
