# KeepEy Product Flow

## Purpose

This document defines screen flow, user journeys, and product behavior for the Electron App and Web Admin.

Visual styling decisions belong in `docs/DESIGN.md`. Data types belong in `docs/DATA_MODEL.md`. API request and response shapes belong in `docs/API_CONTRACT.md`.

For detailed Return page structure, step transitions, mock visual inspection behavior, and health/photo/result rules, read `docs/RETURN_FLOW.md`.

## Core Screens

### App Intro

- Use a short 3D laptop intro.
- The laptop starts closed, opens, and the camera zooms toward the screen.
- Transition from the 3D screen into the actual home UI.
- The intro should support the product metaphor: a laptop being opened for inspection.
- The intro must not delay the workflow for too long.

### Home

- The home screen centers two large primary actions:
  - Rent on the left.
  - Return on the right.
- These actions should be visually balanced and easy to select.
- The screen should immediately communicate that this is an equipment rent/return tool.

### Rent

- The rent flow should feel simple and low-friction.
- Required inputs:
  - Student number.
  - Laptop number.
- Show clear validation and status feedback.
- Avoid unnecessary steps.

Rent steps:

1. User clicks Rent.
2. User enters a student number.
3. User enters a laptop number.
4. App checks the laptop status through the server.
5. If the laptop is available, create a rent record.
6. Set laptop status to `rented`.
7. Store the student number as the current borrower.

Expected error states:

- Unknown laptop number.
- Laptop already rented.
- Laptop currently repairing.
- Laptop blocked by an unresolved issue.

### Return

Return is the most important workflow.

The flow should make progress visible:

1. Student/laptop verification.
2. Device Health Check.
3. Three required photos.
4. Visual inspection.
5. Final result.

Each step should make the next required action obvious.

Return steps:

1. User clicks Return.
2. User enters a student number.
3. User enters a laptop number.
4. App verifies that the laptop is currently `rented`.
5. App runs Device Health Check before visual photo capture.
6. App uploads health check results.
7. If health check has warnings, continue the return flow but mark the laptop/report for staff review.
8. User captures the required three return photos.
9. App uploads images for visual inspection.
10. App receives visual inspection result.
11. App updates laptop status and shows final guidance.

Return should generally continue even when warnings are found. The app should report issues to Web Admin instead of blocking the user, except for explicitly recoverable visual issues such as tape residue.

### Device Health Check

Present health check results as inspection evidence, not as blame.

Required checks:

- Newly installed apps.
- Windows Defender status.
- Storage status.

Use clear result states:

- Pass.
- Warning.
- Unknown.

Warnings should explain that staff may review the issue.

### Photo Capture

The photo capture flow must clearly guide the user through three required views:

1. Screen open with keyboard and screen visible.
2. Top surface from above with mouse and charger visible.
3. Bottom surface from above.

Each capture screen should include:

- The current step number.
- A concise instruction.
- A visual guide area or framing hint.
- Capture and retake controls.

### Visual Inspection Result

Use three result categories:

- No visible issue found.
- Tape/sticker residue found.
- Damage suspected.

Tape/sticker residue should ask the user to clean and recapture.

Damage suspected should clearly state that the issue was sent to Web Admin for staff review.

### Web Admin

The admin UI should prioritize scan speed.

Staff should quickly see:

- Laptop number.
- Current status.
- Student number when relevant.
- Health warnings.
- Visual inspection issue type.
- Whether action is needed.

Admin details should show evidence first and actions second.

