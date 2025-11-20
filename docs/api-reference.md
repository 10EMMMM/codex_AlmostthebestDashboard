# API Reference

Complete API documentation for Almost The Best Dashboard.

## Base URL
```
http://localhost:3000/api  (development)
https://your-domain.com/api  (production)
```

## Authentication

All admin API routes require:
1. Valid Supabase session
2. `is_super_admin: true` in user's `app_metadata`

### Authorization Header
```typescript
const { data: { session } } = await supabase.auth.getSession();

const response = await fetch('/api/admin/endpoint', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## Admin Routes

### Create User
Create a new user with roles and city assignments.

**Endpoint:** `POST /api/admin/create-user`

**Request Body:**
```typescript
{
  email: string;
  password: string;
  roles: string[];  // ["ACCOUNT_MANAGER", "BDR", "TEAM_LEAD"]
  display_name?: string;
  timezone?: string;
  city_ids?: string[];  // For Account Managers
}
```

**Response:**
```typescript
{
  user: {
    id: string;
    email: string;
  };
  profile: {
    user_id: string;
    display_name: string;
  };
}
```

**Error Responses:**
- `400` - Missing required fields
- `401` - Unauthorized (not super admin)
- `500` - Server error

**Example:**
```typescript
const response = await fetch('/api/admin/create-user', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    roles: ['ACCOUNT_MANAGER'],
    display_name: 'John Doe',
    timezone: 'America/New_York',
    city_ids: ['city-uuid-1', 'city-uuid-2']
  })
});

const data = await response.json();
```

---

### Get Users
Retrieve all users with their profiles and roles.

**Endpoint:** `GET /api/admin/get-users`

**Response:**
```typescript
{
  users: Array<{
    id: string;
    email: string;
    display_name?: string;
    roles?: string[];
    city_ids?: string[];
    city_names?: string[];
    onboards?: number;
    requestsAssigned?: number;
  }>;
}
```

**Example:**
```typescript
const response = await fetch('/api/admin/get-users', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  }
});

const { users } = await response.json();
```

---

### Update Profile
Update user profile information.

**Endpoint:** `POST /api/admin/update-profile`

**Request Body:**
```typescript
{
  user_id: string;
  display_name?: string;
  timezone?: string;
  city_id?: string;
}
```

**Response:**
```typescript
{
  profile: {
    user_id: string;
    display_name: string;
    timezone: string;
    city_id: string;
  };
}
```

---

### Assign Role
Add a role to a user.

**Endpoint:** `POST /api/admin/assign-role`

**Request Body:**
```typescript
{
  user_id: string;
  role: string;  // "ACCOUNT_MANAGER" | "BDR" | "TEAM_LEAD"
}
```

**Response:**
```typescript
{
  role: {
    id: string;
    user_id: string;
    role: string;
    assigned_at: string;
  };
}
```

---

### Remove Role
Remove a role from a user.

**Endpoint:** `POST /api/admin/remove-role`

**Request Body:**
```typescript
{
  user_id: string;
  role: string;
}
```

**Response:**
```typescript
{
  success: boolean;
}
```

---

### Archive User
Soft-delete a user (can be restored).

**Endpoint:** `POST /api/admin/archive-user`

**Request Body:**
```typescript
{
  user_id: string;
  reason?: string;
}
```

**Response:**
```typescript
{
  archived: {
    id: string;
    original_user_id: string;
    archived_at: string;
  };
}
```

---

### Delete User
Permanently delete a user.

**Endpoint:** `POST /api/admin/delete-user`

**Request Body:**
```typescript
{
  user_id: string;
  reason?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
}
```

**Warning:** This action is irreversible.

---

### Account Manager Cities
Manage city assignments for Account Managers.

**Endpoint:** `GET /api/admin/account-manager-cities?user_id={uuid}`

**Response:**
```typescript
{
  cities: Array<{
    id: string;
    city_id: string;
    city_name: string;
    state_code: string;
  }>;
}
```

**Endpoint:** `POST /api/admin/account-manager-cities`

**Request Body:**
```typescript
{
  user_id: string;
  city_ids: string[];  // Replaces all existing assignments
}
```

---

### Get BDRs
Retrieve all users with BDR role.

**Endpoint:** `GET /api/admin/bdrs`

**Response:**
```typescript
{
  bdrs: Array<{
    id: string;
    email: string;
    display_name: string;
    active_tasks: number;
    completed_this_week: number;
  }>;
}
```

---

### Get Account Managers
Retrieve all users with Account Manager role.

**Endpoint:** `GET /api/admin/account-managers`

**Response:**
```typescript
{
  managers: Array<{
    id: string;
    email: string;
    display_name: string;
    city_count: number;
    request_count: number;
  }>;
}
```

---

## Request Routes

### Create Request
Create a new request (Account Managers only).

**Endpoint:** `POST /api/admin/create-request`

**Request Body:**
```typescript
{
  request_type: "RESTAURANT" | "EVENT" | "CUISINE";
  title: string;
  description: string;
  city_id: string;
  budget?: number;
  deadline?: string;  // ISO date
}
```

**Response:**
```typescript
{
  request: {
    id: string;
    request_type: string;
    title: string;
    status: string;
    created_at: string;
  };
}
```

---

### Update Request
Update request details.

**Endpoint:** `POST /api/admin/update-request`

**Request Body:**
```typescript
{
  request_id: string;
  title?: string;
  description?: string;
  status?: string;
  budget?: number;
  deadline?: string;
}
```

---

### Get Request Assignments
Retrieve assignments for a request.

**Endpoint:** `GET /api/admin/request-assignments?request_id={uuid}`

**Response:**
```typescript
{
  assignments: Array<{
    id: string;
    user_id: string;
    user_name: string;
    role: string;
    assigned_at: string;
  }>;
}
```

**Endpoint:** `POST /api/admin/request-assignments`

**Request Body:**
```typescript
{
  request_id: string;
  user_id: string;
  role: string;
}
```

---

## Restaurant Routes

### Import Restaurants
Bulk import restaurants from CSV.

**Endpoint:** `POST /api/admin/restaurants/import`

**Request Body:**
```typescript
{
  restaurants: Array<{
    name: string;
    city_id: string;
    address?: string;
    phone?: string;
  }>;
}
```

**Response:**
```typescript
{
  imported: number;
  failed: number;
  errors?: string[];
}
```

---

## Insights Routes

### Get Dashboard Insights
Retrieve system-wide analytics.

**Endpoint:** `GET /api/admin/insights`

**Response:**
```typescript
{
  total_users: number;
  total_requests: number;
  active_bdrs: number;
  pending_onboards: number;
  monthly_metrics: {
    tasks_completed: number;
    onboards_completed: number;
    avg_completion_days: number;
  };
}
```

---

## Bootstrap Routes

### Bootstrap Super Admin
Create initial super admin user (development only).

**Endpoint:** `POST /api/admin/bootstrap`

**Response:**
```typescript
{
  status: "created" | "existing";
  userId: string;
  email: string;
  message: string;
  connection: string;
}
```

**Note:** This route is typically only used during initial setup.

---

### Bootstrap Normal User
Create a test user from environment variables.

**Endpoint:** `POST /api/admin/bootstrap-user`

**Response:**
```typescript
{
  status: "created" | "existing";
  userId: string;
  email: string;
}
```

---

## Error Handling

All API routes follow consistent error response format:

```typescript
{
  error: string;  // Error message
  details?: any;  // Additional error details
}
```

### Common Error Codes
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not super admin)
- `404` - Not Found
- `500` - Internal Server Error

### Example Error Handling
```typescript
try {
  const response = await fetch('/api/admin/create-user', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  const data = await response.json();
  return data;
} catch (error) {
  console.error('API Error:', error);
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive"
  });
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production:

```typescript
// Example with next-rate-limit
import rateLimit from 'next-rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function POST(request: Request) {
  try {
    await limiter.check(request, 10, 'CACHE_TOKEN'); // 10 requests per minute
    // ... rest of handler
  } catch {
    return new Response('Rate limit exceeded', { status: 429 });
  }
}
```

---

## Related Documentation

- [Development Guide](./development-guide.md) - UI patterns and components
- [Database Schema](./database-schema.md) - Table structures
- [Authentication Guide](./authentication.md) - Auth flows
