import React from 'react';
import { useAIStream } from '@/hooks/useAIStream';
import { AIContext } from './AISidebar';

interface Props { context: AIContext | null; }

export function AIDebug({ context }: Props) {
  const { output, isLoading, error, stream, reset } = useAIStream();
  const hasResponse = Boolean(context?.response?.status);
  const isError = (context?.response?.status ?? 0) >= 400;

  const handleDebug = () => {
    if (!hasResponse || !context) return;
    reset();
    stream('debug', { request: context.request, response: context.response });
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
          ✓ Response looks healthy ({context!.response.status}). You can still run a debug analysis.
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
      {!hasResponse && <p className="ai-empty">Send a request first to enable debugging.</p>}
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
