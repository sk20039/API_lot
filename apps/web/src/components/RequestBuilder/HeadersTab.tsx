import React from 'react';
import { useRequestStore } from '@/stores/requestStore';
import { KeyValueEditor } from './ParamsTab';

export function HeadersTab() {
  const { headers, setHeaders } = useRequestStore();
  return (
    <div className="p-3">
      <KeyValueEditor pairs={headers} onChange={setHeaders} placeholder="Value" />
    </div>
  );
}
