import React, { useState } from 'react';
import { ProxyResponse } from '@apilot/shared';
import { JsonViewer } from './JsonViewer';
import { HeadersPanel } from './HeadersPanel';

type Tab = 'body' | 'headers' | 'raw';

interface ResponseTabsProps {
  response: ProxyResponse;
}

export function ResponseTabs({ response }: ResponseTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('body');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'body', label: 'Body' },
    { id: 'headers', label: `Headers (${Object.keys(response.headers).length})` },
    { id: 'raw', label: 'Raw' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-border flex-shrink-0">
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
      <div className="flex-1 overflow-hidden">
        {activeTab === 'body' && <JsonViewer content={response.body} />}
        {activeTab === 'headers' && <HeadersPanel headers={response.headers} />}
        {activeTab === 'raw' && <JsonViewer content={response.bodyRaw} />}
      </div>
    </div>
  );
}
