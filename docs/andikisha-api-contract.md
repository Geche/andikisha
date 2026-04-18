# AndikishaHR API Contract

**Version:** 1.0.0  
**Status:** Draft  
**Last Updated:** April 2026  
**Maintainer:** AndikishaHR Engineering  

---

## 1. Overview

This document defines the API contract between AndikishaHR's backend services and any consuming client — web frontend, mobile client, or third-party integration. It governs the payroll disbursement and employee management domains.

Both provider and consumer are bound by this contract. No breaking change may be introduced without versioning and a deprecation notice.

---

## 2. Base URL

```
https://api.andikisha.co.ke/v1
```

All endpoints are relative to this base. All requests and responses use `application/json` unless otherwise stated.

---

## 3. Versioning

The API uses URI versioning (`/v1`, `/v2`). When a breaking change is introduced, the version increments and the previous version remains live for a minimum of **90 days** with deprecation headers returned on every response.

**Deprecation header example:**

```
Deprecation: true
Sunset: Sat, 30 Jun 2026 00:00:00 GMT
Link: <https://api.andikisha.co.ke/v2>; rel="successor-version"
```

Breaking changes include: removing a field, changing a field's type, changing authentication requirements, or altering HTTP status codes.

Non-breaking changes (adding optional fields, new endpoints) do not increment the version.

---

## 4. Authentication

All endpoints require a Bearer token passed in the `Authorization` header.

```
Authorization: Bearer <access_token>
```

Tokens are obtained via the `/auth/token` endpoint using client credentials or user login. Tokens expire after **60 minutes**. Refresh tokens are valid for **30 days**.

**Scopes:**

| Scope | Access |
|---|---|
| `payroll:read` | Read payroll runs and disbursement status |
| `payroll:write` | Create and submit payroll runs |
| `employees:read` | Read employee records |
| `employees:write` | Create and update employee records |
| `webhooks:manage` | Register and delete webhook endpoints |

---

## 5. Common Headers

### Request

| Header | Required | Description |
|---|---|---|
| `Authorization` | Yes | Bearer token |
| `Content-Type` | Yes (for POST/PATCH) | Must be `application/json` |
| `X-Request-ID` | Recommended | UUID for request tracing |
| `X-Tenant-ID` | Yes | The SME organisation identifier |

### Response

| Header | Always Present | Description |
|---|---|---|
| `X-Request-ID` | Yes | Echoed from request, or generated |
| `X-RateLimit-Limit` | Yes | Max requests per window |
| `X-RateLimit-Remaining` | Yes | Requests remaining in current window |
| `X-RateLimit-Reset` | Yes | Unix timestamp of window reset |

---

## 6. Error Format

All errors return a consistent JSON envelope:

```json
{
  "error": {
    "code": "PAYROLL_RUN_NOT_FOUND",
    "message": "No payroll run found with the provided ID.",
    "details": [],
    "request_id": "req_01HXZ9K3BEMK9QP3RFVT"
  }
}
```

| Field | Type | Description |
|---|---|---|
| `code` | string | Machine-readable error identifier |
| `message` | string | Human-readable description |
| `details` | array | Field-level validation errors (if applicable) |
| `request_id` | string | ID for support and tracing |

**Field-level validation error example (`details`):**

```json
{
  "field": "employees[2].phone_number",
  "issue": "Must be a valid Safaricom number in E.164 format."
}
```

---

## 7. HTTP Status Codes

| Code | Meaning |
|---|---|
| `200 OK` | Successful retrieval or update |
| `201 Created` | Resource successfully created |
| `202 Accepted` | Request accepted for async processing |
| `400 Bad Request` | Invalid input or validation failure |
| `401 Unauthorized` | Missing or invalid token |
| `403 Forbidden` | Valid token but insufficient scope |
| `404 Not Found` | Resource does not exist |
| `409 Conflict` | Duplicate or state conflict |
| `422 Unprocessable Entity` | Business rule violation |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Unexpected server failure |
| `503 Service Unavailable` | Downstream dependency unavailable (e.g., M-Pesa) |

---

## 8. Rate Limits

| Tier | Limit |
|---|---|
| Default | 120 requests / minute |
| Payroll submission | 10 requests / minute |
| Webhooks | 5 registrations / hour |

When a limit is exceeded, the API returns `429` with a `Retry-After` header specifying the wait time in seconds.

---

## 9. Pagination

List endpoints support cursor-based pagination.

**Query parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `limit` | integer | 20 | Number of records per page (max 100) |
| `cursor` | string | — | Cursor from previous response |

**Response envelope for lists:**

```json
{
  "data": [...],
  "pagination": {
    "cursor": "eyJpZCI6IjEyMyJ9",
    "has_more": true,
    "total": 143
  }
}
```

---

## 10. Endpoints

### 10.1 Employees

---

#### `POST /employees`

Creates a new employee record.

**Required scope:** `employees:write`

**Request body:**

```json
{
  "first_name": "Jane",
  "last_name": "Wanjiku",
  "national_id": "12345678",
  "phone_number": "+254712345678",
  "email": "jane.wanjiku@company.co.ke",
  "department": "Finance",
  "job_title": "Accountant",
  "gross_salary": 85000,
  "currency": "KES",
  "mpesa_registered_phone": "+254712345678",
  "start_date": "2026-01-15"
}
```

**Field constraints:**

| Field | Type | Rules |
|---|---|---|
| `first_name` | string | Required. Max 50 chars |
| `last_name` | string | Required. Max 50 chars |
| `national_id` | string | Required. 7–8 digits. Must be unique per tenant |
| `phone_number` | string | Required. E.164 format |
| `email` | string | Optional. Valid email format |
| `gross_salary` | number | Required. Positive integer, KES |
| `mpesa_registered_phone` | string | Required. Must be a Safaricom number in E.164 |
| `start_date` | string | Required. ISO 8601 date (`YYYY-MM-DD`) |

**Response `201`:**

```json
{
  "data": {
    "id": "emp_01HXZAB2CDEFG3H4IJKL",
    "first_name": "Jane",
    "last_name": "Wanjiku",
    "national_id": "12345678",
    "phone_number": "+254712345678",
    "mpesa_registered_phone": "+254712345678",
    "gross_salary": 85000,
    "currency": "KES",
    "status": "active",
    "created_at": "2026-04-16T08:30:00Z"
  }
}
```

**Error codes:**

| Code | HTTP | Condition |
|---|---|---|
| `DUPLICATE_NATIONAL_ID` | 409 | Employee with this national ID already exists |
| `INVALID_MPESA_NUMBER` | 400 | Phone number not recognised as a Safaricom number |
| `VALIDATION_ERROR` | 400 | One or more required fields failed validation |

---

#### `GET /employees`

Returns a paginated list of employees for the authenticated tenant.

**Required scope:** `employees:read`

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `status` | string | Filter by status: `active`, `inactive`, `terminated` |
| `department` | string | Filter by department name |
| `limit` | integer | Page size (default 20, max 100) |
| `cursor` | string | Pagination cursor |

**Response `200`:**

```json
{
  "data": [
    {
      "id": "emp_01HXZAB2CDEFG3H4IJKL",
      "first_name": "Jane",
      "last_name": "Wanjiku",
      "department": "Finance",
      "gross_salary": 85000,
      "status": "active"
    }
  ],
  "pagination": {
    "cursor": "eyJpZCI6IjEyMyJ9",
    "has_more": false,
    "total": 1
  }
}
```

---

#### `GET /employees/:id`

Returns a single employee record.

**Required scope:** `employees:read`

**Response `200`:** Full employee object (same shape as `POST /employees` response).

**Error codes:**

| Code | HTTP | Condition |
|---|---|---|
| `EMPLOYEE_NOT_FOUND` | 404 | No employee found with this ID |

---

#### `PATCH /employees/:id`

Updates an existing employee record. Only supply fields to change.

**Required scope:** `employees:write`

**Request body (all fields optional):**

```json
{
  "gross_salary": 95000,
  "department": "Operations",
  "mpesa_registered_phone": "+254798765432"
}
```

**Response `200`:** Updated employee object.

---

### 10.2 Payroll Runs

---

#### `POST /payroll-runs`

Creates a new payroll run for a given pay period.

**Required scope:** `payroll:write`

**Request body:**

```json
{
  "pay_period_start": "2026-04-01",
  "pay_period_end": "2026-04-30",
  "pay_date": "2026-04-28",
  "employee_ids": [
    "emp_01HXZAB2CDEFG3H4IJKL",
    "emp_02HYABC3DEFGH4I5JKLM"
  ],
  "notes": "April 2026 payroll"
}
```

**Field constraints:**

| Field | Type | Rules |
|---|---|---|
| `pay_period_start` | string | Required. ISO 8601 date |
| `pay_period_end` | string | Required. ISO 8601 date. Must be after `pay_period_start` |
| `pay_date` | string | Required. ISO 8601 date. Must be on or after `pay_period_end` |
| `employee_ids` | array | Required. Min 1 employee. All must be active |

**Response `201`:**

```json
{
  "data": {
    "id": "run_01HXZCDE4FGHIJ5KLMNO",
    "status": "draft",
    "pay_period_start": "2026-04-01",
    "pay_period_end": "2026-04-30",
    "pay_date": "2026-04-28",
    "total_gross": 680000,
    "total_net": 574320,
    "total_paye": 82400,
    "total_nhif": 12000,
    "total_nssf": 11280,
    "employee_count": 8,
    "created_at": "2026-04-16T09:00:00Z",
    "line_items": [
      {
        "employee_id": "emp_01HXZAB2CDEFG3H4IJKL",
        "employee_name": "Jane Wanjiku",
        "gross": 85000,
        "paye": 10300,
        "nhif": 1500,
        "nssf": 1410,
        "net": 71790,
        "mpesa_phone": "+254712345678"
      }
    ]
  }
}
```

**Error codes:**

| Code | HTTP | Condition |
|---|---|---|
| `DUPLICATE_PAY_PERIOD` | 409 | A payroll run already exists for this period |
| `INACTIVE_EMPLOYEE` | 422 | One or more employee IDs are inactive or terminated |
| `EMPLOYEE_NOT_FOUND` | 404 | One or more employee IDs do not exist |

---

#### `GET /payroll-runs/:id`

Returns details of a single payroll run including all line items.

**Required scope:** `payroll:read`

**Response `200`:** Full payroll run object (same shape as `POST /payroll-runs` response).

---

#### `POST /payroll-runs/:id/submit`

Submits a payroll run for disbursement via M-Pesa B2C. The run must be in `draft` status.

**Required scope:** `payroll:write`

**Request body:** None required.

**Response `202 Accepted`:**

```json
{
  "data": {
    "id": "run_01HXZCDE4FGHIJ5KLMNO",
    "status": "processing",
    "submitted_at": "2026-04-16T09:15:00Z",
    "message": "Payroll run accepted. Disbursements are being processed via M-Pesa B2C."
  }
}
```

Processing is asynchronous. Status updates are delivered via webhook. Poll `GET /payroll-runs/:id` or subscribe to `payroll.run.completed` and `payroll.run.failed` events.

**Error codes:**

| Code | HTTP | Condition |
|---|---|---|
| `PAYROLL_RUN_NOT_FOUND` | 404 | Run does not exist |
| `INVALID_RUN_STATUS` | 422 | Run is not in `draft` status |
| `MPESA_SERVICE_UNAVAILABLE` | 503 | Safaricom B2C API is unreachable |
| `INSUFFICIENT_FUNDS` | 422 | Org wallet balance below total net payroll |

---

#### `POST /payroll-runs/:id/cancel`

Cancels a payroll run. Only `draft` runs can be cancelled.

**Required scope:** `payroll:write`

**Response `200`:**

```json
{
  "data": {
    "id": "run_01HXZCDE4FGHIJ5KLMNO",
    "status": "cancelled",
    "cancelled_at": "2026-04-16T09:20:00Z"
  }
}
```

---

### 10.3 Disbursements

---

#### `GET /payroll-runs/:id/disbursements`

Returns individual M-Pesa disbursement records for a submitted payroll run.

**Required scope:** `payroll:read`

**Response `200`:**

```json
{
  "data": [
    {
      "id": "disb_01HXZEF5GHIJK6LMNOP",
      "payroll_run_id": "run_01HXZCDE4FGHIJ5KLMNO",
      "employee_id": "emp_01HXZAB2CDEFG3H4IJKL",
      "employee_name": "Jane Wanjiku",
      "amount": 71790,
      "currency": "KES",
      "mpesa_phone": "+254712345678",
      "status": "completed",
      "mpesa_receipt": "QHK1234ABCD",
      "completed_at": "2026-04-16T09:18:45Z",
      "failure_reason": null
    }
  ],
  "pagination": {
    "cursor": null,
    "has_more": false,
    "total": 8
  }
}
```

**Disbursement statuses:**

| Status | Meaning |
|---|---|
| `pending` | Queued, not yet sent to M-Pesa |
| `initiated` | Sent to Safaricom B2C |
| `completed` | M-Pesa confirmed successful |
| `failed` | Safaricom returned a failure |
| `reversed` | Payment was reversed after completion |

---

## 11. Webhooks

AndikishaHR sends webhook events for asynchronous operations. Register endpoints via the API.

### 11.1 Registering a Webhook

#### `POST /webhooks`

**Required scope:** `webhooks:manage`

**Request body:**

```json
{
  "url": "https://yourdomain.com/andikisha/webhooks",
  "events": [
    "payroll.run.completed",
    "payroll.run.failed",
    "disbursement.completed",
    "disbursement.failed"
  ],
  "secret": "your_signing_secret"
}
```

**Response `201`:**

```json
{
  "data": {
    "id": "wh_01HXZGH7IJKLM8NOPQR",
    "url": "https://yourdomain.com/andikisha/webhooks",
    "events": ["payroll.run.completed", "payroll.run.failed"],
    "status": "active",
    "created_at": "2026-04-16T09:00:00Z"
  }
}
```

---

### 11.2 Webhook Event Payload

All webhook deliveries share the same envelope:

```json
{
  "id": "evt_01HXZIJ9KLMNO0PQRST",
  "event": "payroll.run.completed",
  "created_at": "2026-04-16T09:20:00Z",
  "data": {
    "payroll_run_id": "run_01HXZCDE4FGHIJ5KLMNO",
    "status": "completed",
    "total_net_disbursed": 574320,
    "failed_disbursements": 0
  }
}
```

---

### 11.3 Signature Verification

Every delivery includes an `X-AndikishaHR-Signature` header. Verify it before processing.

```
X-AndikishaHR-Signature: sha256=<HMAC-SHA256 of raw request body using your secret>
```

**Verification (Node.js example):**

```javascript
const crypto = require('crypto');

function verifySignature(rawBody, signature, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

Respond with `200 OK` within **10 seconds**. Failed deliveries are retried up to 5 times with exponential backoff (1 min, 5 min, 30 min, 2 hrs, 12 hrs).

---

### 11.4 Webhook Events Reference

| Event | Trigger |
|---|---|
| `payroll.run.completed` | All disbursements in a run succeeded |
| `payroll.run.partially_failed` | Some disbursements failed, some succeeded |
| `payroll.run.failed` | All disbursements in a run failed |
| `disbursement.completed` | Single employee payment confirmed by M-Pesa |
| `disbursement.failed` | Single employee payment failed |
| `disbursement.reversed` | A previously completed payment was reversed |

---

## 12. M-Pesa B2C Integration Notes

AndikishaHR uses Safaricom's B2C Payment Request API internally. Consumers of this API do not interact with Safaricom directly. The following constraints apply:

- Payments are only made to Safaricom (M-Pesa) registered numbers. Non-Safaricom numbers will cause `INVALID_MPESA_NUMBER` on employee creation.
- Individual disbursements are capped at **KES 150,000** per transaction by Safaricom. Salaries above this limit will be split into multiple transactions automatically.
- B2C transactions are subject to Safaricom's daily processing windows. Submissions outside windows are queued and processed at the next available window.
- M-Pesa transaction fees are charged to the organisation's M-Pesa shortcode balance, not deducted from employee net pay.

---

## 13. Idempotency

`POST` endpoints that create or submit resources support idempotency keys.

Pass a `X-Idempotency-Key` header (UUID recommended). If the same key is reused within 24 hours, the original response is returned without re-executing the operation.

```
X-Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

This is especially important for payroll submission. A network timeout should not result in a double submission.

---

## 14. Contract Change Policy

| Change Type | Process |
|---|---|
| New optional field in response | No version bump. Added silently. |
| New optional field in request | No version bump. Consumers must ignore unknown fields. |
| New endpoint | No version bump. |
| Removing or renaming a field | Version bump required. 90-day deprecation window. |
| Changing a field's type | Version bump required. |
| Changing HTTP status codes | Version bump required. |
| Changing authentication method | Version bump required. 90-day notice. |

---

## 15. Glossary

| Term | Definition |
|---|---|
| Payroll Run | A single payroll processing event covering a set of employees for a defined pay period |
| Disbursement | An individual M-Pesa payment to one employee within a payroll run |
| B2C | M-Pesa Business-to-Customer payment API used to send funds from an org shortcode to personal M-Pesa numbers |
| Tenant | An SME organisation registered on AndikishaHR |
| Pay Period | The date range for which salaries are being calculated |
| Net Pay | Gross salary minus statutory deductions (PAYE, NHIF, NSSF) |

---

*End of API Contract v1.0.0*
