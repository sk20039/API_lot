import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RequestConfig, ProxyResponse } from '@apilot/shared';

export interface HistoryEntry {
  id: string;
  request: RequestConfig;
  response: ProxyResponse;
  timestamp: string;
}

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (entry: { request: RequestConfig; response: ProxyResponse }) => void;
  clearHistory: () => void;
  removeEntry: (id: string) => void;
}

const MAX_ENTRIES = 50;

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: ({ request, response }) => {
        const entry: HistoryEntry = {
          id: Math.random().toString(36).slice(2) + Date.now().toString(36),
          request,
          response,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          entries: [entry, ...state.entries].slice(0, MAX_ENTRIES),
        }));
      },
      clearHistory: () => set({ entries: [] }),
      removeEntry: (id) =>
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
    }),
    { name: 'apilot_history' }
  )
);
