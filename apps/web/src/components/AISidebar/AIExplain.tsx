import React from 'react';
import { useAIStream } from '@/hooks/useAIStream';
import { AIContext } from './AISidebar';

interface Props { context: AIContext | null; }

export function AIExplain({ context }: Props) {
  const { output, isLoading, error, stream, reset } = useAIStream();
  const hasResponse = Boolean(context?.response?.status);

  const handleExplain = () => {
    if (!hasResponse || !context) return;
    reset();
    stream('explain', { request: context.request, response: context.response });
  };

  return (
    <div>
      <p className="ai-empty" style={{ textAlign: 'left', marginBottom: 14 }}>
        Explains what the response means, what each field does, and flags anything unusual.
      </p>
      <button className="ai-run-btn" onClick={handleExplain} disabled={isLoading || !hasResponse}>
        {isLoading ? '⏳ Analyzing...' : '🔍 Explain This Response'}
      </button>
      {!hasResponse && <p className="ai-empty">Send a request first to enable this feature.</p>}
      {output && (
        <>
          <div className={`ai-output ${isLoading ? 'ai-output--streaming' : ''}`}>{output}</div>
          <button className="ai-copy-btn" onClick={() => navigator.clipboard.writeText(output)}>
            📋 Copy
          </button>
        </>
      )}
      {error && <div className="ai-error">⚠ {error}</div>}
    </div>
  );
}
