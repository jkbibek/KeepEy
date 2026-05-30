# KeepEy Project Instructions

## Project Purpose

KeepEy is an Electron-based campus laptop rent and return inspection system.

Build two connected surfaces:

1. Electron App for students/staff to rent and return laptops.
2. Web Admin for staff to monitor laptop status and inspect reported issues.

The central product flow is:

- Rent: student number + laptop number -> mark laptop as rented.
- Return: student number + laptop number -> run device health check -> capture 3 required photos -> run visual inspection -> mark laptop available or issue_found.
- Admin: show each laptop's status: available, rented, issue_found, or repairing.

The app must not automatically blame students or decide payment responsibility. AI and health checks only provide evidence for staff review.

## Collaboration Rule

This project may be edited by multiple Codex sessions. Before editing, inspect the current files. Do not overwrite unrelated changes. Prefer small, scoped changes and keep shared contracts stable.

## Reference Docs

- Product flow, screen behavior, and user journey work: read `docs/FLOW.md`.
- Detailed Return workflow work: read `docs/RETURN_FLOW.md`.
- Web Admin structure and inventory/log pages: read `docs/WEB_ADMIN.md`.
- UI/UX and visual design work: read `docs/design/DESIGN.md`.
- Data model, status, and entity work: read `docs/DATA_MODEL.md`.
- API, client/server integration, and mock backend work: read `docs/API_CONTRACT.md`.

## Design Harness

For any UI, layout, visual style, component, or user-facing screen change, start with `docs/design/DESIGN.md`.

Always read the shared foundation:

- `docs/design/DESIGN_TOKENS.md`

Then read the surface-specific design profile:

- Electron App UI work: `docs/design/DESIGN_APP.md`
- Web Admin UI work: `docs/design/DESIGN_ADMIN.md`

For reusable components used by either surface, also read:

- `docs/design/COMPONENT_RULES.md`

Use the shared Expo-inspired token system for visual consistency. The Electron App and Web Admin should feel connected, but not identical.

## Project Summary

KeepEy is a campus laptop rental and return inspection system.

The goal is to protect both school assets and students by recording objective rent/return evidence. The product must avoid language that implies automatic blame or automatic payment responsibility. AI and health checks are inspection aids; final decisions belong to school staff.

The MVP has two connected surfaces:

- Electron App: used for rent, return, device health checks, photo capture, and return result guidance.
- Web Admin: used by staff to monitor laptop status, see issue reports, and move devices into repair or available states.

## Core Product Flow

### App Launch

- Show a short 3D laptop intro.
- The laptop starts closed, opens, the camera zooms toward the screen, then transitions into the app home screen.
- After the intro, show two large centered buttons:
  - Rent on the left.
  - Return on the right.

Do not turn the home screen into a marketing landing page. It should feel like an operational school equipment tool.

### Rent Flow

1. User clicks Rent.
2. User enters a student number.
3. User enters a laptop number.
4. App asks the server for the laptop status.
5. If the laptop is available, create a rent record.
6. Set the laptop status to rented.
7. Store the student number as the current borrower.

Expected error states:

- Unknown laptop number.
- Laptop already rented.
- Laptop currently repairing.
- Laptop currently blocked by an unresolved issue.

For the MVP, student number input replaces login/authentication.

### Return Flow

1. User clicks Return.
2. User enters a student number.
3. User enters a laptop number.
4. App verifies that the laptop is currently rented.
5. App runs Device Health Check before visual photo capture.
6. App uploads health check results.
7. If health check has warnings, continue the return flow but mark the laptop/report for staff review.
8. User captures the required three return photos.
9. App uploads images for visual inspection.
10. App receives visual inspection result.
11. App updates laptop status and shows final guidance.

Return should generally continue even when warnings are found. The app should report issues to Web Admin instead of blocking the user, except for explicitly recoverable visual issues such as tape residue.

## Device Health Check Scope

Only implement these checks for the MVP:

1. Newly installed apps
   - Compare the installed app list at rent/baseline against the installed app list at return.
   - Report apps that did not exist at rent.
   - This is name-based comparison for MVP.

2. Windows Defender status
   - Check whether Defender is enabled.
   - Check whether real-time protection is enabled if possible.
   - Return `ok`, `warning`, or `unknown`.

3. Storage status
   - Check remaining disk space.
   - Recommended warning threshold: less than 20GB free or less than 10% free.

Do not implement full antivirus scanning, malware removal, continuous monitoring, or deep forensic analysis in this MVP.

## Return Photo Capture Scope

After Device Health Check, the app must request three specific photo angles:

1. Open view
   - Laptop screen open.
   - Keyboard and screen visible.

2. Top and accessories view
   - Laptop screen closed.
   - Top surface photographed from above.
   - Mouse and charger visible together.

3. Bottom view
   - Laptop screen closed.
   - Bottom surface photographed.

These photos are uploaded and used for visual inspection.

## Visual Inspection Result Rules

The visual inspection result should use these MVP categories:

- pass
  - No visible issue found.
  - Show a normal-return confirmation message.
  - Set laptop status to available.

- tape_residue
  - Tape or sticker residue detected.
  - Ask the user to remove the residue and capture the return photos again.
  - Ask for recapture after cleaning.
  - Do not immediately mark as a damage case.

- damage_found
  - Scratch, crack, dent, pressure mark, or other damage suspected.
  - Show that the laptop number and issue type were sent to Web Admin.
  - The return can continue, but staff review is required.
  - Set laptop status to issue_found.

Use careful language:

- Good: "Damage is suspected. Staff will make the final review."
- Avoid: "The student is responsible", "Payment is required", or "AI confirmed damage".

## Web Admin Scope

The Web Admin is for staff monitoring and triage.

It must show laptop numbers and current statuses:

- available: available for rent.
- rented: currently rented.
- issue_found: return issue found, staff review required.
- repairing: school-level repair in progress.

Admin should be able to see:

- Laptop number.
- Current status.
- Current or latest student number.
- Health check warnings.
- Visual inspection issue type.
- Return images and heatmap if available.

Admin actions for MVP:

- Mark as available.
- Mark as repairing.
- Keep issue open.

## Technical Direction

Preferred stack:

- Electron app for the main client.
- React UI.
- Tailwind CSS.
- Three.js or react-three-fiber for the intro only.
- Node/Electron main process APIs for local device health checks.
- Web Admin as a web app using the same shared data source.
- Supabase or a simple backend API for shared laptop state, reports, and uploaded images.
- FastAPI or mock endpoint for visual inspection inference.

During early implementation, mock data and mock AI results are acceptable if the UI flow and data contracts are clear.

## MVP Non-Goals

Do not spend MVP time on:

- Full antivirus scanning.
- Virus removal.
- Automatic student blame or payment decisions.
- Native school SSO.
- Support for every equipment category. 
- Complete macOS/Linux health check parity.
- Continuous background monitoring.
- Complex asset inventory workflows beyond laptop status tracking.
- HTML-in-Canvas as a required feature.

## Important Implementation Notes

- Keep the Electron app and Web Admin connected through the same server/data source.
- The laptop number is the central identifier across rent, return, health check, visual inspection, and admin review.
- Health check warnings should be transmitted to Web Admin.
- Visual inspection issues should include laptop number and issue type.
- A normal return should make the laptop available again.
- A serious issue should move the laptop to issue_found until staff changes it to available or repairing.
- A repair state is controlled from Web Admin, not from the student return flow.

