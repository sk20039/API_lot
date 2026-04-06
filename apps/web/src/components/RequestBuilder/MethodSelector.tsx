import React from 'react';
import { HttpMethod } from '@apilot/shared';

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-green-400',
  POST: 'text-yellow-400',
  PUT: 'text-blue-400',
  PATCH: 'text-purple-400',
  DELETE: 'text-red-400',
  HEAD: 'text-cyan-400',
  OPTIONS: 'text-gray-400',
};

interface MethodSelectorProps {
  value: HttpMethod;
  onChange: (method: HttpMethod) => void;
}

export function MethodSelector({ value, onChange }: MethodSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as HttpMethod)}
      className={`bg-secondary border border-border rounded-l-md px-3 py-2 font-mono font-semibold text-sm focus:outline-none focus:ring-1 focus:ring-ring ${METHOD_COLORS[value]}`}
    >
      {METHODS.map((method) => (
        <option key={method} value={method} className={METHOD_COLORS[method]}>
          {method}
        </option>
      ))}
    </select>
  );
}
