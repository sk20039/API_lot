# 🚀 AI-Driven API Tester — Full Architecture Plan

> A next-generation Postman alternative powered by Claude AI, built for developers who want smarter, faster API testing.

---

## 1. Project Overview

**App Name (suggestion):** `APIlot` — AI-powered API co-pilot  
**Goal:** A full-featured API testing tool with Claude AI deeply integrated at every layer — from writing requests to explaining errors, generating tests, and documenting endpoints.  
**Primary Users:** Backend developers, QA engineers, frontend developers consuming APIs.

---

## 2. Tech Stack

### Frontend
| Layer | Technology | Reason |
|---|---|---|
| Framework | React 18 + TypeScript | Component model, strong typing |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent UI |
| State Management | Zustand | Lightweight, no boilerplate |
| Code Editor | Monaco Editor | VSCode-level editing for request bodies |
| HTTP Client | Axios + Fetch API | Flexible request handling |
| Routing | React Router v6 | SPA navigation |
| Build Tool | Vite | Fast dev server and bundling |

### Backend
| Layer | Technology | Reason |
|---|---|---|
| Runtime | Node.js + Express | Lightweight, widely supported |
| Language | TypeScript | Consistency with frontend |
| Proxy Layer | Custom Express middleware | Bypass CORS, attach auth headers |
| AI Integration | Anthropic SDK (Claude) | Core AI features |
| Auth | JWT + bcrypt | Secure user sessions |
| WebSockets | Socket.io | Real-time response streaming |

### Database
| Layer | Technology | Reason |
|---|---|---|
| Primary DB | PostgreSQL | Relational data (users, collections) |
| ORM | Prisma | Type-safe queries |
| Cache | Redis | Session store, recent history |
| File Storage | AWS S3 or local disk | Import/export of collections |

### DevOps
| Layer | Technology |
|---|---|
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Hosting (API) | Railway or Render |
| Hosting (Frontend) | Vercel |
| Monitoring | Sentry + PostHog |

---

## 3. Full Feature Set

### 3.1 Core Request Builder
- **HTTP Methods:** GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD
- **URL Bar:** Smart autocomplete from history and collections
- **Tabs per request:** Params, Headers, Body (raw, form-data, x-www-form-urlencoded, binary), Auth, Pre-request Script, Tests
- **Auth types:** Bearer Token, Basic Auth, API Key, OAuth 2.0, AWS Signature
- **Body editor:** Monaco Editor with JSON, XML, GraphQL, plain text modes
- **Request history:** Auto-saved, searchable, replayable

### 3.2 Response Viewer
- Status code + status text badge (color-coded)
- Response time, size, and network tab
- Pretty-printed JSON/XML with syntax highlighting and collapsible nodes
- Raw response view
- Response headers viewer
- Cookie viewer
- Download response as file

### 3.3 Collections & Workspaces
- Hierarchical folder structure (Workspace → Collection → Folder → Request)
- Drag-and-drop reordering
- Import/Export (Postman v2.1 format, OpenAPI 3.0, HAR)
- Share collections via link (read-only or editable)
- Version history per collection

### 3.4 Environment Variables
- Multiple environments: Local, Dev, Staging, Production
- Variable scopes: Global, Environment, Collection, Request
- Secret variables (masked in UI, never logged)
- Variable preview before sending

### 3.5 Authentication Manager
- Save and reuse auth configs across requests
- OAuth 2.0 flow with browser-based callback
- Auto-refresh tokens before expiry
- Auth inheritance from collection → folder → request

### 3.6 Test Scripting
- JavaScript test runner (pre/post request)
- Built-in assertion library (`pm.expect()` style API)
- Access to response body, headers, status in scripts
- Test results panel with pass/fail indicators
- Collection-level test runner (run all requests in sequence)

### 3.7 Mock Server
- Define mock endpoints with custom status codes and response bodies
- Conditional responses based on request params or body
- Latency simulation
- Share mock server URL with teammates

### 3.8 Team Collaboration
- Invite team members to workspaces
- Role-based access: Admin, Editor, Viewer
- Real-time cursor presence (who's editing what)
- Comments on requests
- Activity log

---

## 4. AI Features (Claude Integration)

This is the core differentiator. Claude is embedded at every step.

### 4.1 AI Request Generator
- **Input:** Plain English description ("Get all users where status is active")
- **Output:** Fully formed HTTP request with URL, headers, body, params
- **Uses:** Claude reads your collection context to infer base URLs, auth patterns, and existing conventions

### 4.2 AI Response Explainer
- One-click "Explain this response" button
- Claude explains: what the status code means in context, what each field in the JSON means, and flags anything unusual (unexpected nulls, missing fields, odd values)
- Particularly useful for unfamiliar third-party APIs

### 4.3 AI Error Debugger
- On 4xx/5xx responses, Claude automatically suggests likely causes and fixes
- "Why did this fail?" button with context-aware diagnosis
- Suggests corrected request and lets you apply it with one click

### 4.4 AI Test Generator
- Analyze a response and auto-generate a test suite
- Tests include: status code checks, schema validation, field presence, value range checks, response time thresholds
- Tests written as runnable JavaScript in the Tests tab

### 4.5 AI Documentation Generator
- Select a collection or folder → Claude generates full API documentation
- Output formats: Markdown, HTML, or OpenAPI 3.0 YAML
- Includes: endpoint descriptions, parameter tables, example requests/responses, error codes

### 4.6 AI Schema Validator
- Paste or auto-detect a JSON Schema / OpenAPI spec
- Claude validates each response against the schema and highlights mismatches
- Diff view showing expected vs actual structure

### 4.7 AI Collection Analyzer
- Analyze an entire collection for: duplicate endpoints, inconsistent naming, missing auth, undocumented parameters
- Produces a health report with actionable suggestions

### 4.8 Natural Language Environment Setup
- "Switch to production but keep the dev token" → Claude interprets and applies the right variable overrides
- "Add auth headers to all requests in this collection" → Claude applies in bulk

---

## 5. Application Architecture

```
┌─────────────────────────────────────────────┐
│                  FRONTEND                    │
│  React + TypeScript + Zustand + Monaco      │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │ Request  │ │ Response │ │ AI Sidebar  │ │
│  │ Builder  │ │ Viewer   │ │ (Claude)    │ │
│  └──────────┘ └──────────┘ └─────────────┘ │
│  ┌──────────────────────────────────────┐   │
│  │      Collections / Workspaces        │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
              │ REST + WebSocket
┌─────────────────────────────────────────────┐
│                  BACKEND                     │
│         Node.js + Express + TypeScript       │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │  Proxy   │ │   Auth   │ │  AI Router  │ │
│  │ Service  │ │  Service │ │  (Claude)   │ │
│  └──────────┘ └──────────┘ └─────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │Collection│ │  Mock    │ │  History &  │ │
│  │ Service  │ │  Server  │ │  Cache      │ │
│  └──────────┘ └──────────┘ └─────────────┘ │
└─────────────────────────────────────────────┘
              │
┌─────────────────────────────────────────────┐
│                 DATA LAYER                   │
│   PostgreSQL (Prisma) + Redis + S3          │
└─────────────────────────────────────────────┘
```

---

## 6. Folder Structure

```
apilot/
├── apps/
│   ├── web/                          # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── RequestBuilder/
│   │   │   │   │   ├── UrlBar.tsx
│   │   │   │   │   ├── MethodSelector.tsx
│   │   │   │   │   ├── ParamsTab.tsx
│   │   │   │   │   ├── HeadersTab.tsx
│   │   │   │   │   ├── BodyTab.tsx
│   │   │   │   │   └── AuthTab.tsx
│   │   │   │   ├── ResponseViewer/
│   │   │   │   │   ├── StatusBadge.tsx
│   │   │   │   │   ├── JsonViewer.tsx
│   │   │   │   │   ├── HeadersPanel.tsx
│   │   │   │   │   └── ResponseTabs.tsx
│   │   │   │   ├── AISidebar/
│   │   │   │   │   ├── AIChat.tsx
│   │   │   │   │   ├── AIExplainer.tsx
│   │   │   │   │   ├── AITestGen.tsx
│   │   │   │   │   └── AIDocGen.tsx
│   │   │   │   ├── Collections/
│   │   │   │   │   ├── CollectionTree.tsx
│   │   │   │   │   ├── FolderNode.tsx
│   │   │   │   │   └── RequestNode.tsx
│   │   │   │   ├── Environment/
│   │   │   │   │   ├── EnvSelector.tsx
│   │   │   │   │   └── EnvEditor.tsx
│   │   │   │   └── shared/
│   │   │   │       ├── Button.tsx
│   │   │   │       ├── Modal.tsx
│   │   │   │       └── CodeEditor.tsx
│   │   │   ├── stores/               # Zustand stores
│   │   │   │   ├── requestStore.ts
│   │   │   │   ├── collectionStore.ts
│   │   │   │   ├── environmentStore.ts
│   │   │   │   ├── historyStore.ts
│   │   │   │   └── aiStore.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useRequest.ts
│   │   │   │   ├── useAI.ts
│   │   │   │   └── useEnvironment.ts
│   │   │   ├── services/
│   │   │   │   ├── api.ts            # Backend API calls
│   │   │   │   ├── proxy.ts          # Request proxy
│   │   │   │   └── ai.ts             # AI service calls
│   │   │   ├── pages/
│   │   │   │   ├── Workspace.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Settings.tsx
│   │   │   └── utils/
│   │   │       ├── varParser.ts      # {{variable}} replacement
│   │   │       ├── importer.ts       # Postman/OpenAPI import
│   │   │       └── exporter.ts
│   │   └── vite.config.ts
│   │
│   └── api/                          # Express backend
│       ├── src/
│       │   ├── routes/
│       │   │   ├── proxy.ts          # Forward requests to target APIs
│       │   │   ├── collections.ts
│       │   │   ├── environments.ts
│       │   │   ├── history.ts
│       │   │   ├── auth.ts
│       │   │   ├── ai.ts             # All AI endpoints
│       │   │   └── mock.ts
│       │   ├── services/
│       │   │   ├── claudeService.ts  # Anthropic SDK wrapper
│       │   │   ├── proxyService.ts
│       │   │   ├── mockService.ts
│       │   │   └── exportService.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   ├── rateLimit.ts
│       │   │   └── errorHandler.ts
│       │   ├── prisma/
│       │   │   └── schema.prisma
│       │   └── index.ts
│       └── package.json
│
├── packages/
│   └── shared/                       # Shared TypeScript types
│       ├── types/
│       │   ├── request.ts
│       │   ├── collection.ts
│       │   ├── environment.ts
│       │   └── ai.ts
│       └── utils/
│           └── varParser.ts
│
├── docker-compose.yml
├── package.json                      # Monorepo root (pnpm workspaces)
└── README.md
```

---

## 7. Database Schema (Prisma)

```prisma
model User {
  id          String       @id @default(cuid())
  email       String       @unique
  name        String
  password    String
  workspaces  WorkspaceMember[]
  createdAt   DateTime     @default(now())
}

model Workspace {
  id          String       @id @default(cuid())
  name        String
  members     WorkspaceMember[]
  collections Collection[]
  environments Environment[]
}

model WorkspaceMember {
  userId      String
  workspaceId String
  role        Role         @default(VIEWER)
  user        User         @relation(fields: [userId], references: [id])
  workspace   Workspace    @relation(fields: [workspaceId], references: [id])
  @@id([userId, workspaceId])
}

enum Role { ADMIN EDITOR VIEWER }

model Collection {
  id          String       @id @default(cuid())
  name        String
  workspaceId String
  workspace   Workspace    @relation(fields: [workspaceId], references: [id])
  folders     Folder[]
  requests    Request[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Folder {
  id           String    @id @default(cuid())
  name         String
  collectionId String
  parentId     String?
  collection   Collection @relation(fields: [collectionId], references: [id])
  requests     Request[]
}

model Request {
  id           String    @id @default(cuid())
  name         String
  method       String
  url          String
  headers      Json      @default("[]")
  params       Json      @default("[]")
  body         Json?
  auth         Json?
  preScript    String?
  testScript   String?
  collectionId String?
  folderId     String?
  collection   Collection? @relation(fields: [collectionId], references: [id])
  folder       Folder?     @relation(fields: [folderId], references: [id])
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Environment {
  id          String    @id @default(cuid())
  name        String
  workspaceId String
  variables   Json      @default("[]")
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
}

model RequestHistory {
  id          String    @id @default(cuid())
  userId      String
  method      String
  url         String
  request     Json
  response    Json
  duration    Int
  statusCode  Int
  createdAt   DateTime  @default(now())
}
```

---

## 8. Key API Endpoints

### Proxy
```
POST   /api/proxy                    # Forward a request to any URL
```

### Collections
```
GET    /api/collections              # List all collections
POST   /api/collections              # Create collection
GET    /api/collections/:id          # Get collection with requests
PUT    /api/collections/:id          # Update collection
DELETE /api/collections/:id          # Delete collection
POST   /api/collections/:id/import   # Import from Postman/OpenAPI
GET    /api/collections/:id/export   # Export collection
```

### Requests
```
POST   /api/requests                 # Save a request
PUT    /api/requests/:id             # Update request
DELETE /api/requests/:id             # Delete request
```

### Environments
```
GET    /api/environments             # List environments
POST   /api/environments             # Create environment
PUT    /api/environments/:id         # Update environment
```

### AI
```
POST   /api/ai/explain-response      # Explain a response
POST   /api/ai/debug-error           # Debug a failed request
POST   /api/ai/generate-request      # Generate request from English
POST   /api/ai/generate-tests        # Generate test scripts
POST   /api/ai/generate-docs         # Generate API documentation
POST   /api/ai/analyze-collection    # Analyze collection health
POST   /api/ai/chat                  # Free-form AI assistant (streaming)
```

### History
```
GET    /api/history                  # Get request history
DELETE /api/history                  # Clear history
```

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
```

---

## 9. AI Integration Design (`claudeService.ts`)

```typescript
// Core pattern for all AI features
export class ClaudeService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  // Explain a response
  async explainResponse(request: RequestData, response: ResponseData) {
    return this.stream(`
      You are an expert API analyst. Explain this HTTP response clearly.
      Request: ${JSON.stringify(request)}
      Response: ${JSON.stringify(response)}
      Explain: status code meaning, each response field, any anomalies.
    `);
  }

  // Generate tests from a response
  async generateTests(request: RequestData, response: ResponseData) {
    return this.complete(`
      Generate JavaScript test assertions for this API response.
      Use pm.expect() style. Return only runnable code, no explanation.
      Response: ${JSON.stringify(response)}
    `);
  }

  // Generate a request from plain English
  async generateRequest(description: string, context: CollectionContext) {
    return this.complete(`
      Convert this to an HTTP request: "${description}"
      Base URL from context: ${context.baseUrl}
      Auth pattern: ${context.authType}
      Return JSON: { method, url, headers, params, body }
    `);
  }

  private async stream(prompt: string) {
    return this.client.messages.stream({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }]
    });
  }

  private async complete(prompt: string) {
    const msg = await this.client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }]
    });
    return msg.content[0].type === 'text' ? msg.content[0].text : '';
  }
}
```

---

## 10. Build Phases

### Phase 1 — Core MVP (Weeks 1–4)
- [ ] Monorepo setup (pnpm workspaces + Vite + Express)
- [ ] Request builder UI (method, URL, headers, params, body)
- [ ] Proxy backend (forward requests, handle CORS)
- [ ] Response viewer (JSON tree, status, timing)
- [ ] Local request history
- [ ] Environment variables with `{{variable}}` substitution
- [ ] Basic auth (JWT)

### Phase 2 — Collections & Persistence (Weeks 5–7)
- [ ] PostgreSQL + Prisma setup
- [ ] Collection CRUD with folder hierarchy
- [ ] Drag-and-drop collection tree
- [ ] Save/load requests from DB
- [ ] Import from Postman JSON v2.1
- [ ] Export to Postman / OpenAPI

### Phase 3 — AI Features (Weeks 8–10)
- [ ] Anthropic SDK integration
- [ ] AI response explainer
- [ ] AI error debugger
- [ ] AI test generator
- [ ] AI request generator (natural language → request)
- [ ] Streaming AI chat sidebar

### Phase 4 — Advanced Features (Weeks 11–14)
- [ ] Test script runner (pre/post request)
- [ ] Collection runner (run all in sequence)
- [ ] Mock server
- [ ] OAuth 2.0 flow
- [ ] AI documentation generator
- [ ] AI collection health analyzer

### Phase 5 — Team & Polish (Weeks 15–18)
- [ ] Workspace + team collaboration
- [ ] Role-based access control
- [ ] Real-time presence (Socket.io)
- [ ] Request comments
- [ ] Docker deployment
- [ ] Monitoring (Sentry + PostHog)

---

## 11. Environment Variables

```bash
# apps/api/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/apilot
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
ANTHROPIC_API_KEY=sk-ant-...
AWS_S3_BUCKET=apilot-exports
PORT=3001

# apps/web/.env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

---

## 12. Getting Started in Claude Code

When you open Claude Code, start with this sequence:

```bash
# 1. Scaffold the monorepo
mkdir apilot && cd apilot
pnpm init
pnpm add -w typescript

# 2. Create apps
mkdir -p apps/web apps/api packages/shared

# 3. Frontend
cd apps/web && pnpm create vite . --template react-ts

# 4. Backend
cd ../api && pnpm init && pnpm add express typescript @anthropic-ai/sdk prisma

# 5. Start with Claude Code prompt:
# "Build the Express proxy server with CORS handling and the 
#  React request builder UI based on the architecture plan"
```

---

*Generated architecture plan for APIlot — AI-Driven API Testing Platform*
