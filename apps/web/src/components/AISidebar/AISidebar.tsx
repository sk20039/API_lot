import React, { useState } from 'react';
import { AIExplain } from './AIExplain';
import { AIDebug } from './AIDebug';
import { AITestGen } from './AITestGen';
import { AIChat } from './AIChat';
import './AISidebar.css';

export interface AIRequestContext {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: unknown;
}

export interface AIResponseContext {
  status: number;
  statusText: string;
  data: unknown;
  duration: number;
}

export interface AIContext {
  request: AIRequestContext;
  response: AIResponseContext;
}

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  context: AIContext | null;
}

type Tab = 'explain' | 'debug' | 'tests' | 'chat';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'explain', label: 'Explain', icon: '🔍' },
  { id: 'debug',   label: 'Debug',   icon: '🐛' },
  { id: 'tests',   label: 'Tests',   icon: '✅' },
  { id: 'chat',    label: 'Chat',    icon: '💬' },
];

export function AISidebar({ isOpen, onClose, context }: AISidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('explain');

  return (
    <>
      {isOpen && <div className="ai-backdrop" onClick={onClose} />}

      <div className={`ai-sidebar ${isOpen ? 'ai-sidebar--open' : ''}`}>
        <div className="ai-sidebar__header">
          <div className="ai-sidebar__title">
            <span className="ai-sidebar__sparkle">✨</span>
            <span>AIlot Assistant</span>
          </div>
          <button className="ai-sidebar__close" onClick={onClose}>✕</button>
        </div>

        <div className="ai-sidebar__tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`ai-tab ${activeTab === tab.id ? 'ai-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="ai-sidebar__content">
          {activeTab === 'explain' && <AIExplain context={context} />}
          {activeTab === 'debug'   && <AIDebug   context={context} />}
          {activeTab === 'tests'   && <AITestGen  context={context} />}
          {activeTab === 'chat'    && <AIChat     context={context} />}
        </div>
      </div>
    </>
  );
}
