# Component Rules

## Purpose

This file defines shared component behavior for KeepEy UI surfaces.

Use these rules for reusable components across:

- Electron App.
- Web Admin.

All components should use shared tokens from `docs/design/DESIGN_TOKENS.md`.

## Shared Component Principles

- Use the same shared design tokens across both surfaces.
- Allow different scale and density per surface.
- Keep interaction states consistent.
- Prefer semantic component variants over ad hoc styling.
- Do not use color alone to communicate status.
- Avoid layout shift on hover, press, loading, or validation changes.

## Buttons

- Buttons must have clear default, hover, focus, pressed, disabled, and loading states.
- Electron App buttons can be larger, more centered, and more instructional.
- Web Admin buttons should be smaller, grouped, and action-oriented.
- Primary action should be visually dominant.
- Secondary and tertiary actions should be quieter.
- Icon-only buttons require accessible labels or visible tooltips.
- Do not use emoji as button icons.

## Cards

- Cards should have a clear purpose.
- Electron App cards can be spacious and instructional.
- Web Admin cards should be compact and data-focused.
- Avoid nesting cards inside cards.
- Use borders, spacing, and hierarchy before heavy shadows.

## Forms and Inputs

- Use visible labels.
- Do not rely on placeholders as labels.
- Show helper text for non-obvious fields.
- Show validation errors near the relevant field.
- Disable submit buttons during async requests.
- Preserve entered values after validation errors.
- Student number and laptop number inputs should be simple and prominent in the Electron App.

## Status Badges

- Use shared status colors from `docs/design/DESIGN_TOKENS.md`.
- Badge text should be explicit:
  - Available.
  - Rented.
  - Issue found.
  - Repairing.
  - Pass.
  - Warning.
  - Unknown.
- Pair color with text and, when useful, an icon.
- Keep badges compact in Web Admin.
- Keep badges readable and friendly in the Electron App.

## Tables

- Tables should mainly be used in the Web Admin.
- Avoid tables in the Electron App unless there is a strong workflow reason.
- Table columns should support staff scanning.
- Use stable row heights.
- Keep laptop number and status easy to find.
- Use filters and search for larger lists.
- Avoid putting long evidence text directly into dense table cells; use detail panels.

## Panels and Drawers

- Use panels or drawers for detailed admin issue review.
- Panels should show evidence before action controls.
- Keep drawer animation subtle.
- Provide a clear close/back route.
- Avoid using drawers for simple student-facing app steps.

## Empty States

- Empty states should explain what is missing and what to do next.
- Electron App empty states should be short and guided.
- Web Admin empty states should be operational and concise.
- Do not use playful illustrations as the primary empty-state content.

## Loading States

- Show loading states for async operations.
- Use button-level loading when submitting a form.
- Use skeletons or structured loading for admin lists.
- Avoid long blocking spinners when progress can be shown.
- Loading states should not erase context unnecessarily.

## Error States

- Errors should state what happened and how to recover.
- Put form errors near the relevant field.
- Use neutral language.
- Do not imply student blame.
- For server errors, offer retry when practical.
- For admin errors, preserve the current filters and selection.

## Responsive Behavior

- Electron App should prioritize simple centered workflows and readable instructions.
- Web Admin should prioritize dashboard/table usability across desktop widths.
- Prevent horizontal overflow.
- Keep touch/click targets usable.
- Preserve status visibility on smaller viewports.
- Use responsive density changes instead of completely different branding.



