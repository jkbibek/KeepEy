# KeepEy Design Router

## Purpose

For any UI, layout, visual style, component, or user-facing screen change, start from this design document.

KeepEy has two connected UI surfaces:

- Electron App: student/staff-facing rent and return client.
- Web Admin: staff-facing monitoring and issue review dashboard.

Both surfaces share the same Expo-inspired base visual language through `docs/design/DESIGN_TOKENS.md`. The shared foundation keeps font direction, color palette, spacing logic, radius scale, status colors, icons, and motion consistent.

The two surfaces should feel connected, but not identical. Use the same token system, then vary layout density, component scale, information hierarchy, wording style, and interaction patterns for each surface.

## Read Order

Read:

- `docs/design/DESIGN_TOKENS.md` for shared Expo-inspired fonts, colors, spacing, radius, status colors, icons, and motion.
- `docs/design/DESIGN_APP.md` when working on the Electron App.
- `docs/design/DESIGN_ADMIN.md` when working on the Web Admin.
- `docs/design/COMPONENT_RULES.md` when creating or modifying reusable UI components.
- `docs/FLOW.md` when a UI change affects screen behavior, step order, or user journey.

## Surface Split

### Electron App

The Electron App should feel simple, guided, approachable, low-stress, and task-focused.

Use it for:

- Rent.
- Return.
- Device Health Check.
- Photo capture.
- Return result guidance.

### Web Admin

The Web Admin should feel professional, structured, reliable, dashboard-like, and evidence-focused.

Use it for:

- Laptop status monitoring.
- Issue review.
- Health check evidence.
- Visual inspection evidence.
- Staff decisions such as marking a laptop available or repairing.

## Design Harnessing

Use `docs/design/DESIGN_TOKENS.md` as the shared visual foundation before inventing any visual system.

Do not create separate palettes, unrelated fonts, or independent component styles for the Electron App and Web Admin. If a surface needs to feel different, change density, scale, hierarchy, layout, copy, or interaction style while staying within the shared token system.

When getdesign-generated files exist, inspect them before changing reusable UI primitives, tokens, typography, colors, spacing, or component styles.



