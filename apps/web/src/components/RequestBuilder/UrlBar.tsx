import React from 'react';
import { useRequestStore } from '@/stores/requestStore';
import { MethodSelector } from './MethodSelector';

export function UrlBar() {
  const { method, url, setMethod, setUrl, sendRequest, isLoading } = useRequestStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendRequest();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-0 p-3 border-b border-border">
      <MethodSelector value={method} onChange={setMethod} />
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL or paste text"
        className="flex-1 bg-input border border-l-0 border-border px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <button
        type="submit"
        disabled={isLoading || !url}
        className="bg-primary text-primary-foreground px-5 py-2 rounded-r-md text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}
