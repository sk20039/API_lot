import React, { useState } from 'react';
import { useEnvironmentStore } from '@/stores/environmentStore';
import { EnvVariable } from '@apilot/shared';

interface EnvEditorProps {
  onClose: () => void;
}

export function EnvEditor({ onClose }: EnvEditorProps) {
  const { environments, addEnvironment, updateEnvironment, deleteEnvironment } = useEnvironmentStore();
  const [selectedId, setSelectedId] = useState<string | null>(environments[0]?.id || null);
  const [newEnvName, setNewEnvName] = useState('');

  const selectedEnv = environments.find((e) => e.id === selectedId);

  const handleAddEnv = () => {
    if (!newEnvName.trim()) return;
    addEnvironment(newEnvName.trim());
    setNewEnvName('');
  };

  const handleUpdateVariables = (variables: EnvVariable[]) => {
    if (!selectedId) return;
    updateEnvironment(selectedId, { variables });
  };

  const addVariable = () => {
    if (!selectedEnv) return;
    handleUpdateVariables([
      ...selectedEnv.variables,
      { key: '', value: '', enabled: true },
    ]);
  };

  const updateVariable = (index: number, field: keyof EnvVariable, value: string | boolean) => {
    if (!selectedEnv) return;
    const updated = selectedEnv.variables.map((v, i) =>
      i === index ? { ...v, [field]: value } : v
    );
    handleUpdateVariables(updated);
  };

  const removeVariable = (index: number) => {
    if (!selectedEnv) return;
    handleUpdateVariables(selectedEnv.variables.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg w-[700px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">Manage Environments</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">×</button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r border-border flex flex-col">
            <div className="flex-1 overflow-auto">
              {environments.map((env) => (
                <button
                  key={env.id}
                  onClick={() => setSelectedId(env.id)}
                  className={`w-full text-left px-3 py-2 text-xs truncate ${
                    selectedId === env.id
                      ? 'bg-primary/20 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                  }`}
                >
                  {env.name}
                </button>
              ))}
            </div>
            <div className="p-2 border-t border-border flex gap-1">
              <input
                type="text"
                value={newEnvName}
                onChange={(e) => setNewEnvName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddEnv()}
                placeholder="New env..."
                className="flex-1 bg-input border border-border rounded px-2 py-1 text-xs text-foreground placeholder-muted-foreground focus:outline-none"
              />
              <button
                onClick={handleAddEnv}
                className="text-xs bg-primary text-primary-foreground rounded px-2 py-1"
              >
                +
              </button>
            </div>
          </div>
          {/* Variables editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedEnv ? (
              <>
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <span className="text-xs font-medium">{selectedEnv.name}</span>
                  <button
                    onClick={() => {
                      deleteEnvironment(selectedEnv.id);
                      setSelectedId(null);
                    }}
                    className="text-xs text-destructive hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2 text-xs text-muted-foreground mb-1">
                      <span className="w-4"></span>
                      <span className="flex-1">Variable</span>
                      <span className="flex-1">Value</span>
                      <span className="w-4"></span>
                    </div>
                    {selectedEnv.variables.map((variable, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={variable.enabled}
                          onChange={(e) => updateVariable(index, 'enabled', e.target.checked)}
                        />
                        <input
                          type="text"
                          value={variable.key}
                          onChange={(e) => updateVariable(index, 'key', e.target.value)}
                          placeholder="variable_name"
                          className="flex-1 bg-input border border-border rounded px-2 py-1 text-xs text-foreground placeholder-muted-foreground focus:outline-none"
                        />
                        <input
                          type="text"
                          value={variable.value}
                          onChange={(e) => updateVariable(index, 'value', e.target.value)}
                          placeholder="value"
                          className="flex-1 bg-input border border-border rounded px-2 py-1 text-xs text-foreground placeholder-muted-foreground focus:outline-none"
                        />
                        <button
                          onClick={() => removeVariable(index)}
                          className="text-muted-foreground hover:text-destructive text-xs px-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addVariable}
                      className="text-xs text-muted-foreground hover:text-foreground mt-1 text-left"
                    >
                      + Add variable
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center flex-1 text-xs text-muted-foreground">
                Select or create an environment
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
