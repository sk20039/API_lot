import React from 'react';
import Editor from '@monaco-editor/react';
import { useRequestStore } from '@/stores/requestStore';

export function BodyTab() {
  const { body, bodyType, setBody, setBodyType } = useRequestStore();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-3 py-2 border-b border-border">
        {(['none', 'json', 'text', 'form'] as const).map((type) => (
          <label key={type} className="flex items-center gap-1 text-xs cursor-pointer">
            <input
              type="radio"
              name="bodyType"
              value={type}
              checked={bodyType === type}
              onChange={() => setBodyType(type)}
              className="accent-primary"
            />
            <span className={bodyType === type ? 'text-foreground' : 'text-muted-foreground'}>
              {type}
            </span>
          </label>
        ))}
      </div>
      {bodyType !== 'none' && (
        <div className="flex-1 min-h-[120px]">
          <Editor
            height="150px"
            language={bodyType === 'json' ? 'json' : 'plaintext'}
            value={body}
            onChange={(val) => setBody(val || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 12,
              lineNumbers: 'off',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 8 },
            }}
          />
        </div>
      )}
    </div>
  );
}
