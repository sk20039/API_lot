# 🤖 AI Sidebar — Implementation Guide

> Right-panel AI sidebar with 4 features: Explain Response, Debug Error, Generate Tests, Free-form Chat  
> Stack: React + JavaScript, Tailwind CSS, Anthropic SDK (backend)

---

## Overview of What We're Building

```
┌─────────────────────────────────┬──────────────────────┐
│         MAIN APP AREA           │     AI SIDEBAR       │
│                                 │  ┌────────────────┐  │
│  [Request Builder]              │  │  ✨ AIlot       │  │
│                                 │  │  [Explain][Debug│  │
│  [Response Viewer]              │  │  [Tests][Chat]  │  │
│                                 │  │                │  │
│                                 │  │  AI response   │  │
│                                 │  │  streams here  │  │
│                                 │  └────────────────┘  │
└─────────────────────────────────┴──────────────────────┘
                                    ↑ slides in from right
```

---

## File Structure to Add

```
apps/
├── web/src/
│   └── components/
│       └── AISidebar/
│           ├── AISidebar.jsx          ← Main sidebar shell
│           ├── AIExplain.jsx          ← Explain Response tab
│           ├── AIDebug.jsx            ← Debug Error tab
│           ├── AITestGen.jsx          ← Generate Tests tab
│           ├── AIChat.jsx             ← Free-form Chat tab
│           ├── AIMessage.jsx          ← Shared message bubble
│           └── AISidebar.css          ← Animations + styles
│
└── api/src/
    └── routes/
        └── ai.js                      ← 4 AI endpoints (streaming)
```

---

## Step 1 — Backend: `apps/api/src/routes/ai.js`

Create this file. It handles all 4 AI features with streaming responses.

```javascript
// apps/api/src/routes/ai.js
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Shared streaming helper ───────────────────────────────────────────────
async function streamToResponse(res, messages, systemPrompt) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const stream = client.messages.stream({
    model: 'claude-opus-4-5',
    max_tokens: 1500,
    system: systemPrompt,
    messages,
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
    }
  }

  res.write('data: [DONE]\n\n');
  res.end();
}

// ─── 1. Explain Response ───────────────────────────────────────────────────
router.post('/explain', async (req, res) => {
  const { request, response } = req.body;

  await streamToResponse(
    res,
    [
      {
        role: 'user',
        content: `Explain this API response clearly for a developer.

REQUEST:
${request.method} ${request.url}
Headers: ${JSON.stringify(request.headers, null, 2)}
Body: ${JSON.stringify(request.body, null, 2)}

RESPONSE:
Status: ${response.status} ${response.statusText}
Time: ${response.duration}ms
Body: ${JSON.stringify(response.data, null, 2)}

Explain:
1. What this status code means in this context
2. What each field in the response body represents
3. Anything unusual or worth noting
Keep it concise and developer-friendly.`,
      },
    ],
    'You are an expert API analyst. Be concise, clear, and use bullet points where helpful.'
  );
});

// ─── 2. Debug Error ────────────────────────────────────────────────────────
router.post('/debug', async (req, res) => {
  const { request, response } = req.body;

  await streamToResponse(
    res,
    [
      {
        role: 'user',
        content: `This API request failed. Help me debug it.

REQUEST:
${request.method} ${request.url}
Headers: ${JSON.stringify(request.headers, null, 2)}
Body: ${JSON.stringify(request.body, null, 2)}

RESPONSE:
Status: ${response.status} ${response.statusText}
Body: ${JSON.stringify(response.data, null, 2)}

Please:
1. Diagnose the most likely cause of this error
2. List 2-3 specific things to check or fix
3. Show a corrected request example if applicable`,
      },
    ],
    'You are an expert API debugger. Be direct and actionable. Format fixes as code blocks.'
  );
});

// ─── 3. Generate Tests ─────────────────────────────────────────────────────
router.post('/generate-tests', async (req, res) => {
  const { request, response } = req.body;

  await streamToResponse(
    res,
    [
      {
        role: 'user',
        content: `Generate JavaScript test assertions for this API response.

REQUEST: ${request.method} ${request.url}
RESPONSE STATUS: ${response.status}
RESPONSE BODY: ${JSON.stringify(response.data, null, 2)}

Write tests using this style:
pm.test("description", () => {
  pm.expect(pm.response.code).to.equal(200);
});

Include tests for:
- Status code
- Response time (under 2000ms)
- Required fields existence  
- Field data types
- Specific value checks where appropriate

Return ONLY the JavaScript code, no explanation.`,
      },
    ],
    'You are an API test engineer. Return only clean, runnable JavaScript test code.'
  );
});

// ─── 4. AI Chat ────────────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  const { messages, context } = req.body;
  // context = { request, response } — the current request/response in view

  const systemPrompt = `You are APIlot, an AI assistant built into an API testing tool (like Postman).
You help developers understand APIs, debug issues, write tests, and optimize requests.
${
  context
    ? `
Current context the user is looking at:
- Request: ${context.request?.method} ${context.request?.url}
- Response Status: ${context.response?.status}
- Response Body: ${JSON.stringify(context.response?.data, null, 2)}
`
    : ''
}
Be concise, technical, and helpful. Use code blocks for code examples.`;

  await streamToResponse(res, messages, systemPrompt);
});

export default router;
```

**Register the route in your main `index.js`:**
```javascript
// apps/api/src/index.js  — add these lines
import aiRoutes from './routes/ai.js';
app.use('/api/ai', aiRoutes);
```

---

## Step 2 — Shared Hook: `apps/web/src/hooks/useAIStream.js`

This hook handles Server-Sent Events streaming from the backend.

```javascript
// apps/web/src/hooks/useAIStream.js
import { useState, useCallback } from 'react';

export function useAIStream() {
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const stream = useCallback(async (endpoint, payload) => {
    setOutput('');
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/ai/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                setOutput((prev) => prev + parsed.text);
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setOutput('');
    setError(null);
  }, []);

  return { output, isLoading, error, stream, reset };
}
```

---

## Step 3 — Main Sidebar Shell: `AISidebar.jsx`

```jsx
// apps/web/src/components/AISidebar/AISidebar.jsx
import { useState } from 'react';
import AIExplain from './AIExplain';
import AIDebug from './AIDebug';
import AITestGen from './AITestGen';
import AIChat from './AIChat';
import './AISidebar.css';

const TABS = [
  { id: 'explain', label: 'Explain', icon: '🔍' },
  { id: 'debug',   label: 'Debug',   icon: '🐛' },
  { id: 'tests',   label: 'Tests',   icon: '✅' },
  { id: 'chat',    label: 'Chat',    icon: '💬' },
];

export default function AISidebar({ isOpen, onClose, request, response }) {
  const [activeTab, setActiveTab] = useState('explain');

  // Pass current request+response as context to all tabs
  const context = { request, response };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div className="ai-backdrop" onClick={onClose} />
      )}

      {/* Sidebar panel */}
      <div className={`ai-sidebar ${isOpen ? 'ai-sidebar--open' : ''}`}>

        {/* Header */}
        <div className="ai-sidebar__header">
          <div className="ai-sidebar__title">
            <span className="ai-sidebar__sparkle">✨</span>
            <span>AIlot Assistant</span>
          </div>
          <button className="ai-sidebar__close" onClick={onClose}>✕</button>
        </div>

        {/* Tab bar */}
        <div className="ai-sidebar__tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`ai-tab ${activeTab === tab.id ? 'ai-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="ai-sidebar__content">
          {activeTab === 'explain' && <AIExplain context={context} />}
          {activeTab === 'debug'   && <AIDebug   context={context} />}
          {activeTab === 'tests'   && <AITestGen  context={context} />}
          {activeTab === 'chat'    && <AIChat     context={context} />}
        </div>
      </div>
    </>
  );
}
```

---

## Step 4 — CSS: `AISidebar.css`

```css
/* apps/web/src/components/AISidebar/AISidebar.css */

/* ── Sidebar shell ── */
.ai-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 420px;
  background: #0f1117;
  border-left: 1px solid #1e2433;
  display: flex;
  flex-direction: column;
  z-index: 100;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.4);
}

.ai-sidebar--open {
  transform: translateX(0);
}

.ai-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: transparent;
}

/* ── Header ── */
.ai-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #1e2433;
  background: #0d1017;
}

.ai-sidebar__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  letter-spacing: 0.02em;
}

.ai-sidebar__sparkle {
  animation: sparkle-pulse 2s ease-in-out infinite;
}

@keyframes sparkle-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.7; transform: scale(1.15); }
}

.ai-sidebar__close {
  background: none;
  border: none;
  color: #64748b;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.2s, background 0.2s;
}
.ai-sidebar__close:hover {
  color: #e2e8f0;
  background: #1e2433;
}

/* ── Tabs ── */
.ai-sidebar__tabs {
  display: flex;
  border-bottom: 1px solid #1e2433;
  background: #0d1017;
}

.ai-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.ai-tab:hover {
  color: #94a3b8;
  background: #111827;
}

.ai-tab--active {
  color: #38bdf8;
  border-bottom-color: #38bdf8;
  background: #0f1824;
}

/* ── Content area ── */
.ai-sidebar__content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scrollbar-width: thin;
  scrollbar-color: #1e2433 transparent;
}

/* ── Shared AI output styles ── */
.ai-output {
  background: #0d1017;
  border: 1px solid #1e2433;
  border-radius: 8px;
  padding: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12.5px;
  line-height: 1.7;
  color: #cbd5e1;
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 80px;
}

.ai-output code {
  background: #1e2433;
  padding: 2px 6px;
  border-radius: 3px;
  color: #38bdf8;
  font-size: 12px;
}

/* Streaming cursor blink */
.ai-output--streaming::after {
  content: '▋';
  animation: blink 0.8s step-end infinite;
  color: #38bdf8;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

.ai-run-btn {
  width: 100%;
  padding: 10px;
  background: #0c4a6e;
  border: 1px solid #0369a1;
  border-radius: 6px;
  color: #38bdf8;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  cursor: pointer;
  margin-bottom: 14px;
  transition: background 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.ai-run-btn:hover  { background: #075985; }
.ai-run-btn:active { transform: scale(0.98); }
.ai-run-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ai-error {
  color: #f87171;
  font-size: 12px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #1f0a0a;
  border: 1px solid #7f1d1d;
  border-radius: 6px;
}

.ai-empty {
  color: #475569;
  font-size: 12px;
  text-align: center;
  padding: 24px 0;
  font-family: 'JetBrains Mono', monospace;
}

.ai-copy-btn {
  margin-top: 10px;
  padding: 6px 12px;
  background: #1e2433;
  border: 1px solid #2d3748;
  border-radius: 5px;
  color: #94a3b8;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}
.ai-copy-btn:hover { background: #2d3748; color: #e2e8f0; }
```

---

## Step 5 — Feature Tabs

### `AIExplain.jsx`
```jsx
// apps/web/src/components/AISidebar/AIExplain.jsx
import { useAIStream } from '../../hooks/useAIStream';

export default function AIExplain({ context }) {
  const { output, isLoading, error, stream, reset } = useAIStream();

  const hasResponse = context?.response?.status;

  const handleExplain = () => {
    if (!hasResponse) return;
    reset();
    stream('explain', {
      request: context.request,
      response: context.response,
    });
  };

  return (
    <div>
      <p className="ai-empty" style={{ textAlign: 'left', marginBottom: 14 }}>
        Explains what the response means, what each field does, and flags anything unusual.
      </p>

      <button
        className="ai-run-btn"
        onClick={handleExplain}
        disabled={isLoading || !hasResponse}
      >
        {isLoading ? '⏳ Analyzing...' : '🔍 Explain This Response'}
      </button>

      {!hasResponse && (
        <p className="ai-empty">Send a request first to enable this feature.</p>
      )}

      {output && (
        <>
          <div className={`ai-output ${isLoading ? 'ai-output--streaming' : ''}`}>
            {output}
          </div>
          <button className="ai-copy-btn" onClick={() => navigator.clipboard.writeText(output)}>
            📋 Copy
          </button>
        </>
      )}

      {error && <div className="ai-error">⚠ {error}</div>}
    </div>
  );
}
```

### `AIDebug.jsx`
```jsx
// apps/web/src/components/AISidebar/AIDebug.jsx
import { useAIStream } from '../../hooks/useAIStream';

export default function AIDebug({ context }) {
  const { output, isLoading, error, stream, reset } = useAIStream();

  const isError = context?.response?.status >= 400;
  const hasResponse = context?.response?.status;

  const handleDebug = () => {
    reset();
    stream('debug', {
      request: context.request,
      response: context.response,
    });
  };

  return (
    <div>
      <p className="ai-empty" style={{ textAlign: 'left', marginBottom: 14 }}>
        Diagnoses why a request failed and suggests fixes.
      </p>

      {hasResponse && !isError && (
        <div style={{ marginBottom: 12, padding: '8px 12px', background: '#052e16',
          border: '1px solid #166534', borderRadius: 6, color: '#4ade80', fontSize: 12,
          fontFamily: 'JetBrains Mono, monospace' }}>
          ✓ Response looks healthy ({context.response.status}). You can still run a debug analysis.
        </div>
      )}

      <button
        className="ai-run-btn"
        onClick={handleDebug}
        disabled={isLoading || !hasResponse}
        style={isError ? { background: '#450a0a', borderColor: '#dc2626', color: '#f87171' } : {}}
      >
        {isLoading ? '⏳ Diagnosing...' : '🐛 Debug This Request'}
      </button>

      {!hasResponse && (
        <p className="ai-empty">Send a request first to enable debugging.</p>
      )}

      {output && (
        <>
          <div className={`ai-output ${isLoading ? 'ai-output--streaming' : ''}`}>
            {output}
          </div>
          <button className="ai-copy-btn" onClick={() => navigator.clipboard.writeText(output)}>
            📋 Copy
          </button>
        </>
      )}

      {error && <div className="ai-error">⚠ {error}</div>}
    </div>
  );
}
```

### `AITestGen.jsx`
```jsx
// apps/web/src/components/AISidebar/AITestGen.jsx
import { useState } from 'react';
import { useAIStream } from '../../hooks/useAIStream';

export default function AITestGen({ context }) {
  const { output, isLoading, error, stream, reset } = useAIStream();
  const [copied, setCopied] = useState(false);

  const hasResponse = context?.response?.status;

  const handleGenerate = () => {
    reset();
    stream('generate-tests', {
      request: context.request,
      response: context.response,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <p className="ai-empty" style={{ textAlign: 'left', marginBottom: 14 }}>
        Generates a JavaScript test suite for the current response — ready to paste into the Tests tab.
      </p>

      <button
        className="ai-run-btn"
        onClick={handleGenerate}
        disabled={isLoading || !hasResponse}
      >
        {isLoading ? '⏳ Generating...' : '✅ Generate Tests'}
      </button>

      {!hasResponse && (
        <p className="ai-empty">Send a request first to generate tests.</p>
      )}

      {output && (
        <>
          <div className={`ai-output ${isLoading ? 'ai-output--streaming' : ''}`}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
            {output}
          </div>
          <button className="ai-copy-btn" onClick={handleCopy}>
            {copied ? '✓ Copied!' : '📋 Copy to Tests Tab'}
          </button>
        </>
      )}

      {error && <div className="ai-error">⚠ {error}</div>}
    </div>
  );
}
```

### `AIChat.jsx`
```jsx
// apps/web/src/components/AISidebar/AIChat.jsx
import { useState, useRef, useEffect } from 'react';

export default function AIChat({ context }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm APIlot. I can see your current request and response. Ask me anything about this API, or how to fix an issue.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Add empty assistant message to stream into
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, context }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: updated[updated.length - 1].content + parsed.text,
                  };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: '⚠ Something went wrong. Please try again.',
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      {/* Message list */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                background: msg.role === 'user' ? '#0c4a6e' : '#0d1117',
                border: `1px solid ${msg.role === 'user' ? '#0369a1' : '#1e2433'}`,
                color: '#cbd5e1',
                fontSize: 12.5,
                fontFamily: 'JetBrains Mono, monospace',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {msg.content}
              {isLoading && i === messages.length - 1 && msg.role === 'assistant' && (
                <span style={{ animation: 'blink 0.8s step-end infinite', color: '#38bdf8' }}>▋</span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask anything about this API..."
          disabled={isLoading}
          style={{
            flex: 1,
            background: '#0d1117',
            border: '1px solid #1e2433',
            borderRadius: 6,
            padding: '10px 14px',
            color: '#e2e8f0',
            fontSize: 12.5,
            fontFamily: 'JetBrains Mono, monospace',
            outline: 'none',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          style={{
            padding: '10px 14px',
            background: '#0c4a6e',
            border: '1px solid #0369a1',
            borderRadius: 6,
            color: '#38bdf8',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
```

---

## Step 6 — Wire It Into Your App

In your main `App.jsx` or `Workspace.jsx`:

```jsx
// Add to your existing component
import { useState } from 'react';
import AISidebar from './components/AISidebar/AISidebar';

export default function App() {
  const [aiOpen, setAiOpen] = useState(false);

  // These should come from your existing state
  const currentRequest = { method, url, headers, body };
  const currentResponse = { status, statusText, data, duration };

  return (
    <div style={{ marginRight: aiOpen ? '420px' : '0', transition: 'margin 0.3s ease' }}>

      {/* ── Your existing app UI ── */}

      {/* AI toggle button — put this in your top navbar */}
      <button
        onClick={() => setAiOpen(!aiOpen)}
        style={{
          background: aiOpen ? '#0c4a6e' : 'transparent',
          border: '1px solid #1e2433',
          borderRadius: 6,
          color: '#38bdf8',
          padding: '6px 14px',
          cursor: 'pointer',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 13,
        }}
      >
        ✨ AI
      </button>

      {/* AI Sidebar */}
      <AISidebar
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        request={currentRequest}
        response={currentResponse}
      />
    </div>
  );
}
```

---

## Step 7 — Pass Correct Context Props

Make sure you're passing the right shape to `AISidebar`. Match your existing state variable names:

```javascript
// Minimum required shape:
const request = {
  method: 'GET',               // string
  url: 'https://...',          // string
  headers: {},                 // object
  body: null,                  // object or null
};

const response = {
  status: 200,                 // number
  statusText: 'OK',            // string
  data: { ... },               // parsed JSON body
  duration: 178,               // ms (you already track this)
};
```

---

## Checklist

- [ ] Create `apps/api/src/routes/ai.js` and register it
- [ ] Add `ANTHROPIC_API_KEY` to your `.env`
- [ ] Create `useAIStream.js` hook
- [ ] Create all 5 component files in `AISidebar/`
- [ ] Add `✨ AI` toggle button to your navbar
- [ ] Wire `AISidebar` into `App.jsx` with correct request/response props
- [ ] Test each tab — Explain, Debug, Tests, Chat

---

*AI Sidebar implementation guide for APIlot — React + JavaScript*
