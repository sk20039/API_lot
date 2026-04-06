import { ProxyResponse, RequestConfig } from '@apilot/shared';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  userId?: string;
  request: RequestConfig;
  response: ProxyResponse;
  timestamp: string;
}

const MAX_HISTORY = 100;

export const users: User[] = [];
export const history: HistoryEntry[] = [];

export function addHistoryEntry(entry: HistoryEntry): void {
  history.unshift(entry);
  if (history.length > MAX_HISTORY) {
    history.splice(MAX_HISTORY);
  }
}

export function clearHistory(userId?: string): void {
  if (userId) {
    const indices: number[] = [];
    history.forEach((entry, i) => {
      if (entry.userId === userId) indices.push(i);
    });
    for (let i = indices.length - 1; i >= 0; i--) {
      history.splice(indices[i], 1);
    }
  } else {
    history.splice(0, history.length);
  }
}
