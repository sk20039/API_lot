import React, { useState } from 'react';
import { useAIStream } from '@/hooks/useAIStream';
import { AIContext } from './AISidebar';

interface Props { context: AIContext | null; }

export function AITestGen({ context }: Props) {
  const { output, isLoading, error, stream, reset } = useAIStream();
  const [copied, setCopied] = useState(false);
  const hasResponse = Boolean(context?.response?.status);

  const handleGenerate = () => {
    if (!hasResponse || !context) return;
    reset();
    stream('generate-tests', { request: context.request, response: context.response });
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
      <button className="ai-run-btn" onClick={handleGenerate} disabled={isLoading || !hasResponse}>
        {isLoading ? '⏳ Generating...' : '✅ Generate Tests'}
      </button>
      {!hasResponse && <p className="ai-empty">Send a request first to generate tests.</p>}
      {output && (
        <>
          <div
            className={`ai-output ${isLoading ? 'ai-output--streaming' : ''}`}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
          >
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
