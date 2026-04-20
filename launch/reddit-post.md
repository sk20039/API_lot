# Reddit Post — APIlot Launch

Post to: r/webdev and r/programming

---

**Title:**
I built an open-source Postman alternative with Claude AI built in — feedback welcome

---

**Body:**

Hey r/webdev, I've been building APIlot — an API testing tool where Claude AI is a first-class feature, not an afterthought.

**What it does:**
- Full request builder (method, URL, params, headers, body, auth)
- Request history + environment variables with {{variable}} substitution
- AI sidebar with 4 tabs: Explain (understand responses), Debug (fix errors), Generate Tests (Postman/JS/Python/Shell), and Chat

**Why I built it:** I kept alt-tabbing between Postman and ChatGPT while debugging. This keeps everything in one place.

**Stack:** React + Zustand + Vite, Express + Axios backend, Anthropic SDK for Claude, pnpm monorepo.

GitHub: https://github.com/sk20039/API_lot

To run: `git clone` → `pnpm install` → add `ANTHROPIC_API_KEY` to `apps/api/.env` → `pnpm dev`

Would love honest feedback — what's missing, what's clunky, what would make you actually use this?

---

**Notes for posting:**
- r/webdev: post as-is
- r/programming: same body, remove "Hey r/webdev" opener
- Attach a screenshot of the AI sidebar (Debug or Tests tab) to increase engagement
- Avoid posting both subreddits within the same hour to prevent spam flags
