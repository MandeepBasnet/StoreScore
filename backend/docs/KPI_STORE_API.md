# KPI Store API Documentation

## Base URL

```
Development: http://localhost:5000/api
Production:  https://storescore.onrender.com/api
```

---

## Endpoints

### Get Store KPI Data

```
GET /kpi/store/{storeId}
```

Retrieve KPI data for a specific store with configurable view modes.

#### Parameters

| Name | Type | In | Required | Description |
|------|------|-----|----------|-------------|
| `storeId` | string | path | Yes | Appwrite document ID of the store |
| `view` | string | query | No | `daily` (default) or `weekly` |
| `year` | number | query | No | Year for filtering (default: current year) |
| `month` | number | query | No | Month for filtering, 0-indexed (default: current month) |

---

## Daily View

**Request:**
```
GET /kpi/store/{storeId}?view=daily
```

**Response:**
```json
{
  "success": true,
  "view": "daily",
  "data": {
    "store": {
      "id": "694164520030f1944aff",
      "name": "Downtown Store",
      "location": "123 Main St"
    },
    "target": {
      "score": 28.0,
      "warning": 26.0,
      "critical": 24.0
    },
    "today": {
      "date": "2024-12-22",
      "score": 27.5,
      "target": 28.0,
      "status": "warning",
      "vsTarget": -0.5
    },
    "weekly": {
      "average": 27.8,
      "entries": 5,
      "metCount": 4,
      "missedCount": 1
    },
    "monthly": {
      "average": 27.5,
      "entries": 22,
      "metCount": 18,
      "missedCount": 4,
      "streak": 5
    }
  }
}
```

---

## Weekly View

**Request:**
```
GET /kpi/store/{storeId}?view=weekly
```

**Response:**
```json
{
  "success": true,
  "view": "weekly",
  "data": {
    "store": { "id": "...", "name": "Downtown Store" },
    "target": { "score": 28.0, "warning": 26.0, "critical": 24.0 },
    "currentWeek": {
      "range": "Dec 16 - Dec 22",
      "average": 27.8,
      "entries": 5,
      "metCount": 4,
      "missedCount": 1,
      "entries": [
        { "date": "2024-12-22", "score": 27.5, "status": "warning", "target": 28.0 },
        { "date": "2024-12-21", "score": 28.5, "status": "met", "target": 28.0 }
      ]
    },
    "pastWeek": {
      "range": "Dec 9 - Dec 15",
      "average": 27.2,
      "entries": 7,
      "metCount": 5,
      "missedCount": 2,
      "entries": [...]
    },
    "monthly": {
      "average": 27.5,
      "entries": 22,
      "metCount": 18,
      "missedCount": 4,
      "streak": 5
    }
  }
}
```

---

## Status Values

| Status | Meaning |
|--------|---------|
| `met` | Score >= Target |
| `warning` | Score >= Warning Threshold but < Target |
| `missed` | Score < Warning Threshold |

---

## Error Responses

### Store Not Found (404)
```json
{
  "success": false,
  "error": "Store not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": "Error message details"
}
```

---

## Examples

### Daily KPI (Default)
```bash
curl http://localhost:5000/api/kpi/store/694164520030f1944aff
```

### Weekly KPI
```bash
curl http://localhost:5000/api/kpi/store/694164520030f1944aff?view=weekly
```

### Specific Month (November 2024)
```bash
curl "http://localhost:5000/api/kpi/store/694164520030f1944aff?year=2024&month=10"
```

---

## Integration Examples

### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:5000/api/kpi/store/694164520030f1944aff?view=weekly');
const data = await response.json();
console.log(data.data.currentWeek.average);
```

### Xibo CMS DataSet
```
URL: https://storescore.onrender.com/api/kpi/store/{storeId}?view=daily
Method: GET
```
