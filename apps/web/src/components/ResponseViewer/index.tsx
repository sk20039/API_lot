import React from 'react';
import { useRequestStore } from '@/stores/requestStore';
import { StatusBadge } from './StatusBadge';
import { ResponseTabs } from './ResponseTabs';

export function ResponseViewer() {
  const { response, isLoading, error } = useRequestStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full border border-border rounded-md bg-card">
        <div className="text-muted-foreground text-sm">Sending request...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full border border-border rounded-md bg-card">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex flex-col items-center justify-center h-full border border-border rounded-md bg-card gap-2">
        <div className="text-muted-foreground text-sm">Hit Send to get a response</div>
        <div className="text-muted-foreground text-xs">or load a request from history</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border border-border rounded-md bg-card overflow-hidden">
      <div className="flex items-center px-3 py-2 border-b border-border flex-shrink-0">
        <StatusBadge meta={response.meta} />
      </div>
      <div className="flex-1 overflow-hidden">
        <ResponseTabs response={response} />
      </div>
    </div>
  );
}
