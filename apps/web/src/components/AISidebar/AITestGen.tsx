import React, { useState } from 'react';
import { useAIStream } from '@/hooks/useAIStream';
import { AIContext } from './AISidebar';

type TestFormat = 'postman-js' | 'plain-js' | 'python' | 'shell';

const FORMAT_OPTIONS: { value: TestFormat; label: string; description: string }[] = [
  { value: 'postman-js', label: 'Postman JS',   description: 'pm.test() style — paste into Postman Tests tab' },
  { value: 'plain-js',   label: 'Plain JS',     description: 'fetch + console.assert, no dependencies' },
  { value: 'python',     label: 'Python',       description: 'pytest + requests library' },
  { value: 'shell',      label: 'Shell / curl', description: 'bash script using curl' },
];

interface Props { context: AIContext | null; }

export function AITestGen({ context }: Props) {
  const { output, isLoading, error, stream, reset } = useAIStream();
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<TestFormat>('postman-js');
  const hasResponse = Boolean(context?.response?.status);

  const handleGenerate = () => {
    if (!hasResponse || !context) return;
    reset();
    stream('generate-tests', { request: context.request, response: context.response, format });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedOption = FORMAT_OPTIONS.find(o => o.value === format)!;

  return (
    <div>
      <p className="ai-empty" style={{ textAlign: 'left', marginBottom: 14 }}>
        Generates a test suite for the current response in your chosen format.
      </p>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Format
        </label>
        <select
          value={format}
          onChange={e => { setFormat(e.target.value as TestFormat); reset(); }}
          style={{
            width: '100%',
            padding: '6px 8px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--background)',
            color: 'var(--foreground)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {FORMAT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4, marginBottom: 0 }}>
          {selectedOption.description}
        </p>
      </div>

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
