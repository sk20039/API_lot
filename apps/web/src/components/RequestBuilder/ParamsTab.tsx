import React from 'react';
import { KeyValuePair } from '@apilot/shared';
import { useRequestStore } from '@/stores/requestStore';

function KeyValueEditor({
  pairs,
  onChange,
  placeholder,
}: {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  placeholder?: string;
}) {
  const addRow = () => {
    onChange([...pairs, { key: '', value: '', enabled: true }]);
  };

  const updateRow = (index: number, field: keyof KeyValuePair, value: string | boolean) => {
    const updated = pairs.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    onChange(updated);
  };

  const removeRow = (index: number) => {
    onChange(pairs.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-1">
      {pairs.map((pair, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={pair.enabled}
            onChange={(e) => updateRow(index, 'enabled', e.target.checked)}
            className="flex-shrink-0"
          />
          <input
            type="text"
            value={pair.key}
            onChange={(e) => updateRow(index, 'key', e.target.value)}
            placeholder="Key"
            className="flex-1 bg-input border border-border rounded px-2 py-1 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            type="text"
            value={pair.value}
            onChange={(e) => updateRow(index, 'value', e.target.value)}
            placeholder={placeholder || 'Value'}
            className="flex-1 bg-input border border-border rounded px-2 py-1 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={() => removeRow(index)}
            className="text-muted-foreground hover:text-destructive text-xs px-1"
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={addRow}
        className="text-xs text-muted-foreground hover:text-foreground mt-1 text-left"
      >
        + Add row
      </button>
    </div>
  );
}

export function ParamsTab() {
  const { params, setParams } = useRequestStore();
  return (
    <div className="p-3">
      <KeyValueEditor pairs={params} onChange={setParams} />
    </div>
  );
}

export { KeyValueEditor };
