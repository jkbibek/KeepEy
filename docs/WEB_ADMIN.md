# Web Admin Structure

## Purpose

The Web Admin is the staff-only surface for monitoring campus laptop inventory, rental status, return activity, and issue states.

The Electron App records rent/return actions. The Web Admin reads the same shared data source so staff can see laptop state changes and student activity logs.

## Global Filter

Every Web Admin page must include a top global filter input.

The filter is not limited to exact search. It should match any visible/shared data field that contains the entered string.

Examples:

- Typing `애플` shows Apple laptops.
- Typing `202` shows matching purchase dates, laptop numbers, and student numbers such as:
  - `2024-03`
  - `LIB-202`
  - `116782021`
- Typing `대여중` shows only checked-out laptops.
- Typing `수리중`, `대여가능`, or `고장` filters by status.

The filter should apply to the current page's dataset and preserve page context.

## Pages

### 1. All Laptops

Shows every registered laptop.

Columns:

- Laptop brand/model family:
  - 삼성
  - 애플
  - HP
  - ASUS
- Laptop number.
- Purchase date:
  - Year and month.
- Laptop status:
  - 대여가능
  - 대여중
  - 수리중
  - 고장
- Current student number if the laptop is rented.

Actions:

- Add laptop.
- Delete laptop.

### 2. Available Laptops

Shows laptops that can be rented.

Columns:

- Laptop brand/model family.
- Laptop number.

### 3. Checked-Out Laptops

Shows laptops currently rented by students.

Columns:

- Laptop brand/model family.
- Laptop number.
- Current student number.

### 4. Rental Return Logs

Shows rent and return activity in a staff-readable log.

Columns:

- Student number.
- Laptop number.
- Rent time.
- Return time.
- Action/result if useful:
  - rented
  - returned
  - issue_found

The log should help staff understand who rented which laptop and when it was returned.

## Inventory Actions

### Add Laptop

Available from the All Laptops page.

Required fields:

- Laptop brand/model family.
- Laptop number.
- Purchase date:
  - Year.
  - Month.

Expected result:

- New laptop is added with `available` status by default.
- New laptop appears in All Laptops and Available Laptops.

### Delete Laptop

Available from the All Laptops page.

Required field:

- Laptop number.

Expected result:

- Matching laptop is removed from the inventory.
- Related logs should remain for audit history unless the implementation explicitly documents otherwise.

## Status Mapping

Use these Korean labels in Web Admin:

| Internal value | Admin label |
|---|---|
| `available` | 대여가능 |
| `rented` | 대여중 |
| `repairing` | 수리중 |
| `broken` | 고장 |
| `issue_found` | 고장 or 확인필요 |

For the current MVP, use `broken` for clearly unusable laptops and `issue_found` for inspection issues that require review. If the UI needs a compact status set, show `issue_found` as `고장` only when staff has marked the laptop unusable.

## Shared Data Source

For local MVP work, the Web Admin and Electron App should read/write the same temporary DB files under `db/`.

Initial local files:

- `db/laptops.json`
- `db/rental_logs.json`

Later, these files can be replaced by Supabase or a backend API without changing the page structure.

