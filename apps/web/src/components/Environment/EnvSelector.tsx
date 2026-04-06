import React, { useState } from 'react';
import { useEnvironmentStore } from '@/stores/environmentStore';
import { EnvEditor } from './EnvEditor';

export function EnvSelector() {
  const { environments, activeEnvironmentId, setActiveEnvironment } = useEnvironmentStore();
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <select
          value={activeEnvironmentId || ''}
          onChange={(e) => setActiveEnvironment(e.target.value || null)}
          className="bg-secondary border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">No Environment</option>
          {environments.map((env) => (
            <option key={env.id} value={env.id}>
              {env.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setEditorOpen(true)}
          className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1"
        >
          Manage
        </button>
      </div>
      {editorOpen && <EnvEditor onClose={() => setEditorOpen(false)} />}
    </>
  );
}
