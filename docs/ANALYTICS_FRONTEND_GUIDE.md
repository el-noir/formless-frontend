# Frontend Analytics Guide — Google-Forms-Style Response Analytics

> **Auth:** All analytics endpoints require JWT + org membership (member+ role).  
> **Base path:** `/api/organizations/:orgId/forms/:formId/analytics`  
> **Swagger:** `http://localhost:4000/api` (live & interactive)

---

## Endpoints at a Glance

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 1 | `GET` | `/analytics` | **Overview** — totals, status breakdown, time-series chart data, completion rate, avg completion time |
| 2 | `GET` | `/analytics/fields` | **Field Summaries** — per-question analytics (distributions, top answers, scale stats) |
| 3 | `GET` | `/analytics/fields/:fieldId` | **Field Detail** — paginated individual responses for one question |
| 4 | `GET` | `/analytics/export/csv` | **CSV Export** — download all responses as CSV file |

All paths are relative to `/api/organizations/:orgId/forms/:formId`.

---

## Endpoint 1: Overview

```
GET /api/organizations/:orgId/forms/:formId/analytics
```

**Query params (all optional):**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | `day` \| `week` \| `month` | `day` | Time-series grouping period |
| `days` | number | `30` | How many days back to include |

**Response:**
```json
{
  "success": true,
  "data": {
    "formId": "683f1a2b...",
    "formTitle": "Contact Information",
    "totalResponses": 247,
    "statusBreakdown": {
      "SUCCESS": 240,
      "FAILED": 5,
      "PENDING": 2
    },
    "completionRate": 97.17,
    "averageCompletionTimeSeconds": 45,
    "responsesOverTime": [
      { "date": "2026-02-09", "count": 0 },
      { "date": "2026-02-10", "count": 3 },
      { "date": "2026-02-11", "count": 12 },
      { "date": "2026-02-12", "count": 8 }
    ],
    "recentActivity": {
      "lastResponseAt": "2026-03-10T08:12:00.000Z",
      "responsesToday": 5,
      "responsesThisWeek": 34,
      "responsesThisMonth": 127
    }
  }
}
```

**What to render:**
- Big number cards: total responses, completion rate, avg time
- Line/area chart from `responsesOverTime`
- Status breakdown as pie/donut chart or stat pills
- Recent activity as secondary stats

---

## Endpoint 2: Field Summaries (The Main Analytics View)

```
GET /api/organizations/:orgId/forms/:formId/analytics/fields
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalResponses": 240,
    "fields": [
      {
        "fieldId": "field_0",
        "label": "What is your name?",
        "type": "SHORT_TEXT",
        "required": true,
        "responseCount": 240,
        "skippedCount": 0,
        "summary": {
          "type": "text",
          "responses": [
            { "value": "John", "count": 5 },
            { "value": "Ahmed", "count": 3 },
            { "value": "Sarah", "count": 3 }
          ],
          "uniqueCount": 198,
          "topResponses": [
            { "value": "John", "count": 5 },
            { "value": "Ahmed", "count": 3 },
            { "value": "Sarah", "count": 3 }
          ],
          "totalResponses": 240
        }
      },
      {
        "fieldId": "field_3",
        "label": "Preferred contact method",
        "type": "MULTIPLE_CHOICE",
        "required": true,
        "responseCount": 240,
        "skippedCount": 0,
        "summary": {
          "type": "choice",
          "options": [
            { "value": "Email", "count": 142, "percentage": 59.17 },
            { "value": "Phone", "count": 68, "percentage": 28.33 },
            { "value": "SMS", "count": 30, "percentage": 12.5 }
          ],
          "totalResponses": 240
        }
      },
      {
        "fieldId": "field_4",
        "label": "Which topics interest you?",
        "type": "CHECKBOXES",
        "required": false,
        "responseCount": 220,
        "skippedCount": 20,
        "summary": {
          "type": "multi_choice",
          "options": [
            { "value": "Technology", "count": 180, "percentage": 81.82 },
            { "value": "Sports", "count": 95, "percentage": 43.18 },
            { "value": "Music", "count": 70, "percentage": 31.82 }
          ],
          "averageSelectionsPerResponse": 1.57,
          "totalResponses": 220
        }
      },
      {
        "fieldId": "field_5",
        "label": "Rate our service (1-5)",
        "type": "LINEAR_SCALE",
        "required": true,
        "responseCount": 240,
        "skippedCount": 0,
        "summary": {
          "type": "scale",
          "average": 4.2,
          "median": 4,
          "min": 1,
          "max": 5,
          "distribution": [
            { "value": "1", "count": 5, "percentage": 2.08 },
            { "value": "2", "count": 10, "percentage": 4.17 },
            { "value": "3", "count": 30, "percentage": 12.5 },
            { "value": "4", "count": 95, "percentage": 39.58 },
            { "value": "5", "count": 100, "percentage": 41.67 }
          ],
          "totalResponses": 240
        }
      }
    ]
  }
}
```

### How to render each `summary.type`:

| `summary.type` | Field types | Render as |
|-----------------|-------------|-----------|
| `text` | SHORT_TEXT, DATE, TIME, etc. | Word cloud or top-answers list. Use `topResponses` for the chart, `uniqueCount` for stats. |
| `choice` | MULTIPLE_CHOICE | Pie chart or horizontal bar chart. Each `options[]` entry has `value`, `count`, `percentage`. |
| `multi_choice` | CHECKBOXES | Horizontal bar chart (percentages can exceed 100% because multi-select). Show `averageSelectionsPerResponse`. |
| `scale` | LINEAR_SCALE | Horizontal/vertical bar chart for `distribution[]`. Show `average` and `median` prominently. |

---

## Endpoint 3: Field Detail (Drill-Down)

```
GET /api/organizations/:orgId/forms/:formId/analytics/fields/:fieldId
```

**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `pageSize` | number | `50` | Responses per page |

**Response:**
```json
{
  "success": true,
  "data": {
    "fieldId": "field_0",
    "label": "What is your name?",
    "type": "SHORT_TEXT",
    "totalResponses": 240,
    "responses": [
      {
        "value": "John Doe",
        "rawUserInput": "my name is John Doe",
        "sessionId": "550e8400-e29b-41d4...",
        "submittedAt": "2026-03-10T08:12:00.000Z"
      },
      {
        "value": "Sarah Ahmed",
        "rawUserInput": "Sarah Ahmed",
        "sessionId": "660f9500-f30c-52e5...",
        "submittedAt": "2026-03-10T07:45:00.000Z"
      }
    ],
    "page": 1,
    "pageSize": 50,
    "totalPages": 5
  }
}
```

**Concept:** This is the "Individual Responses" tab for a single question. Shows every answer with:
- `value` — the normalized/clean value that was submitted
- `rawUserInput` — what the user actually typed in the chat
- `sessionId` — links to the full submission record
- `submittedAt` — when

---

## Endpoint 4: CSV Export

```
GET /api/organizations/:orgId/forms/:formId/analytics/export/csv
```

**Response:** Raw CSV file (triggers download).

```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="form-683f1a2b-responses.csv"
```

CSV structure:
```csv
Submission ID,Session ID,Submitted At,What is your name?,Email,Address,Phone number,Comments
683f1b...,c5479234...,2026-03-09T14:00:00Z,hi,no,heheh,ok,ok
683f1c...,e863f793...,2026-03-09T14:05:00Z,Yes,hadiakashif472@gmail.com,164N block Lahore,,
```

**Frontend:** Just point a link/button to this URL with the auth token:
```javascript
window.open(`${BASE}/organizations/${orgId}/forms/${formId}/analytics/export/csv`, '_blank');
// Or use fetch with auth header and create a blob download
```

---

## Quick Integration Example

```javascript
const BASE = 'http://localhost:4000/api';
const ORG_ID = 'your-org-id';
const FORM_ID = 'your-form-id';
const TOKEN = 'your-jwt-token';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};

// 1. Get overview stats
const overview = await fetch(
  `${BASE}/organizations/${ORG_ID}/forms/${FORM_ID}/analytics?period=day&days=30`,
  { headers }
).then(r => r.json());

console.log('Total:', overview.data.totalResponses);
console.log('Completion rate:', overview.data.completionRate + '%');
console.log('Avg time:', overview.data.averageCompletionTimeSeconds + 's');
console.log('Chart data:', overview.data.responsesOverTime);

// 2. Get per-question analytics
const fields = await fetch(
  `${BASE}/organizations/${ORG_ID}/forms/${FORM_ID}/analytics/fields`,
  { headers }
).then(r => r.json());

for (const field of fields.data.fields) {
  console.log(`${field.label} (${field.type})`);
  console.log(`  Responses: ${field.responseCount}, Skipped: ${field.skippedCount}`);

  if (field.summary.type === 'choice') {
    for (const opt of field.summary.options) {
      console.log(`  ${opt.value}: ${opt.count} (${opt.percentage}%)`);
    }
  } else if (field.summary.type === 'scale') {
    console.log(`  Average: ${field.summary.average}, Median: ${field.summary.median}`);
  } else if (field.summary.type === 'text') {
    console.log(`  Unique answers: ${field.summary.uniqueCount}`);
    console.log(`  Top:`, field.summary.topResponses.slice(0, 3));
  }
}

// 3. Drill into one field
const detail = await fetch(
  `${BASE}/organizations/${ORG_ID}/forms/${FORM_ID}/analytics/fields/field_0?page=1&pageSize=20`,
  { headers }
).then(r => r.json());

console.log('Individual responses:', detail.data.responses);

// 4. Download CSV
const csvBlob = await fetch(
  `${BASE}/organizations/${ORG_ID}/forms/${FORM_ID}/analytics/export/csv`,
  { headers }
).then(r => r.blob());

const url = URL.createObjectURL(csvBlob);
const a = document.createElement('a');
a.href = url;
a.download = `responses.csv`;
a.click();
```

---

## Dashboard Page Concept

The analytics page should have **3 tabs** (like Google Forms):

### Tab 1: Summary
- **Top stats row:** Total responses, completion rate, avg completion time, responses today
- **Time-series chart:** Line/area chart of responses per day/week/month (data from overview endpoint)
- **Per-question cards:** Loop through `fields` array, render appropriate chart per `summary.type`

### Tab 2: Question-by-Question
- Click on any question card → drill-down with paginated responses (field detail endpoint)
- Shows `rawUserInput` alongside `value` so admins can see exactly what users typed vs. what was extracted

### Tab 3: Individual Responses
- Already exists at `GET /api/organizations/:orgId/forms/:formId/responses`
- Browse response-by-response (the current submissions view)

---

## Field Type → Chart Mapping

| Field Type | `summary.type` | Recommended Chart |
|-----------|-----------------|-------------------|
| `SHORT_TEXT` | `text` | Top answers list / word cloud |
| `MULTIPLE_CHOICE` | `choice` | Pie chart or horizontal bar chart |
| `CHECKBOXES` | `multi_choice` | Horizontal bar chart |
| `LINEAR_SCALE` | `scale` | Vertical bar chart + average indicator |
| `DATE` | `text` | Top answers list or date histogram |
| `TIME` | `text` | Top answers list |

---

## Error Responses

| Status | Meaning |
|--------|---------|
| `401` | Not authenticated (missing/invalid JWT) |
| `403` | Not a member of this organization |
| `404` | Form not found in this organization |

```json
{
  "statusCode": 404,
  "message": "Form 683f1a2b not found in organization 582e0a1c"
}
```
