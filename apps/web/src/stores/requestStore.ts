import { create } from 'zustand';
import { HttpMethod, RequestConfig, KeyValuePair, AuthConfig, ProxyResponse } from '@apilot/shared';
import { sendProxyRequest } from '../services/proxy';
import { applyVariablesToRequest } from '../utils/varParser';
import { useEnvironmentStore } from './environmentStore';
import { useHistoryStore } from './historyStore';

interface RequestState {
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: string;
  bodyType: 'none' | 'json' | 'text' | 'form';
  auth: AuthConfig;
  response: ProxyResponse | null;
  isLoading: boolean;
  error: string | null;
  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setParams: (params: KeyValuePair[]) => void;
  setHeaders: (headers: KeyValuePair[]) => void;
  setBody: (body: string) => void;
  setBodyType: (bodyType: 'none' | 'json' | 'text' | 'form') => void;
  setAuth: (auth: AuthConfig) => void;
  sendRequest: () => Promise<void>;
  loadFromHistory: (config: RequestConfig) => void;
}

export const useRequestStore = create<RequestState>((set, get) => ({
  method: 'GET',
  url: '',
  params: [],
  headers: [],
  body: '',
  bodyType: 'none',
  auth: { type: 'none' },
  response: null,
  isLoading: false,
  error: null,

  setMethod: (method) => set({ method }),
  setUrl: (url) => set({ url }),
  setParams: (params) => set({ params }),
  setHeaders: (headers) => set({ headers }),
  setBody: (body) => set({ body }),
  setBodyType: (bodyType) => set({ bodyType }),
  setAuth: (auth) => set({ auth }),

  sendRequest: async () => {
    const state = get();
    const config: RequestConfig = {
      method: state.method,
      url: state.url,
      params: state.params,
      headers: state.headers,
      body: state.body,
      bodyType: state.bodyType,
      auth: state.auth,
    };

    const variables = useEnvironmentStore.getState().getActiveVariables();
    const substitutedConfig = applyVariablesToRequest(config, variables);

    set({ isLoading: true, error: null, response: null });
    try {
      const response = await sendProxyRequest(substitutedConfig);
      set({ response, isLoading: false });
      useHistoryStore.getState().addEntry({ request: substitutedConfig, response });
    } catch (err: unknown) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
    }
  },

  loadFromHistory: (config: RequestConfig) => {
    set({
      method: config.method,
      url: config.url,
      params: config.params,
      headers: config.headers,
      body: config.body,
      bodyType: config.bodyType,
      auth: config.auth,
    });
  },
}));
