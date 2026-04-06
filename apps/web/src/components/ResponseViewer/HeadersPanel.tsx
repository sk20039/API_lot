import React from 'react';

interface HeadersPanelProps {
  headers: Record<string, string>;
}

export function HeadersPanel({ headers }: HeadersPanelProps) {
  const entries = Object.entries(headers);

  if (entries.length === 0) {
    return <p className="text-xs text-muted-foreground p-3">No headers</p>;
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left px-3 py-2 text-muted-foreground font-medium w-1/3">Key</th>
            <th className="text-left px-3 py-2 text-muted-foreground font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key} className="border-b border-border/50 hover:bg-muted/20">
              <td className="px-3 py-1.5 font-mono text-blue-300">{key}</td>
              <td className="px-3 py-1.5 font-mono text-foreground break-all">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
