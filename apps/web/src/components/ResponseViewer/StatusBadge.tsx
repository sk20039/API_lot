import React from 'react';
import { ResponseMeta } from '@apilot/shared';

interface StatusBadgeProps {
  meta: ResponseMeta;
}

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'bg-green-900 text-green-300 border-green-700';
  if (status >= 300 && status < 400) return 'bg-blue-900 text-blue-300 border-blue-700';
  if (status >= 400 && status < 500) return 'bg-orange-900 text-orange-300 border-orange-700';
  if (status >= 500) return 'bg-red-900 text-red-300 border-red-700';
  return 'bg-gray-900 text-gray-300 border-gray-700';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function StatusBadge({ meta }: StatusBadgeProps) {
  return (
    <div className="flex items-center gap-3">
      <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-mono font-semibold ${getStatusColor(meta.statusCode)}`}>
        {meta.statusCode} {meta.statusText}
      </span>
      <span className="text-xs text-muted-foreground">{meta.duration}ms</span>
      <span className="text-xs text-muted-foreground">{formatSize(meta.size)}</span>
    </div>
  );
}
