# KeepEy API Contract

## Purpose

This document defines the API contract shared by the Electron App, Web Admin, backend service, and mock server.

Use these endpoints and payload shapes as the implementation target. During early MVP work, local mock handlers may be used as long as they preserve this contract.

## General Rules

- `laptopId` is the main identifier across all flows.
- `studentId` is required for rent and return during the MVP.
- API responses should use stable status strings from `docs/DATA_MODEL.md`.
- Errors should be explicit enough for the UI to show useful guidance.
- AI and health check results are evidence for staff review, not automatic blame.

## Error Shape

```ts
type ApiError = {
  error: {
    code: string;
    message: string;
  };
};
```

Common error codes:

- `LAPTOP_NOT_FOUND`
- `LAPTOP_NOT_AVAILABLE`
- `LAPTOP_NOT_RENTED`
- `STUDENT_MISMATCH`
- `RENT_NOT_FOUND`
- `INSPECTION_NOT_FOUND`
- `VALIDATION_ERROR`
- `SERVER_ERROR`

## Laptop APIs

### GET /api/laptops

Returns laptop status rows for Web Admin.

Response:

```json
{
  "laptops": [
    {
      "id": "LIB-042",
      "model": "MacBook Air",
      "brand": "?좏뵆",
      "purchaseYear": 2024,
      "purchaseMonth": 3,
      "status": "available",
      "currentStudentId": null,
      "currentRentId": null,
      "lastIssueSummary": null,
      "updatedAt": "2026-05-29T09:00:00.000Z"
    }
  ]
}
```

### GET /api/laptops/:laptopId

Returns a single laptop.

Response:

```json
{
  "laptop": {
    "id": "LIB-042",
    "model": "MacBook Air",
    "status": "rented",
    "currentStudentId": "2026123456",
    "currentRentId": "rent_001",
    "lastIssueSummary": null,
    "updatedAt": "2026-05-29T09:00:00.000Z"
  }
}
```

### PATCH /api/laptops/:laptopId/status

Used by Web Admin to mark a laptop as available, repairing, broken, or another supported status.

Request:

```json
{
  "status": "repairing",
  "note": "Top case scratch requires staff review"
}
```

### POST /api/laptops

Used by Web Admin to add a laptop.

Request:

```json
{
  "id": "LIB-202",
  "brand": "?좏뵆",
  "model": "MacBook Air",
  "purchaseYear": 2024,
  "purchaseMonth": 3
}
```

Response:

```json
{
  "laptop": {
    "id": "LIB-202",
    "brand": "?좏뵆",
    "model": "MacBook Air",
    "purchaseYear": 2024,
    "purchaseMonth": 3,
    "status": "available"
  }
}
```

### DELETE /api/laptops/:laptopId

Used by Web Admin to delete a laptop by laptop number.

Response:

```json
{
  "deleted": true,
  "laptopId": "LIB-202"
}
```

### GET /api/rental-logs

Returns rent and return activity logs for Web Admin.

Response:

```json
{
  "logs": [
    {
      "id": "log_001",
      "laptopId": "LIB-202",
      "studentId": "116782021",
      "rentedAt": "2026-05-30T09:10:00.000Z",
      "returnedAt": null,
      "result": "rented"
    }
  ]
}
```

Response:

```json
{
  "laptop": {
    "id": "LIB-042",
    "status": "repairing",
    "updatedAt": "2026-05-29T09:05:00.000Z"
  }
}
```

## Rent APIs

### POST /api/rents

Creates a rent record and marks the laptop as rented.

Request:

```json
{
  "laptopId": "LIB-042",
  "studentId": "2026123456",
  "baselineInstalledApps": ["Chrome", "Microsoft Office", "Visual Studio Code"]
}
```

Response:

```json
{
  "rent": {
    "id": "rent_001",
    "laptopId": "LIB-042",
    "studentId": "2026123456",
    "rentedAt": "2026-05-29T09:00:00.000Z",
    "status": "active"
  },
  "laptop": {
    "id": "LIB-042",
    "status": "rented",
    "currentStudentId": "2026123456",
    "currentRentId": "rent_001"
  }
}
```

Expected failures:

- `LAPTOP_NOT_FOUND`
- `LAPTOP_NOT_AVAILABLE`

## Return APIs

### POST /api/returns/start

Starts a return inspection for a checked-out laptop.

Request:

```json
{
  "laptopId": "LIB-042",
  "studentId": "2026123456"
}
```

Response:

```json
{
  "inspection": {
    "id": "inspection_001",
    "rentId": "rent_001",
    "laptopId": "LIB-042",
    "studentId": "2026123456",
    "healthStatus": "pass",
    "visualStatus": "pass",
    "finalStatus": "returned",
    "createdAt": "2026-05-29T09:10:00.000Z"
  }
}
```

Expected failures:

- `LAPTOP_NOT_FOUND`
- `LAPTOP_NOT_RENTED`
- `STUDENT_MISMATCH`

For MVP, `STUDENT_MISMATCH` may be shown as a warning requiring staff review rather than a hard block.

### POST /api/returns/:inspectionId/health

Uploads Device Health Check results.

Request:

```json
{
  "addedApps": ["AnyDesk"],
  "defender": {
    "status": "warning",
    "enabled": true,
    "realTimeProtectionEnabled": false,
    "message": "Real-time protection is disabled"
  },
  "storage": {
    "status": "ok",
    "freeBytes": 92000000000,
    "totalBytes": 512000000000,
    "freePercent": 18.0,
    "message": "Storage is within the MVP threshold"
  }
}
```

Response:

```json
{
  "healthStatus": "warning",
  "issues": [
    {
      "id": "issue_001",
      "type": "added_app",
      "severity": "warning",
      "message": "New app detected: AnyDesk",
      "status": "open"
    },
    {
      "id": "issue_002",
      "type": "defender_warning",
      "severity": "warning",
      "message": "Windows Defender real-time protection is disabled",
      "status": "open"
    }
  ]
}
```

### POST /api/returns/:inspectionId/photos

Uploads or registers the three required return photos.

For mock/local implementation, this may accept image URLs or base64 placeholders.
For production-like implementation, prefer multipart upload or storage URLs.

Request:

```json
{
  "images": {
    "openView": "storage://returns/inspection_001/open-view.jpg",
    "topAccessoriesView": "storage://returns/inspection_001/top-accessories.jpg",
    "bottomView": "storage://returns/inspection_001/bottom.jpg"
  }
}
```

Response:

```json
{
  "uploaded": true,
  "images": {
    "openView": "storage://returns/inspection_001/open-view.jpg",
    "topAccessoriesView": "storage://returns/inspection_001/top-accessories.jpg",
    "bottomView": "storage://returns/inspection_001/bottom.jpg"
  }
}
```

### POST /api/returns/:inspectionId/visual-inspection

Runs or records visual inspection.

During early MVP work, this endpoint may return mock results.

Request:

```json
{
  "mode": "mock",
  "images": {
    "openView": "storage://returns/inspection_001/open-view.jpg",
    "topAccessoriesView": "storage://returns/inspection_001/top-accessories.jpg",
    "bottomView": "storage://returns/inspection_001/bottom.jpg"
  }
}
```

Pass response:

```json
{
  "visualStatus": "pass",
  "finalStatus": "returned",
  "issues": [],
  "laptopStatus": "available"
}
```

Tape residue response:

```json
{
  "visualStatus": "tape_residue",
  "finalStatus": "needs_cleaning",
  "issues": [
    {
      "id": "issue_003",
      "type": "tape_residue",
      "severity": "info",
      "message": "Tape or sticker residue suspected on top surface",
      "status": "open"
    }
  ],
  "laptopStatus": "rented"
}
```

Damage response:

```json
{
  "visualStatus": "damage_found",
  "finalStatus": "admin_review_required",
  "issues": [
    {
      "id": "issue_004",
      "type": "scratch",
      "severity": "warning",
      "message": "Scratch suspected on top surface",
      "status": "open"
    }
  ],
  "laptopStatus": "issue_found",
  "heatmapUrl": "storage://returns/inspection_001/heatmap.png"
}
```

## Admin APIs

### GET /api/issues

Returns issue rows for Web Admin.

Query parameters:

- `status=open`
- `laptopId=LIB-042`

Response:

```json
{
  "issues": [
    {
      "id": "issue_004",
      "laptopId": "LIB-042",
      "inspectionId": "inspection_001",
      "type": "scratch",
      "severity": "warning",
      "message": "Scratch suspected on top surface",
      "status": "open",
      "createdAt": "2026-05-29T09:12:00.000Z"
    }
  ]
}
```

### PATCH /api/issues/:issueId

Updates issue status.

Request:

```json
{
  "status": "resolved",
  "note": "Reviewed by staff"
}
```

Response:

```json
{
  "issue": {
    "id": "issue_004",
    "status": "resolved",
    "resolvedAt": "2026-05-29T09:30:00.000Z"
  }
}
```

