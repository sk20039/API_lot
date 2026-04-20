import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Shared streaming helper ────────────────────────────────────────────────
async function streamToResponse(
  res: Response,
  messages: Anthropic.MessageParam[],
  systemPrompt: string
): Promise<void> {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
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
  } catch (err: unknown) {
    const error = err as Error;
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}

// ─── 1. Explain Response ────────────────────────────────────────────────────
router.post('/explain', async (req: Request, res: Response) => {
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

// ─── 2. Debug Error ─────────────────────────────────────────────────────────
router.post('/debug', async (req: Request, res: Response) => {
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

// ─── 3. Generate Tests ──────────────────────────────────────────────────────
type TestFormat = 'postman-js' | 'plain-js' | 'python' | 'shell';

function buildTestPrompt(
  request: { method: string; url: string },
  response: { status: number; data: unknown },
  format: TestFormat
): { userContent: string; systemPrompt: string } {
  const base = `REQUEST: ${request.method} ${request.url}
RESPONSE STATUS: ${response.status}
RESPONSE BODY: ${JSON.stringify(response.data, null, 2)}`;

  switch (format) {
    case 'plain-js':
      return {
        userContent: `Generate plain JavaScript test assertions for this API response using fetch and console.assert (no external libraries).

${base}

Use this style:
const res = await fetch("${request.url}");
const body = await res.json();
console.assert(res.status === 200, "Expected 200");
console.assert(typeof body.id === "number", "id should be a number");

Include tests for status code, required fields, and data types.
Return ONLY the JavaScript code, no explanation.`,
        systemPrompt: 'You are an API test engineer. Return only clean, runnable plain JavaScript test code using fetch and console.assert.',
      };

    case 'python':
      return {
        userContent: `Generate Python test assertions for this API response using pytest and the requests library.

${base}

Use this style:
import requests
import pytest

def test_api_response():
    response = requests.${request.method.toLowerCase()}("${request.url}")
    assert response.status_code == 200
    body = response.json()
    assert "id" in body
    assert isinstance(body["id"], int)

Include tests for status code, required fields, and data types.
Return ONLY the Python code, no explanation.`,
        systemPrompt: 'You are an API test engineer. Return only clean, runnable Python test code using pytest and requests.',
      };

    case 'shell':
      return {
        userContent: `Generate shell script test assertions for this API response using curl and bash.

${base}

Use this style:
#!/bin/bash
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${request.url}")
[ "$STATUS" -eq 200 ] && echo "PASS: status 200" || echo "FAIL: expected 200, got $STATUS"

BODY=$(curl -s "${request.url}")
echo "$BODY" | grep -q '"id"' && echo "PASS: id field exists" || echo "FAIL: id field missing"

Include tests for status code and key field presence.
Return ONLY the shell script, no explanation.`,
        systemPrompt: 'You are an API test engineer. Return only clean, runnable bash shell script test code using curl.',
      };

    case 'postman-js':
    default:
      return {
        userContent: `Generate JavaScript test assertions for this API response.

${base}

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
        systemPrompt: 'You are an API test engineer. Return only clean, runnable JavaScript test code.',
      };
  }
}

router.post('/generate-tests', async (req: Request, res: Response) => {
  const { request, response, format = 'postman-js' } = req.body;
  const { userContent, systemPrompt } = buildTestPrompt(request, response, format as TestFormat);

  await streamToResponse(res, [{ role: 'user', content: userContent }], systemPrompt);
});

// ─── 4. AI Chat ─────────────────────────────────────────────────────────────
router.post('/chat', async (req: Request, res: Response) => {
  const { messages, context } = req.body;

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
