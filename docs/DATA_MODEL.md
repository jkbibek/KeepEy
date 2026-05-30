# KeepEy Data Model

## Purpose

This document defines the shared data model for the Electron App, Web Admin, backend API, and mock data.

Use this file as the source of truth for laptop statuses, rent records, return inspections, issue records, and status transition rules.

## Core Identifiers

- `laptopId`: the central identifier across rent, return, health check, visual inspection, and admin review. Example: `LIB-042`.
- `studentId`: temporary student number input used instead of login for the MVP.
- `rentId`: identifies a rent session.
- `inspectionId`: identifies a return inspection session.

## Status Types

```ts
type LaptopStatus =
  | "available"
  | "rented"
  | "issue_found"
  | "repairing"
  | "broken";
```

Status meanings:

- `available`: the laptop can be rented.
- `rented`: the laptop is currently rented.
- `issue_found`: return issue found; staff review is required.
- `repairing`: school-level repair is in progress.
- `broken`: the laptop is known to be unusable or damaged.

```ts
type RentStatus =
  | "active"
  | "returned"
  | "issue_found";
```

```ts
type HealthStatus =
  | "pass"
  | "warning";
```

```ts
type VisualStatus =
  | "pass"
  | "tape_residue"
  | "damage_found";
```

```ts
type FinalReturnStatus =
  | "returned"
  | "needs_cleaning"
  | "admin_review_required";
```

```ts
type IssueType =
  | "added_app"
  | "defender_warning"
  | "low_storage"
  | "scratch"
  | "crack"
  | "dent"
  | "tape_residue";
```

```ts
type IssueSeverity =
  | "info"
  | "warning"
  | "critical";
```

```ts
type IssueStatus =
  | "open"
  | "resolved";
```

## Entities

### Laptop

```ts
type Laptop = {
  id: string;
  model: string;
  brand?: "?쇱꽦" | "?좏뵆" | "HP" | "ASUS";
  purchaseYear?: number;
  purchaseMonth?: number;
  status: LaptopStatus;
  currentStudentId?: string;
  currentRentId?: string;
  lastIssueSummary?: string;
  updatedAt: string;
};
```

### Rent

```ts
type Rent = {
  id: string;
  laptopId: string;
  studentId: string;
  rentedAt: string;
  returnedAt?: string;
  status: RentStatus;
  baselineInstalledApps?: string[];
};
```

### RentalLog

```ts
type RentalLog = {
  id: string;
  laptopId: string;
  studentId: string;
  rentedAt: string;
  returnedAt?: string | null;
  result: "rented" | "returned" | "issue_found";
};
```

### ReturnInspection

```ts
type ReturnInspection = {
  id: string;
  rentId: string;
  laptopId: string;
  studentId: string;
  healthStatus: HealthStatus;
  visualStatus: VisualStatus;
  finalStatus: FinalReturnStatus;
  createdAt: string;
};
```

### HealthCheckResult

```ts
type HealthCheckResult = {
  inspectionId: string;
  laptopId: string;
  studentId: string;
  addedApps: string[];
  defender: {
    status: "ok" | "warning" | "unknown";
    enabled?: boolean;
    realTimeProtectionEnabled?: boolean;
    message?: string;
  };
  storage: {
    status: "ok" | "warning" | "unknown";
    freeBytes?: number;
    totalBytes?: number;
    freePercent?: number;
    message?: string;
  };
  issues: Issue[];
  createdAt: string;
};
```

### VisualInspectionResult

```ts
type VisualInspectionResult = {
  inspectionId: string;
  laptopId: string;
  studentId: string;
  status: VisualStatus;
  images: {
    openView?: string;
    topAccessoriesView?: string;
    bottomView?: string;
    heatmap?: string;
  };
  issues: Issue[];
  createdAt: string;
};
```

### Issue

```ts
type Issue = {
  id: string;
  laptopId: string;
  inspectionId?: string;
  type: IssueType;
  severity: IssueSeverity;
  message: string;
  status: IssueStatus;
  createdAt?: string;
  resolvedAt?: string;
};
```

## Status Transition Rules

Allowed laptop status transitions:

```text
available -> rented
rented -> available
rented -> issue_found
issue_found -> available
issue_found -> repairing
repairing -> available
available -> broken
broken -> repairing
broken -> available
```

Rules:

- Rent can only move `available` to `rented`.
- Normal return moves `rented` to `available`.
- Return with serious visual or health issues moves `rented` to `issue_found`.
- Tape residue should usually produce `needs_cleaning` and request recapture before a final status change.
- Only Web Admin should move a laptop into `repairing`.
- Web Admin can mark a laptop as `broken`.
- Only staff/admin action should move `issue_found` to `available` or `repairing`.

## MVP Mock Data Notes

Mock data is acceptable during early implementation, but it must follow these types and transition rules.

Seed data should include at least:

- One available laptop.
- One checked-out laptop.
- One issue_found laptop.
- One repairing laptop.

