import React from 'react';
import Editor from '@monaco-editor/react';

interface JsonViewerProps {
  content: unknown;
}

export function JsonViewer({ content }: JsonViewerProps) {
  const formatted = typeof content === 'string'
    ? content
    : JSON.stringify(content, null, 2);

  const language = typeof content === 'object' ? 'json' : 'plaintext';

  return (
    <Editor
      height="100%"
      language={language}
      value={formatted}
      theme="vs-dark"
      options={{
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 12,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: 'on',
        padding: { top: 8 },
      }}
    />
  );
}
