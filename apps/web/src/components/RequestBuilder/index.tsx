import React, { useState } from 'react';
import { UrlBar } from './UrlBar';
import { ParamsTab } from './ParamsTab';
import { HeadersTab } from './HeadersTab';
import { BodyTab } from './BodyTab';
import { AuthTab } from './AuthTab';

type Tab = 'params' | 'headers' | 'body' | 'auth';

const tabs: { id: Tab; label: string }[] = [
  { id: 'params', label: 'Params' },
  { id: 'headers', label: 'Headers' },
  { id: 'body', label: 'Body' },
  { id: 'auth', label: 'Auth' },
];

export function RequestBuilder() {
  const [activeTab, setActiveTab] = useState<Tab>('params');

  return (
    <div className="flex flex-col border border-border rounded-md overflow-hidden bg-card">
      <UrlBar />
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-foreground border-b-2 border-primary -mb-px'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        {activeTab === 'params' && <ParamsTab />}
        {activeTab === 'headers' && <HeadersTab />}
        {activeTab === 'body' && <BodyTab />}
        {activeTab === 'auth' && <AuthTab />}
      </div>
    </div>
  );
}
