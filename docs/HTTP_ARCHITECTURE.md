# HTTP Handler Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Express Route Handler                       │
│                                                                   │
│  router.post('/endpoint', middleware..., controller function)    │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
         ┌───────────────┐  ┌─────────┐  ┌──────────────┐
         │ Middlewares   │  │Business │  │Error Handler │
         │               │  │ Logic   │  │              │
         ├───────────────┤  └─────────┘  ├──────────────┤
         │• requireAuth  │  (Services)   │asyncHandler  │
         │• requireRole  │               │(catches all) │
         │• authenticate │               └──────────────┘
         └───────────────┘                        ▲
                │                                 │
                └────────────────┬────────────────┘
                                 │
                        ┌────────▼────────┐
                        │ HttpResponse    │
                        │ Factory Methods │
                        ├─────────────────┤
                        │ • success()     │
                        │ • created()     │
                        │ • deleted()     │
                        │ • badRequest()  │
                        │ • notFound()    │
                        │ • unAuthorized()│
                        │ • forbidden()   │
                        │ • serverError() │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌────────────────┐
                        │  Response JSON │
                        │  (Consistent)  │
                        └────────────────┘
```

---

## Data Flow Diagram

### Successful Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Request Arrives                               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
         ┌──────────────────────────────────────┐
         │ Middleware Layer (Runs First)        │
         ├──────────────────────────────────────┤
         │ 1. requireAuth - Check if user auth? │
         │    (401 if not)                      │
         │ 2. Other middleware...               │
         └─────────────────┬────────────────────┘
                           │
                    ✅ All pass
                           │
                           ▼
         ┌──────────────────────────────────────┐
         │ asyncHandler Wrapper Activated       │
         │ (Ready to catch any errors)          │
         └─────────────────┬────────────────────┘
                           │
                           ▼
         ┌──────────────────────────────────────┐
         │ Validation (if needed)               │
         ├──────────────────────────────────────┤
         │ const result = schema.safeParse(...) │
         │ if (failOnValidation(result, res))   │
         │   return; // 400 error sent          │
         └─────────────────┬────────────────────┘
                           │
                      ✅ Valid
                           │
                           ▼
         ┌──────────────────────────────────────┐
         │ Business Logic (Your Service Code)   │
         │                                      │
         │ const data = await service.action()  │
         └─────────────────┬────────────────────┘
                           │
                     ✅ Success
                           │
                           ▼
         ┌──────────────────────────────────────┐
         │ Build Response with HttpResponse     │
         │                                      │
         │ HttpResponse.success(data).send(res) │
         └─────────────────┬────────────────────┘
                           │
                           ▼
         ┌──────────────────────────────────────┐
         │ Send JSON Response to Client         │
         │ {                                    │
         │   "status_code": 200,                │
         │   "status": "success",               │
         │   "message": "...",                  │
         │   "data": {...}                      │
         │ }                                    │
         └──────────────────────────────────────┘
```

### Error Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Request Arrives                               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
         ┌──────────────────────────────────────┐
         │ Middleware Layer                     │
         │ requireAuth checks...                │
         └─────────────────┬────────────────────┘
                           │
                    ❌ User not auth
                           │
                           ▼
              HttpResponse.unAuthorized()
                     .send(res)
                           │
                           ▼
         ┌──────────────────────────────────────┐
         │ 401 Response Sent                    │
         └──────────────────────────────────────┘
```

---

## Alternative: Error During Business Logic

```
         ┌──────────────────────────────────────┐
         │ All middleware ✅                    │
         │ Validation ✅                        │
         │ Business logic starts...             │
         └─────────────────┬────────────────────┘
                           │
                           ▼
         ┌──────────────────────────────────────┐
         │ Service throws error:                │
         │ throw new Error('Database failed')   │
         └─────────────────┬────────────────────┘
                           │
                ❌ Error thrown
                           │
        ┌──────────────────▼──────────────────┐
        │  asyncHandler Catches It!           │
        │  (No manual try-catch needed)       │
        └──────────────┬──────────────────────┘
                       │
                       ▼
         ┌──────────────────────────────────────┐
         │ Log error                            │
         │ Check if response already sent       │
         └──────────────┬───────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────────────┐
         │ Send Error Response:                 │
         │ HttpResponse.serverError(msg)        │
         │        .send(res)                    │
         └──────────────┬───────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────────────┐
         │ 500 Response Sent                    │
         │ {                                    │
         │   "status_code": 500,                │
         │   "status": "error",                 │
         │   "error": {                         │
         │     "code": "Server Error",          │
         │     "message": "..."                 │
         │   }                                  │
         │ }                                    │
         └──────────────────────────────────────┘
```

---

## Utility Dependency Graph

```
                    Express Request
                          │
            ┌─────────────┴───────────┬─────────────┐
            │             │           │             │
            ▼             ▼           ▼             ▼
        requireAuth   Validation   Business  Error(thrown)
        middleware    (if needed)   Logic
            │             │           │             │
            ├─ Checks ────┤           │             │
            │  if user    │           │             │
            │  exists     │           │             │
            │             │           │             │
            └─────────────┼───────────┼─────────────┘
                          │           │
              ┌───────────▼───────────▼──────────┐
              │      asyncHandler Wrapper        │
              │  (Catches ALL thrown errors)     │
              └───────────────┬──────────────────┘
                              │
                ┌─────────────┴──────────────┐
                │             │              │
                ▼             ▼              ▼
         failOnValidation  HttpResponse   Custom Error
         (validation)      (all statuses)  (caught & formatted)
                │             │              │
                └─────────────┴──────────────┘
                              │
                              ▼
                    Response Sent to Client
                    (JSON - Consistent Format)
```

---

## Request Processing Pipeline

```
REQUEST ARRIVES
    │
    ├─► MIDDLEWARE CHAIN
    │   ├─ requireAuth (optional)
    │   ├─ Other middleware
    │   └─► FAIL? → Send Error Response & EXIT
    │
    │☑ PASS MIDDLEWARE
    │
    ├─► ASYNC HANDLER WRAPPER STARTED
    │   (Error catching activated)
    │
    ├─► VALIDATION (if needed)
    │   ├─► schema.safeParse()
    │   ├─► failOnValidation()
    │   └─► FAIL? → Send 400 Error & EXIT
    │
    │☑ VALIDATION PASSED
    │
    ├─► BUSINESS LOGIC
    │   ├─► await service.method()
    │   └─► ERROR? → Caught by asyncHandler
    │       └─► Send 500 Error & EXIT
    │
    │☑ BUSINESS LOGIC SUCCESS
    │
    ├─► BUILD RESPONSE
    │   ├─► HttpResponse.success()
    │   ├─► HttpResponse.created()
    │   └─► etc...
    │
    └─► SEND RESPONSE TO CLIENT
        (JSON - Status Code + Body)
```

---

## API Response Types

### Overview

```
                        HttpResponse
                             │
       ┌───────────┬─────────┼─────────┬──────────┐
       │           │         │         │          │
       ▼           ▼         ▼         ▼          ▼
    SUCCESS      ERROR    CREATED   DELETED   EDGE CASES
       │           │         │         │          │
    200, 201,   400-500     201       204      (others)
    204         (status)     │         │
       │           │      created() deleted()
       │           │
       │           ├─ 401 (Unauthorized)  ──► unAuthorized()
       │           ├─ 403 (Forbidden)     ──► forbidden()
       │           ├─ 404 (Not Found)     ──► notFound()
       │           └─ 500 (Server Error)  ──► serverError()
       │
       ├─ 200 (OK with data)              ──► ok()
       ├─ 201 (Created with data)         ──► created()
       └─ 204 (No Content / no data)      ──► noContent()
```

---

## Method Call Chain Example

```
Router Definition
       │
       ▼
router.post('/register',
       │
       ├─ asyncHandler ─────────────────────────► Wraps the handler function
       │                                          Catches ANY uncaught errors
       │
       └─ async (req, res) => {
            │
            ├─ const result = await registrationSchema.safeParseAsync(req.body)
            │    │
            │    └─► Result: { success: boolean, data?, error? }
            │
            ├─ if (failOnValidation(result, res)) return;
            │    │
            │    ├─ Checks if validation failed
            │    ├─ If failed: Sends 400 response + returns true (exits early)
            │    └─ If passed: Returns false (continues flow)
            │
            ├─ const account = await AuthenticationService.create(data)
            │    │
            │    ├─ If an error is thrown here:
            │    │    └─► Caught by asyncHandler ──► Auto-sends 500/error response
            │    │
            │    └─ Otherwise: Continues execution
            │
            ├─ const token = generateToken(account.user)
            │
            └─ HttpResponse.created({ accessToken: token, user: account.user }, 'Account created').send(res)
                 │
                 ├─ Creates a new unified HttpResponse instance
                 ├─ Runs .toJson() to standardize the body format
                 ├─ Sets res.status(201)
                 └─ Sends final response payload via res.json(...)
```

---

## Comparison: Without Utilities vs With Utilities

### Without (Repetitive)

```
try {
  const result = await schema.safeParse();
  if (!result.success) {
    const errors = result.error.issues.map(...);
    return res.status(400).json({errors});
  }

  const data = await service.action();

  if (!data) {
    return res.status(404).json({
      status: 'error',
      error: {code: 'Not Found', message: '...'}
    });
  }

  return res.status(200).json({
    status: 'success',
    data: data,
    message: '...'
  });
} catch (error) {
  return res.status(500).json({
    status: 'error',
    error: {code: 'Server Error', message: '...'}
  });
}
```

### With (Clean)

```
const result = await schema.safeParse();
if (failOnValidation(result, res)) return;

const data = await service.action();

if (!data) {
  return HttpResponse.notFound().send(res);
}

HttpResponse.success(data).send(res);
```

---

## Technology Stack Integration

```
Express.js
    │
    ├─► Routing
    │   └─► Router.post/get/put/delete()
    │
    ├─► Request/Response Objects
    │   ├─ req: Contains body, params, user, etc.
    │   └─ res: Used to send responses
    │
    └─► Middleware Pattern
        ├─ requireAuth (our custom)
        ├─ asyncHandler (our custom)
        └─ Others...


Zod (Validation)
    │
    ├─► Schema definition
    │   └─ z.object/string/number/etc.
    │
    └─► Parsing
        ├─ schema.parse() - throws if invalid
        └─ schema.safeParse() - returns {success, data, error}


HttpResponse (our custom)
    │
    ├─► Factory Methods
    │   └─ Static methods for common HTTP statuses
    │
    └─► JSON Formatting
        └─ Standardized response structure
```

---

## Summary: How It All Works Together

1. **Request arrives** → Express route matches
2. **Middleware runs** → requireAuth, etc. (early failures handled)
3. **asyncHandler starts** → Ready to catch ANY errors
4. **Validation happens** → failOnValidation handles it
5. **Business logic** → Service method runs (errors caught by asyncHandler)
6. **Response built** → HttpResponse factory method creates it
7. **JSON sent** → Consistent, standardized format
