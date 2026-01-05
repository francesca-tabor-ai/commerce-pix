# Logging and Observability Documentation

Comprehensive logging system with request tracing, structured logs, and detailed error tracking.

## Overview

The CommercePix logging system provides:
- **Request ID Tracking**: Trace requests across logs and services
- **Structured Logging**: JSON-formatted logs in production, human-readable in development
- **Detailed Error Storage**: Job errors stored in DB with full context
- **User-Friendly Error Display**: Error details dialog in UI with copy/support actions

---

## Request ID System

### How It Works

Every request is assigned a unique Request ID for tracing.

**Flow:**
1. Request enters middleware
2. Check if `x-request-id` header exists
3. If not, generate new 16-character hex ID
4. Add to request headers
5. Add to response headers (visible to client)
6. Use throughout request lifecycle for logging

### Request ID Functions

```typescript
// lib/request-context.ts

// Generate a new request ID
const requestId = generateRequestId()
// Returns: "a1b2c3d4e5f67890"

// Get request ID from current request (async)
const requestId = await getRequestId()
// Returns existing or generates new ID
```

### Middleware Integration

```typescript
// middleware.ts
import { generateRequestId } from '@/lib/request-context'

export async function middleware(request: NextRequest) {
  // Generate or get request ID
  const requestId = request.headers.get('x-request-id') || generateRequestId()
  
  // Add to request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-request-id', requestId)
  
  // Create response with request ID
  let response = NextResponse.next({
    request: { headers: requestHeaders },
  })
  
  // Add to response headers (visible to client)
  response.headers.set('x-request-id', requestId)
  
  // ... rest of middleware
}
```

---

## Structured Logging

### Logger API

```typescript
// lib/logger.ts

import { logger, createContextLogger } from '@/lib/logger'

// Basic logging
logger.info('User logged in', { userId: '123', email: 'user@example.com' })
logger.warn('Rate limit approaching', { current: 95, limit: 100 })
logger.error('Generation failed', { jobId: 'abc123' }, error)

// Context logger (pre-fills context)
const log = createContextLogger({ requestId, endpoint: '/api/generate' })
log.info('Request received')
log.error('Processing failed', error)
```

### Log Levels

| Level | When to Use | Output |
|-------|-------------|--------|
| `debug` | Development debugging, verbose details | console.debug |
| `info` | Normal operations, key events | console.log |
| `warn` | Warnings, recoverable issues | console.warn |
| `error` | Errors, failures, exceptions | console.error |

### Log Format

**Development:**
```
[2026-01-05T10:30:15.123Z] INFO User authenticated | requestId=a1b2c3d4e5f67890 | userId=user-123
```

**Production (JSON):**
```json
{
  "timestamp": "2026-01-05T10:30:15.123Z",
  "level": "info",
  "message": "User authenticated",
  "context": {
    "requestId": "a1b2c3d4e5f67890",
    "userId": "user-123"
  }
}
```

### Context Logger

Create a logger with pre-filled context for consistent logging in a request:

```typescript
// In API route
export async function POST(request: NextRequest) {
  const requestId = await getRequestId()
  const log = createContextLogger({ 
    requestId, 
    endpoint: '/api/generate',
    userId: user.id 
  })
  
  log.info('Generation request received')
  // Outputs: [timestamp] INFO Generation request received | requestId=... | endpoint=/api/generate | userId=...
  
  log.debug('Rate limit check completed', { allowed: true })
  // Outputs: [timestamp] DEBUG Rate limit check completed | requestId=... | endpoint=/api/generate | userId=... | allowed=true
  
  log.error('Generation failed', error)
  // Outputs: [timestamp] ERROR Generation failed | requestId=... | endpoint=/api/generate | userId=... | Error: {...}
}
```

---

## Generation Error Tracking

### Error Storage in Database

When a generation job fails, detailed error information is stored in the `generation_jobs` table.

**Error Structure (JSON string in `error` column):**

```json
{
  "message": "Failed to download input image from storage",
  "stack": "Error: Failed to download input image from storage\n    at processGeneration (/app/api/generate/route.ts:337:13)\n    at async POST (/app/api/generate/route.ts:250:5)",
  "timestamp": "2026-01-05T10:35:22.456Z",
  "mode": "main_white",
  "userId": "user-123",
  "requestId": "a1b2c3d4e5f67890"
}
```

### Error Storage Implementation

```typescript
// app/api/generate/route.ts

async function processGeneration(..., requestId: string) {
  const log = createContextLogger({ requestId, jobId, userId, mode })
  
  try {
    // Generation logic...
    log.info('Generation job completed successfully', {
      jobId,
      outputAssetId: outputAsset.id,
      creditsSpent: 1,
    })
  } catch (error) {
    log.error('Generation job failed', error instanceof Error ? error : new Error(String(error)))

    const errorMessage = error instanceof Error ? error.message : 'Unknown generation error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    // Build detailed error info for DB
    const detailedError = JSON.stringify({
      message: errorMessage,
      stack: errorStack?.split('\n').slice(0, 10).join('\n'), // Limit stack length
      timestamp: new Date().toISOString(),
      mode,
      userId,
      requestId,
    })

    // Store in database
    await updateGenerationJob(jobId, {
      status: 'failed',
      error: detailedError,
    })

    log.warn('Job marked as failed, credits NOT spent', { jobId, errorMessage })
  }
}
```

---

## Error Details UI

### ErrorDetailsDialog Component

User-friendly modal displaying error details with support actions.

**Features:**
- Parse JSON error details
- Display error message prominently
- Show metadata (timestamp, mode, request ID, job ID)
- Display stack trace (if available)
- Copy error details to clipboard
- Link to support/help page

**Usage:**

```tsx
import { ErrorDetailsDialog } from '@/components/ErrorDetailsDialog'

<ErrorDetailsDialog
  error={job.error}
  jobId={job.id}
  trigger={
    <Button variant="outline" size="sm">
      View Error Details
    </Button>
  }
/>
```

**What Users See:**

```
┌─────────────────────────────────────────┐
│ ⚠️ Generation Error Details            │
├─────────────────────────────────────────┤
│                                         │
│ Error Message                           │
│ Failed to download input image          │
│                                         │
│ Occurred At: Jan 5, 2026, 10:35 AM     │
│ Generation Mode: main_white             │
│ Request ID: a1b2c3d4e5f67890            │
│ Job ID: job-abc123                      │
│                                         │
│ Common Solutions:                       │
│ • Try generating again                  │
│ • Check image quality                   │
│ • Contact support with Request ID       │
│                                         │
│ [Copy Error Details] [Contact Support]  │
└─────────────────────────────────────────┘
```

### Integration in GenerationProgress

```tsx
// components/GenerationProgress.tsx

{job.status === 'failed' && job.error && (
  <div className="space-y-3">
    <div className="p-3 bg-destructive/10 rounded-md">
      <p className="text-sm text-destructive font-medium mb-2">
        Job failed — Something went wrong during generation
      </p>
      <ErrorDetailsDialog
        error={job.error}
        jobId={job.id}
        trigger={
          <Button variant="outline" size="sm" className="w-full">
            View Error Details
          </Button>
        }
      />
    </div>
  </div>
)}
```

---

## Logging in API Routes

### Best Practices

1. **Create context logger at route entry:**

```typescript
export async function POST(request: NextRequest) {
  const requestId = await getRequestId()
  const log = createContextLogger({ requestId, endpoint: '/api/generate' })
  
  log.info('Generation request received')
  // ... rest of handler
}
```

2. **Log key events:**

```typescript
log.info('User authenticated', { userId: user.id, userEmail: user.email })
log.debug('Rate limit check completed', { allowed: true, blockedBy: null })
log.info('Generation job created', { jobId: job.id, mode })
log.warn('Rate limit exceeded', { userId, blockedBy: 'per_minute', limit: 5 })
```

3. **Log errors with context:**

```typescript
try {
  // ... operation
} catch (error) {
  log.error('Operation failed', { operation: 'generate' }, error)
  // or
  log.error('Operation failed', error)
}
```

4. **Include request ID in async operations:**

```typescript
processGeneration(jobId, inputAsset, mode, promptInputs, promptVersion, user.id, requestId)
```

### Example: Full /api/generate Logging

```typescript
export async function POST(request: NextRequest) {
  const requestId = await getRequestId()
  const log = createContextLogger({ requestId, endpoint: '/api/generate' })
  
  log.info('Generation request received')
  
  try {
    const user = await requireUser()
    log.info('User authenticated', { userId: user.id, userEmail: user.email })

    const rateLimitCheck = await checkAllRateLimits(user.id)
    log.debug('Rate limit check completed', { allowed: rateLimitCheck.allowed })

    if (!rateLimitCheck.allowed) {
      log.warn('Rate limit exceeded', {
        userId: user.id,
        blockedBy: rateLimitCheck.blockedBy,
      })
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    // ... create job
    log.info('Generation job created', { jobId: job.id, mode })
    
    // Start async processing
    log.info('Starting async generation', { jobId: job.id, mode })
    processGeneration(/* ... */, requestId).catch(error => {
      log.error('Background generation error', error)
    })

    return NextResponse.json({ job })
  } catch (error) {
    log.error('Generate API error', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

---

## Request Tracing Example

### Trace a Request Through Logs

**Request:** `POST /api/generate`

**Request ID:** `a1b2c3d4e5f67890`

**Log Output:**

```
[2026-01-05T10:30:15.123Z] INFO Generation request received | requestId=a1b2c3d4e5f67890 | endpoint=/api/generate
[2026-01-05T10:30:15.234Z] INFO User authenticated | requestId=a1b2c3d4e5f67890 | endpoint=/api/generate | userId=user-123 | userEmail=user@example.com
[2026-01-05T10:30:15.345Z] DEBUG Rate limit check completed | requestId=a1b2c3d4e5f67890 | endpoint=/api/generate | allowed=true | blockedBy=null
[2026-01-05T10:30:15.456Z] INFO Generation job created | requestId=a1b2c3d4e5f67890 | endpoint=/api/generate | jobId=job-abc123 | mode=main_white
[2026-01-05T10:30:15.567Z] INFO Starting async generation | requestId=a1b2c3d4e5f67890 | endpoint=/api/generate | jobId=job-abc123 | mode=main_white
[2026-01-05T10:30:15.678Z] INFO Starting generation job | requestId=a1b2c3d4e5f67890 | jobId=job-abc123 | userId=user-123 | mode=main_white
[2026-01-05T10:30:15.789Z] DEBUG Job status updated to running | requestId=a1b2c3d4e5f67890 | jobId=job-abc123 | userId=user-123 | mode=main_white
[2026-01-05T10:30:15.890Z] DEBUG Prompt built | requestId=a1b2c3d4e5f67890 | jobId=job-abc123 | userId=user-123 | mode=main_white | hasWarnings=false
[2026-01-05T10:30:32.123Z] INFO Generation job completed successfully | requestId=a1b2c3d4e5f67890 | jobId=job-abc123 | userId=user-123 | mode=main_white | outputAssetId=asset-xyz789 | creditsSpent=1
```

**Benefits:**
- Search logs by `requestId=a1b2c3d4e5f67890` to see entire request flow
- Identify exactly where in the process something went wrong
- Correlate client-side and server-side errors
- Debug production issues with full context

---

## Error Scenarios

### Scenario 1: Generation Failure

**Trigger:** OpenAI API error during image generation

**Logged:**
```
[2026-01-05T10:35:22.456Z] ERROR Generation job failed | requestId=a1b2c3d4e5f67890 | jobId=job-abc123 | userId=user-123 | mode=main_white | Error: { message: "OpenAI API error: 500", stack: "..." }
[2026-01-05T10:35:22.567Z] WARN Job marked as failed, credits NOT spent | requestId=a1b2c3d4e5f67890 | jobId=job-abc123 | userId=user-123 | mode=main_white | errorMessage=OpenAI API error: 500
```

**Stored in DB:**
```json
{
  "message": "OpenAI API error: 500",
  "stack": "Error: OpenAI API error: 500\n    at ...",
  "timestamp": "2026-01-05T10:35:22.456Z",
  "mode": "main_white",
  "userId": "user-123",
  "requestId": "a1b2c3d4e5f67890"
}
```

**User Sees:**
- "Job failed — Something went wrong during generation"
- Button: "View Error Details"
- Modal with full error details and support link

### Scenario 2: Rate Limit Exceeded

**Trigger:** User hits 5 generations/minute limit

**Logged:**
```
[2026-01-05T10:40:15.123Z] WARN Rate limit exceeded | requestId=b2c3d4e5f6g78901 | endpoint=/api/generate | userId=user-123 | blockedBy=per_minute | limit=5 | current=5
```

**User Response:**
```json
{
  "error": "Rate limit exceeded",
  "message": "You've hit the rate limit...",
  "code": "RATE_LIMIT_EXCEEDED",
  "rateLimit": { ... }
}
```

---

## Monitoring and Debugging

### Search Logs by Request ID

**Production (JSON logs):**
```bash
# Search logs for specific request
cat logs/app.log | grep "a1b2c3d4e5f67890"

# Parse JSON and filter
cat logs/app.log | jq 'select(.context.requestId == "a1b2c3d4e5f67890")'
```

**Development:**
```bash
# Search console output
tail -f console.log | grep "requestId=a1b2c3d4e5f67890"
```

### Common Log Queries

**Find all errors:**
```bash
cat logs/app.log | jq 'select(.level == "error")'
```

**Find errors for specific user:**
```bash
cat logs/app.log | jq 'select(.level == "error" and .context.userId == "user-123")'
```

**Find rate limit warnings:**
```bash
cat logs/app.log | jq 'select(.level == "warn" and .message | contains("Rate limit"))'
```

**Count errors by message:**
```bash
cat logs/app.log | jq -r 'select(.level == "error") | .message' | sort | uniq -c | sort -rn
```

---

## Support Workflow

### User Reports Issue

1. **User sees error in UI:**
   - "Job failed — Something went wrong"
   - Clicks "View Error Details"

2. **User copies error details:**
   - Includes Request ID, Job ID, timestamp, error message
   - Clicks "Copy Error Details"

3. **User contacts support:**
   - Provides Request ID: `a1b2c3d4e5f67890`
   - Provides Job ID: `job-abc123`

4. **Support searches logs:**
   ```bash
   cat logs/app.log | grep "a1b2c3d4e5f67890"
   ```

5. **Support sees full context:**
   - All events in that request
   - Exact error with stack trace
   - User info, mode, inputs
   - Timing of each step

6. **Support resolves issue:**
   - Identifies root cause from logs
   - Provides solution to user
   - Files bug if needed (with Request ID for reproduction)

---

## Best Practices

### DO ✅

1. **Always create context logger with requestId:**
   ```typescript
   const log = createContextLogger({ requestId, endpoint: '/api/generate' })
   ```

2. **Log at key lifecycle points:**
   - Request received
   - User authenticated
   - Rate limit checked
   - Job created
   - Job completed/failed

3. **Include relevant context:**
   ```typescript
   log.info('Job created', { jobId, mode, userId })
   ```

4. **Log errors with full context:**
   ```typescript
   log.error('Operation failed', { operation: 'generate', jobId }, error)
   ```

5. **Store detailed errors in DB:**
   - Full error message
   - Stack trace (limited)
   - Timestamp
   - Request ID
   - User context

### DON'T ❌

1. **Don't log sensitive data:**
   ```typescript
   // ❌ Bad
   log.info('User login', { password: user.password })
   
   // ✅ Good
   log.info('User login', { userId: user.id })
   ```

2. **Don't log huge objects:**
   ```typescript
   // ❌ Bad
   log.debug('Full request', { body: hugeObject })
   
   // ✅ Good
   log.debug('Request received', { bodySize: JSON.stringify(body).length })
   ```

3. **Don't skip error logging:**
   ```typescript
   // ❌ Bad
   try {
     // ...
   } catch (error) {
     // silent fail
   }
   
   // ✅ Good
   try {
     // ...
   } catch (error) {
     log.error('Operation failed', error)
   }
   ```

4. **Don't forget request ID in async operations:**
   ```typescript
   // ❌ Bad
   processGeneration(jobId, mode)
   
   // ✅ Good
   processGeneration(jobId, mode, requestId)
   ```

---

## Summary

**Logging System Features:**
- ✅ Request ID tracking across all logs
- ✅ Structured logging (JSON in production)
- ✅ Context loggers for consistent metadata
- ✅ Detailed error storage in database
- ✅ User-friendly error UI with details dialog
- ✅ Copy error details for support
- ✅ Full request tracing capability
- ✅ Production-ready monitoring

**Result:** Complete observability system for debugging production issues, monitoring application health, and providing excellent user support.

