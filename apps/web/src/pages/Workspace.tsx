import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RequestBuilder } from '@/components/RequestBuilder';
import { ResponseViewer } from '@/components/ResponseViewer';
import { EnvSelector } from '@/components/Environment/EnvSelector';
import { AISidebar, AIContext } from '@/components/AISidebar/AISidebar';
import { useHistoryStore, HistoryEntry } from '@/stores/historyStore';
import { useRequestStore } from '@/stores/requestStore';
import { logout } from '@/services/auth';

function HistoryItem({ entry }: { entry: HistoryEntry }) {
  const loadFromHistory = useRequestStore((s) => s.loadFromHistory);
  const statusCode = entry.response.meta.statusCode;
  const statusColor =
    statusCode >= 500
      ? 'text-red-400'
      : statusCode >= 400
      ? 'text-orange-400'
      : 'text-green-400';

  return (
    <button
      onClick={() => loadFromHistory(entry.request)}
      className="w-full text-left px-3 py-2 hover:bg-muted/20 border-b border-border/50 flex flex-col gap-0.5"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-blue-300">{entry.request.method}</span>
        <span className={`text-xs font-mono ${statusColor}`}>{statusCode}</span>
      </div>
      <div className="text-xs text-muted-foreground truncate">{entry.request.url}</div>
      <div className="text-xs text-muted-foreground/60">
        {new Date(entry.timestamp).toLocaleTimeString()}
      </div>
    </button>
  );
}

function buildAIContext(state: ReturnType<typeof useRequestStore.getState>): AIContext | null {
  if (!state.response) return null;
  return {
    request: {
      method: state.method,
      url: state.url,
      headers: Object.fromEntries(
        state.headers.filter((h) => h.enabled && h.key).map((h) => [h.key, h.value])
      ),
      body: state.body ? (() => { try { return JSON.parse(state.body); } catch { return state.body; } })() : null,
    },
    response: {
      status: state.response.meta.statusCode,
      statusText: state.response.meta.statusText,
      data: state.response.body,
      duration: state.response.meta.duration,
    },
  };
}

export function Workspace() {
  const navigate = useNavigate();
  const { entries, clearHistory } = useHistoryStore();
  const [aiOpen, setAiOpen] = useState(false);

  const requestState = useRequestStore();
  const aiContext = buildAIContext(requestState);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className="h-screen flex flex-col bg-background overflow-hidden"
      style={{ marginRight: aiOpen ? '420px' : '0', transition: 'margin 0.3s ease' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary">APIlot</span>
          <span className="text-xs text-muted-foreground">API Testing</span>
        </div>
        <div className="flex items-center gap-3">
          <EnvSelector />
          <button
            onClick={() => setAiOpen(!aiOpen)}
            style={{
              background: aiOpen ? '#0c4a6e' : 'transparent',
              border: '1px solid #1e2433',
              borderRadius: 6,
              color: '#38bdf8',
              padding: '4px 12px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: 12,
            }}
          >
            ✨ AI
          </button>
          <button
            onClick={handleLogout}
            className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — history */}
        <aside className="w-[250px] flex-shrink-0 border-r border-border flex flex-col bg-card">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-xs font-medium">History</span>
            {entries.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex-1 overflow-auto">
            {entries.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3">No history yet</p>
            ) : (
              entries.map((entry) => <HistoryItem key={entry.id} entry={entry} />)
            )}
          </div>
        </aside>

        {/* Main panel */}
        <main className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
          <div className="flex-none" style={{ height: '42%' }}>
            <RequestBuilder />
          </div>
          <div className="flex-1 overflow-hidden">
            <ResponseViewer />
          </div>
        </main>
      </div>

      {/* AI Sidebar */}
      <AISidebar isOpen={aiOpen} onClose={() => setAiOpen(false)} context={aiContext} />
    </div>
  );
}
