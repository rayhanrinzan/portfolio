---
title: FirstTouch, arcade 4v4 football in first person
tools: [Three.js, JavaScript, WebGL, Web Audio API, game physics, game AI]
links:
  - label: GitHub
    href: https://github.com/rayhanrinzan/firsttouch
  - label: Demo
    href: https://firsttouch-henna.vercel.app
order: 2
---

A first-person 4v4 football game that runs in the browser: bend curlers around the keeper in slow motion, double jump into headers, catch the ball mid-air in bullet time and fire knuckle-ball super shots. The hard part was the ball physics, written from scratch with no physics engine: ballistic flight with air drag, spin-based curve and knuckle-ball wobble, and bounces off walls, posts and nets, with fast shots substepped up to 8 times a frame so they can't tunnel through posts or players. Passes are lofted with a closed-form solve for gravity and drag, so they land where they're aimed, and teammates iterate on where you'll be when the ball arrives to lead passes onto your run. Each bot runs a state machine (carry, shoot, pass, cross, chip, chase, support), and the keepers position, dive, rush out and can be fooled by curl. It is a single HTML file with no image or model assets; the pitch, players and crowd are generated in code, and every sound is synthesized live with Web Audio.
