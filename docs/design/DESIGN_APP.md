# Electron App Design Profile

## Purpose

This file defines the UI/UX profile for the KeepEy Electron App.

The Electron App is used by students and staff to rent laptops, return laptops, run Device Health Check, capture return photos, and receive return guidance.

Use shared visual tokens from `docs/design/DESIGN_TOKENS.md`.

## Desired Feeling

The Electron App should feel:

- Guided.
- Simple.
- Student-friendly.
- Low-stress.
- Approachable.
- Operational.
- Clear.

It should feel like a guided campus service tool, not a SaaS landing page and not a playful educational game.

## Layout Rules

- Keep one main task per screen.
- Prefer short step-by-step screens.
- Use generous spacing.
- Keep labels and instructions short.
- Put the next primary action in an obvious position.
- Avoid dense tables.
- Avoid dashboard-like layouts.
- Avoid marketing sections, feature blocks, testimonials, or decorative hero copy.

## Home Screen Rules

- Center two large primary actions:
  - Rent on the left.
  - Return on the right.
- Make both actions visually clear and balanced.
- Use the home screen as a task launcher, not a landing page.
- Keep supporting text minimal.
- If showing laptop identity or environment context, keep it secondary to the two actions.

## Rent Flow UI

- Ask for student number and laptop number with simple labels.
- Use clear input validation close to the field.
- Keep the flow low-friction.
- Show status feedback after the laptop is marked `rented`.
- Avoid extra setup screens unless required by the product flow.

## Return Flow UI

- Show visible progress through:
  1. Student/laptop verification.
  2. Device Health Check.
  3. Photo capture.
  4. Visual inspection.
  5. Final result.
- Make the current step obvious.
- Keep warnings neutral and non-accusatory.
- Let the user continue when the issue is only a review warning.
- Only request recapture for recoverable issues such as tape residue.

## Photo Capture UI

- Make each required photo angle very clear.
- Show the current capture step number.
- Use a framing area or visual guide when practical.
- Provide obvious capture and retake controls.
- Use concise instructions:
  - Screen open with keyboard and screen visible.
  - Top surface from above with mouse and charger visible.
  - Bottom surface from above.
- Avoid technical model language in capture instructions.

## Form and Input Behavior

- Use visible labels, not placeholder-only labels.
- Show errors near the related field.
- Keep student number and laptop number inputs prominent.
- Disable submit buttons while async work is running.
- Show loading and success states after submission.

## Button Behavior

- Prefer large primary buttons for the main task.
- Use clear hover, focus, pressed, disabled, and loading states.
- Primary buttons should be easy to hit and visually stable.
- Do not shift layout on hover or press.
- Secondary actions should be visually quieter.

## Status and Feedback UI

- Use friendly but precise messages.
- Status feedback should explain what happened and what the user should do next.
- Use status tokens from `docs/design/DESIGN_TOKENS.md`.
- Pair status color with labels and icons where useful.
- Never imply automatic student responsibility or payment.

## Animation and 3D Intro Rules

- The 3D laptop intro should be short.
- The laptop starts closed, opens, and the camera zooms toward the screen.
- Transition into the real home UI with a smooth crossfade or spatially coherent transition.
- The intro should support the inspection metaphor.
- Do not let the intro slow down repeated workflows.
- Screen transitions should feel guided and calm.
- Respect reduced-motion preferences.

## What to Avoid

- Dense admin tables.
- Dashboard-heavy layouts.
- Marketing landing page sections.
- Playful game-like visuals.
- Overly dramatic sci-fi scanning effects.
- Long paragraphs.
- Technical blame-oriented copy.
- Automatic responsibility or payment language.



