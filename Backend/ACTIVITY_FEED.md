# Activity Feed Feature Documentation

## Overview
A complete activity feed system that tracks important platform events. Admins can view what's happening on the platform in real-time.

## Features Implemented

### 1. **Activity Model** (`src/modules/activity/model/activity.model.ts`)
- Tracks 10 different activity types:
  - `USER_REGISTERED` - New user registrations
  - `USER_ACTIVATED` - User activations
  - `USER_DEACTIVATED` - User deactivations
  - `SESSION_CREATED` - Session created
  - `SESSION_COMPLETED` - Session marked complete
  - `SESSION_CANCELLED` - Session cancelled
  - `PAYMENT_GENERATED` - Payment/invoice created
  - `PAYMENT_COMPLETED` - Payment completed
  - `ORGANIZATION_CREATED` - Organization created
  - `ORGANIZATION_UPDATED` - Organization updated

- Stores metadata including:
  - Organization ID
  - User information (ID, name, email, role)
  - Related entity IDs (session, payment)
  - Amount (for payments)
  - Custom metadata object
  - Timestamps

### 2. **Activity Service** (`src/modules/activity/services/activityService.ts`)
Static methods:
- `logActivity()` - Log a new activity event
- `getOrganizationActivities()` - Get activities for a specific organization
- `getAllActivities()` - Get all activities (super admin view)
- `getActivityStats()` - Get activity statistics grouped by type

Features:
- Pagination support (limit, skip)
- Optional filtering by activity type
- Date range filtering (startDate, endDate)
- Lean queries for performance
- Aggregation for statistics

### 3. **Activity Controller** (`src/modules/activity/controller/activityController.ts`)
Endpoints:
- **GET /admin/activity** - Get activity feed
- **GET /admin/activity/stats** - Get activity statistics

Query Parameters:
- `limit` (default: 50, max: 100) - Number of records per page
- `skip` (default: 0) - Pagination offset
- `activityType` (optional) - Filter by activity type
- `startDate` (optional) - Filter from date (ISO string)
- `endDate` (optional) - Filter to date (ISO string)

Authentication:
- Requires admin or manager role
- Managers see only their organization's activities
- Super admins see all activities

Response Format:
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "organizationId": "...",
      "activityType": "SESSION_CREATED",
      "userId": "...",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "userRole": "coach",
      "description": "Session created with Coach John and Entrepreneur Jane",
      "createdAt": "2025-12-09T10:30:00Z",
      "metadata": {...}
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "skip": 0,
    "hasMore": true
  }
}
```

### 4. **Integrated Activity Logging**

Activity logging has been integrated into:

#### Authentication (User Registration)
- File: `src/modules/auth/service/authService.ts`
- Logs: `USER_REGISTERED`
- Captures: user email, name, role, organization

#### Session Management
- File: `src/routes/sessions/routes.ts`
- Logs: `SESSION_CREATED`
- Captures: coach/entrepreneur names, scheduled date

- File: `src/routes/sessions/[sessionId]/status/routes.ts`
- Logs: `SESSION_COMPLETED`, `SESSION_CANCELLED`
- Captures: status change metadata

#### Payments
- File: `src/routes/payments/routes.ts`
- Logs: `PAYMENT_GENERATED`
- Captures: invoice number, coach name, amount, session count

## API Examples

### Get Recent Activities
```bash
curl -X GET "http://localhost:3000/api/admin/activity?limit=20&skip=0" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Activity Type
```bash
curl -X GET "http://localhost:3000/api/admin/activity?activityType=SESSION_CREATED" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Date Range
```bash
curl -X GET "http://localhost:3000/api/admin/activity?startDate=2025-12-01&endDate=2025-12-09" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Activity Statistics
```bash
curl -X GET "http://localhost:3000/api/admin/activity/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "USER_REGISTERED": 5,
    "SESSION_CREATED": 12,
    "SESSION_COMPLETED": 8,
    "PAYMENT_GENERATED": 3
  }
}
```

## Database Indexes
Optimized with compound indexes for fast queries:
- `organizationId + createdAt` (descending)
- `activityType + createdAt` (descending)

## Error Handling
- **401 Unauthorized** - Missing/invalid token
- **403 Forbidden** - Insufficient permissions (not admin/manager)
- **400 Bad Request** - Invalid query parameters
- **500 Internal Server Error** - Server error

## File Structure
```
src/modules/activity/
├── model/
│   ├── activity.model.ts      # Mongoose schema
│   └── index.ts
├── services/
│   ├── activityService.ts     # Business logic
│   └── index.ts
├── controller/
│   ├── activityController.ts  # HTTP endpoints
│   └── index.ts
└── index.ts

src/routes/admin/
├── routes.ts                   # Admin routes
└── index.ts
```

## Future Enhancements
- Activity export to CSV/PDF
- Real-time activity notifications via WebSocket
- Activity analytics dashboard
- Activity search with full-text search
- Activity archival/retention policies
- Activity filtering by multiple roles
- Bulk activity operations
