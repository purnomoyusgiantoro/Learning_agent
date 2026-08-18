# Learning Agent API Contract & Specification

**Version:** `1.0.0`  
**Base URLs:** `/api` and `/api/v1`  
**Auth Mechanism:** Bearer Token (JWT) in Header `Authorization: Bearer <token>`

---

## 1. Authentication & Security

All protected endpoints require a valid JWT token in the Authorization header:
```http
Authorization: Bearer <jwt_token>
```
If the token is missing, invalid, or expired, the API responds with `401 Unauthorized`.
If the user attempts to access or mutate a resource owned by another user without elevated role permissions (`admin` or `agent_manager`), the API responds with `403 Forbidden` (IDOR Protection).

---

## 2. Authentication Endpoints

### 2.1 `POST /api/auth/login` (Alias: `POST /api/login`)
Authenticates user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "1",
      "email": "user@example.com",
      "name": "User Name",
      "role": "user"
    },
    "token": "<jwt_access_token>",
    "refreshToken": "<jwt_refresh_token>"
  }
}
```

### 2.2 `POST /api/auth/register` (Alias: `POST /api/register`)
Registers a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "id": "4",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

### 2.3 `POST /api/auth/refresh` (Alias: `POST /api/refresh`)
Refreshes access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "<jwt_refresh_token>"
}
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Token berhasil diperbarui",
  "data": {
    "user": { "id": "1", "email": "user@example.com", "name": "User Name", "role": "user" },
    "token": "<new_jwt_access_token>",
    "refreshToken": "<new_jwt_refresh_token>"
  }
}
```

### 2.4 `GET /api/auth/profile` (Alias: `GET /api/profile`)
Retrieves current authenticated user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Profil pengguna berhasil diambil",
  "data": {
    "id": "1",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user",
    "created_at": "2026-08-01T00:00:00.000Z"
  }
}
```

---

## 3. Core Learning Agent Endpoints

### 3.1 `GET /api/v1/agents`
Retrieves list of agents created by or accessible to the user.

**Query Parameters:**
- `status`: `IDLE` | `RUNNING` | `LEARNING` | `ERROR` | `PAUSED`
- `model`: Model filter string (e.g. `gpt-4o`, `qwen-2.5`)
- `search`: Search keyword in agent name or description
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Daftar konfigurasi agen berhasil diambil",
  "data": [
    {
      "id": "agent-rl-001",
      "user_id": "1",
      "name": "Q-Learning Grid Navigator",
      "description": "Autonomous grid navigation agent optimizing path reward.",
      "model": "q-learning-v1",
      "temperature": 0.7,
      "max_tokens": 2048,
      "status": "IDLE",
      "created_at": "2026-08-15T10:00:00.000Z",
      "updated_at": "2026-08-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### 3.2 `POST /api/v1/agents`
Initializes a new Learning Agent configuration.

**Request Body:**
```json
{
  "name": "Autonomous Code Optimizer Agent",
  "description": "Multi-agent optimizer for code refactoring and QA verification",
  "model": "claude-3-5-sonnet",
  "system_prompt": "You are an autonomous learning agent optimizing system performance.",
  "temperature": 0.7,
  "max_tokens": 4096,
  "learning_rate": 0.01,
  "discount_factor": 0.95,
  "exploration_rate": 0.15
}
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Konfigurasi agen berhasil dibuat",
  "data": {
    "id": "agent-1755500000000-abc123",
    "user_id": "1",
    "name": "Autonomous Code Optimizer Agent",
    "model": "claude-3-5-sonnet",
    "status": "IDLE",
    "created_at": "2026-08-18T10:00:00.000Z"
  }
}
```

### 3.3 `GET /api/v1/agents/:id`
Retrieves agent configuration, performance metrics, and latest task.

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Detail konfigurasi agen berhasil diambil",
  "data": {
    "id": "agent-rl-001",
    "user_id": "1",
    "name": "Q-Learning Grid Navigator",
    "model": "q-learning-v1",
    "status": "IDLE",
    "metrics": {
      "total_executions": 12,
      "success_rate": 91.67,
      "avg_latency_ms": 115.4,
      "current_loss": 0.012,
      "current_reward": 50.0
    },
    "latest_task": {
      "id": "exec-initial-001",
      "status": "SUCCESS",
      "duration_ms": 124,
      "created_at": "2026-08-18T09:05:00.000Z"
    }
  }
}
```

### 3.4 `PATCH /api/v1/agents/:id` (or `PUT /api/v1/agents/:id`)
Updates agent hyperparameters or configuration metadata.

**Request Body:**
```json
{
  "temperature": 0.5,
  "exploration_rate": 0.05
}
```

### 3.5 `DELETE /api/v1/agents/:id`
Deletes the agent configuration.

### 3.6 `POST /api/v1/agents/:id/execute`
Triggers an iterative learning/task execution loop.

**Request Body:**
```json
{
  "prompt": "Optimize database query cache and calculate optimal eviction policy",
  "iterations": 5,
  "parameters": {
    "learning_rate": 0.01,
    "discount_factor": 0.95
  }
}
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Eksekusi agen berhasil",
  "data": {
    "execution_id": "exec-1755500000000-xyz789",
    "agent_id": "agent-rl-001",
    "status": "SUCCESS",
    "iterations": 5,
    "duration_ms": 142,
    "output": {
      "message": "Eksekusi proses pembelajaran agen selesai",
      "total_iterations": 5,
      "final_loss": 0.0124,
      "total_reward": 48.65,
      "convergence_achieved": true
    }
  }
}
```

### 3.7 `GET /api/v1/agents/:id/status`
Returns real-time execution status, active task, and metrics overview.

### 3.8 `GET /api/v1/agents/:id/logs`
Returns step-by-step learning iteration logs and observations.

### 3.9 `GET /api/v1/agents/:id/metrics`
Returns historical loss curve, reward history, success rate, and latency.

---

## 4. Utility & Health Endpoints

### 4.1 `GET /api/health`
Liveness and readiness probe reporting server health, uptime, memory, and service states.

**Response (`200 OK`):**
```json
{
  "status": "ok",
  "message": "Backend server is running",
  "liveness": true,
  "readiness": true,
  "timestamp": "2026-08-18T17:25:00.000Z",
  "uptime_seconds": 120,
  "services": {
    "database": "up",
    "auth": "up",
    "learning_agent_engine": "up",
    "todos": "up"
  }
}
```

---

## 5. Todos Management Endpoints

Full CRUD support on `/api/v1/todos` (List, Detail, Create, Update, Delete) with IDOR protection and Rate Limiting.
