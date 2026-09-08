# GuardianX System Architecture

```
                      GuardianX Mobile App (Flutter)
                                    |
                             Authentication
                                    |
                           Check Authenticated Role
                             /             \
                            /               \
                      PARENT                 CHILD
                         |                     |
                   ParentShell            ChildShell
                         \                 /
                          \               /
                           REST API (HTTP)
                                  |
                        Node.js / Express Backend
                                  |
                   +------------------------------+
                   |  Middleware Stack:           |
                   |  - Authentication (JWT)      |
                   |  - Role Authorization (RBAC) |
                   |  - Tenant Isolation Check    |
                   |  - Entitlement Checker       |
                   +------------------------------+
                                  |
                           MongoDB / Mongoose
```

## Data Flow Layering
1. **Flutter Mobile**:
   - `UI Widgets`: Material 3 components consuming state from Providers.
   - `Providers`: State management handling business logic & loading/error states.
   - `Repositories`: Abstracting API calls.
   - `ApiClient`: Low-level HTTP client handling JWT tokens and standard error parsing.

2. **Node.js Express Backend**:
   - `Routes`: Modular endpoint definitions `/api/auth`, `/api/children`, `/api/location`, `/api/sos`, `/api/routines`, etc.
   - `Middleware`: Enforces JWT verification, role access (`parent`/`child`), `tenantId` match, and SaaS entitlement checks.
   - `Controllers`: Business logic and database query execution.
   - `Models`: Mongoose schemas with indexed `tenantId` fields.
