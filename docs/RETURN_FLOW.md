# Return Flow

## Purpose

This document defines the detailed Return workflow for the Electron App.

Use this file when implementing or changing Return pages, Return state transitions, Device Health Check screens, photo capture mockups, visual inspection mockups, or final return guidance.

For visual styling, also read `docs/design/DESIGN.md` and `docs/design/DESIGN_APP.md`.
For API payloads and response shapes, also read `docs/API_CONTRACT.md`.
For status and entity definitions, also read `docs/DATA_MODEL.md`.

## Current MVP Direction

Rent does not require photo capture in the current MVP implementation.

Return is where Device Health Check, photo capture, mock visual inspection, and final issue reporting happen.

The visual inspection model will be implemented by another teammate. Until that integration exists, Return should use deterministic mock results that preserve the same user flow and API boundaries.

## Page Structure

Implement Return as a step-based flow owned by `apps/electron/renderer/src/pages/ReturnPage.tsx`.

Recommended page split:

- `ReturnStartPage.tsx`
- `DeviceHealthCheckPage.tsx`
- `ReturnPhotoGuidePage.tsx`
- `ReturnPhotoCapturePage.tsx`
- `VisualInspectionPage.tsx`
- `ReturnResultPage.tsx`

`ReturnPage.tsx` should act as the flow controller. It should keep shared Return state and render one step page at a time.

Recommended step names:

```ts
type ReturnStep =
  | "start"
  | "health"
  | "photoGuide"
  | "photoCapture"
  | "inspecting"
  | "result";
```

## Step Order

1. `ReturnStartPage`
2. `DeviceHealthCheckPage`
3. `ReturnPhotoGuidePage`
4. `ReturnPhotoCapturePage`
5. `VisualInspectionPage`
6. `ReturnResultPage`

The user should not jump directly to visual inspection without completing the health check and photo capture mock steps.

## ReturnStartPage

Purpose:

- Collect or confirm the laptop number for return.
- Verify that the laptop is currently rented.
- Start a return inspection session.

Required behavior:

- Show the current student number from the app session.
- Ask for laptop number.
- Call `POST /api/returns/start`.
- Continue only when the laptop is rented and the student number is acceptable.

Expected error states:

- Unknown laptop number.
- Laptop is not currently rented.
- Student number does not match the active rent.
- API server unavailable.

MVP rule:

- If `STUDENT_MISMATCH` occurs, treat it as a clear warning. Whether to hard-block or allow staff-review continuation should follow the latest API contract and demo needs.

## DeviceHealthCheckPage

Purpose:

- Run or mock the return-time device health check before visual photo capture.
- Report suspicious software or device state to Web Admin.

MVP checks:

- Newly installed apps compared with rent baseline.
- Windows Defender status.
- Storage status.

Mock behavior:

- Show three check rows.
- Allow a simulated pass or warning result.
- Keep the screen operational and concise.

Result states:

- `pass`: no warning found.
- `warning`: at least one item needs staff review.
- `unknown`: a check could not be completed.

Flow rule:

- Health warnings should not normally block return.
- Continue to photo capture while preserving warnings for the final report and Web Admin.

Do not implement:

- Full antivirus scanning.
- Malware removal.
- Deep forensic analysis.
- Continuous monitoring.

## ReturnPhotoGuidePage

Purpose:

- Explain the three required photo views before capture starts.

Required views:

1. Open view
   - Laptop screen open.
   - Keyboard and screen visible.

2. Top and accessories view
   - Laptop screen closed.
   - Top surface photographed from above.
   - Mouse and charger visible together.

3. Bottom view
   - Laptop screen closed.
   - Bottom surface photographed from above.

UI behavior:

- Keep the instructions short.
- Make it clear there are three required photos.
- Continue to the capture step.

## ReturnPhotoCapturePage

Purpose:

- Mock the photo capture/upload step until real camera and CV integration are ready.

Required behavior:

- Show the current required view.
- Provide a mock capture/upload action.
- Mark each view as completed.
- Allow retake for each completed view.
- Continue only after all three views are completed.

State to keep:

- `openView`
- `topAccessoriesView`
- `bottomView`

Each view can store a mock URL, local preview placeholder, or a capture status flag.

## VisualInspectionPage

Purpose:

- Represent the handoff to the visual inspection model.

Mock behavior:

- Show a short analyzing state.
- Produce one of the MVP visual results.

MVP result categories:

- `pass`
- `tape_residue`
- `damage_found`

Future integration:

- Replace mock result generation with the teammate's visual inspection API.
- Preserve the same result categories unless `docs/API_CONTRACT.md` is updated.

## ReturnResultPage

Purpose:

- Give the final user-facing return result.
- Avoid blame language.
- Explain the next action clearly.

Result cases:

### Pass

Behavior:

- Show that the laptop was returned normally.
- Laptop status should become `available`.

Suggested message:

- "Return completed."

### Tape Residue

Behavior:

- Ask the user to remove the tape or sticker residue.
- Send the user back to photo capture after cleaning.
- Do not frame this as damage.
- Do not finalize as staff-review damage unless it persists after recapture or staff chooses to review.

Suggested message:

- "Tape or sticker residue is suspected. Please clean the surface and capture the photos again."

### Damage Found

Behavior:

- Show that damage is suspected.
- Send the laptop number and issue type to Web Admin.
- Allow the return to continue.
- Laptop status should become `issue_found`.
- Staff makes the final review.

Suggested message:

- "Damage is suspected. Staff will make the final review."

Avoid:

- "AI confirmed damage."
- "The student is responsible."
- "Payment is required."

## API Touchpoints

Current or expected endpoints:

- `POST /api/returns/start`
- `POST /api/returns/:inspectionId/health`
- `POST /api/returns/:inspectionId/photos`
- `POST /api/returns/:inspectionId/visual-inspection`

During mock implementation, missing endpoints may be represented locally inside the Electron renderer, but the state shape should stay close to `docs/API_CONTRACT.md`.

## Staff Review Rules

- Health warnings are evidence for staff review.
- Visual inspection issues are evidence for staff review.
- Final responsibility or payment decisions are outside the app.
- Serious visual issues should be visible in Web Admin by laptop number and issue type.
- Repairing status is controlled by Web Admin, not by the student-facing Return flow.

## What To Avoid

- Do not combine all Return logic into `App.tsx`.
- Do not build Return as one large screen.
- Do not make the Return flow feel like a dashboard.
- Do not use dense tables in the Electron Return flow.
- Do not use blame, payment, or punishment language.
- Do not make rent photo capture part of the current MVP unless the flow is explicitly changed.
