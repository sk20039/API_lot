import React from 'react';
import { AuthConfig, AuthType } from '@apilot/shared';
import { useRequestStore } from '@/stores/requestStore';

export function AuthTab() {
  const { auth, setAuth } = useRequestStore();

  const handleTypeChange = (type: AuthType) => {
    switch (type) {
      case 'none': setAuth({ type: 'none' }); break;
      case 'bearer': setAuth({ type: 'bearer', token: '' }); break;
      case 'basic': setAuth({ type: 'basic', username: '', password: '' }); break;
      case 'apiKey': setAuth({ type: 'apiKey', key: '', value: '', in: 'header' }); break;
    }
  };

  return (
    <div className="p-3 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Type:</span>
        {(['none', 'bearer', 'basic', 'apiKey'] as AuthType[]).map((type) => (
          <label key={type} className="flex items-center gap-1 text-xs cursor-pointer">
            <input
              type="radio"
              name="authType"
              value={type}
              checked={auth.type === type}
              onChange={() => handleTypeChange(type)}
              className="accent-primary"
            />
            <span className={auth.type === type ? 'text-foreground' : 'text-muted-foreground'}>
              {type}
            </span>
          </label>
        ))}
      </div>

      {auth.type === 'bearer' && (
        <input
          type="text"
          value={auth.token}
          onChange={(e) => setAuth({ ...auth, token: e.target.value })}
          placeholder="Bearer token"
          className="bg-input border border-border rounded px-2 py-1 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      )}

      {auth.type === 'basic' && (
        <div className="flex gap-2">
          <input
            type="text"
            value={auth.username}
            onChange={(e) => setAuth({ ...auth, username: e.target.value })}
            placeholder="Username"
            className="flex-1 bg-input border border-border rounded px-2 py-1 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            type="password"
            value={auth.password}
            onChange={(e) => setAuth({ ...auth, password: e.target.value })}
            placeholder="Password"
            className="flex-1 bg-input border border-border rounded px-2 py-1 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      )}

      {auth.type === 'apiKey' && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={auth.key}
              onChange={(e) => setAuth({ ...auth, key: e.target.value })}
              placeholder="Key name"
              className="flex-1 bg-input border border-border rounded px-2 py-1 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <input
              type="text"
              value={auth.value}
              onChange={(e) => setAuth({ ...auth, value: e.target.value })}
              placeholder="Value"
              className="flex-1 bg-input border border-border rounded px-2 py-1 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Add to:</span>
            {(['header', 'query'] as const).map((loc) => (
              <label key={loc} className="flex items-center gap-1 text-xs cursor-pointer">
                <input
                  type="radio"
                  name="apiKeyIn"
                  value={loc}
                  checked={auth.in === loc}
                  onChange={() => setAuth({ ...auth, in: loc })}
                  className="accent-primary"
                />
                <span>{loc}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
