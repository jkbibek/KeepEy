# Web Admin Design Profile

## Purpose

This file defines the UI/UX profile for the KeepEy Web Admin.

The Web Admin is used by staff to monitor laptop status, review issue evidence, inspect health/visual findings, and move laptops to available or repairing states.

Use shared visual tokens from `docs/design/DESIGN_TOKENS.md`.

## Desired Feeling

The Web Admin should feel:

- Professional.
- Structured.
- Reliable.
- Dashboard-like.
- Evidence-focused.
- Neutral.
- Efficient.

It can be visually denser than the Electron App, but it must remain readable and calm.

## Layout Rules

- Prefer dashboard layouts.
- Use structured content regions.
- Keep navigation predictable.
- Use tighter spacing than the Electron App while preserving readability.
- Put status overview, filters, and issue lists near the top.
- Use detail panels or drawers for deeper review.
- Avoid oversized student-facing controls.

## Dashboard Structure

- Provide a clear status overview.
- Show counts for key laptop states:
  - Available.
  - Rented.
  - Issue found.
  - Repairing.
- Surface laptops requiring staff action.
- Keep the most important operational data above secondary details.

## Tables and Lists

- Use readable but denser tables for laptop review.
- Tables should support quick scanning by laptop number, status, student number, and issue summary.
- Use consistent row height.
- Keep columns purposeful.
- Avoid wrapping critical identifiers such as laptop number.
- Use status badges instead of long status paragraphs.

## Filters and Search

- Provide filters for laptop status.
- Provide search by laptop number.
- If student number search exists, keep it secondary to laptop number search.
- Filters should be obvious and reversible.
- Avoid hiding primary filters behind complex menus in the MVP.

## Issue Review Panels

- Show evidence in a structured way:
  - Laptop number.
  - Current status.
  - Student number when relevant.
  - Health warnings.
  - Visual inspection issue type.
  - Return images and heatmap when available.
- Place staff actions after the evidence.
- Use panels or drawers for detailed issue review.

## Status Summary Cards

- Use compact status cards.
- Cards should summarize counts or action-needed states.
- Avoid large decorative cards.
- Each card should have a clear operational purpose.

## Action Controls

- Admin actions should be grouped and action-oriented.
- Common actions:
  - Mark as available.
  - Mark as repairing.
  - Keep issue open.
  - Resolve issue.
- Destructive or high-impact actions should be visually distinct and confirm when necessary.
- Avoid student-facing language.

## Information Density

- Web Admin should be denser than the Electron App.
- Use smaller but readable typography.
- Use compact forms, rows, and buttons.
- Avoid excessive empty space.
- Preserve enough spacing to prevent staff from misreading issue evidence.

## Animation and Visual Effects

- Keep animations restrained.
- Use subtle transitions for drawers, filters, row expansion, and status updates.
- Avoid playful illustrations.
- Avoid dramatic scanning effects.
- Avoid animations that slow staff review.

## What to Avoid

- Marketing hero sections.
- Playful student-facing illustrations.
- Oversized Rent/Return-style buttons.
- Excessive empty space.
- Dense data without clear hierarchy.
- Raw unstructured issue dumps.
- Color-only status meaning.
- Separate admin-only branding unrelated to the Electron App.



