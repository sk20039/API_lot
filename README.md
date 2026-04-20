# APIlot

An open-source API testing tool with Claude AI built directly into the workflow — like Postman, but with an AI copilot that explains responses, diagnoses errors, generates tests, and answers your questions in context.

**GitHub:** https://github.com/sk20039/API_lot

---

## Features

- **Full request builder** — method, URL, query params, headers, body (JSON/form/raw), and auth (Bearer, API key, Basic)
- **Request history** — last 50 requests persisted in localStorage
- **Environment variables** — `{{varName}}` substitution in URL, params, headers, and body
- **AI sidebar** (powered by Claude):
  - **Explain** — field-by-field breakdown of any response with anomaly flagging
  - **Debug** — root-cause analysis for 4xx/5xx errors with 3 specific fixes
  - **Generate Tests** — one-click test code in 4 formats: Postman JS, Plain JS, Python (pytest), Shell (bash + curl)
  - **Chat** — free-form conversation with full request/response context

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- An [Anthropic API key](https://console.anthropic.com/) (for AI features)

### Setup

```bash
git clone https://github.com/sk20039/API_lot.git
cd API_lot
pnpm install
```

Create the API environment file:

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` and add your Anthropic API key:

```
PORT=3001
JWT_SECRET=your-secret-key-here
WEB_ORIGIN=http://localhost:5173
ANTHROPIC_API_KEY=sk-ant-...your-key-here...
```

### Run

```bash
pnpm dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

Register an account on first run (auth is local, no external service).

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Zustand, Vite, Tailwind CSS |
| Backend | Express, Axios (proxy) |
| AI | Anthropic SDK (Claude) |
| Monorepo | pnpm workspaces, shared TypeScript types |

---

## Project Structure

```
API_lot/
├── apps/
│   ├── api/          # Express proxy + auth server (port 3001)
│   └── web/          # React SPA (port 5173)
└── packages/
    └── shared/       # Shared TypeScript types
```

---

## AI Features in Detail

All AI features stream responses in real time and receive the full request + response as context.

### Explain
Breaks down every field in the response body, explains status codes, and flags anything unusual or unexpected.

### Debug
For failed requests (4xx/5xx), diagnoses the most likely root cause and returns 3 concrete, actionable fixes.

### Generate Tests
Outputs copy-paste-ready test code. Pick your format:

| Format | What you get |
|--------|-------------|
| Postman JS | `pm.test(...)` assertions for Postman's test runner |
| Plain JS | `fetch` + `console.assert` — runs in any JS environment |
| Python | `pytest` + `requests` — standard Python test file |
| Shell | `bash` + `curl` — portable, no dependencies |

### Chat
Ask anything: "Why did this fail?", "How do I add pagination?", "What does this field mean?" — the AI has full context of what you just tested.

---

## Development

```bash
# Type-check without building
cd apps/api && npx tsc --noEmit
cd apps/web && npx tsc --noEmit

# Build (shared must be built first)
pnpm --filter @apilot/shared build
pnpm --filter @apilot/api build
pnpm --filter @apilot/web build
```

---

## Feedback

Found a bug? Have a feature request? Open an issue or drop a comment on the [Feedback Thread](https://github.com/sk20039/API_lot/issues).

**Questions I'm actively trying to answer:**
- What feature is missing that would make this your daily driver?
- What's confusing about the setup?
- Would you pay for a hosted version?

---

## License

MIT
