import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Environment, EnvVariable } from '@apilot/shared';

interface EnvironmentState {
  environments: Environment[];
  activeEnvironmentId: string | null;
  setActiveEnvironment: (id: string | null) => void;
  addEnvironment: (name: string) => void;
  updateEnvironment: (id: string, updates: Partial<Environment>) => void;
  deleteEnvironment: (id: string) => void;
  getActiveVariables: () => EnvVariable[];
}

export const useEnvironmentStore = create<EnvironmentState>()(
  persist(
    (set, get) => ({
      environments: [],
      activeEnvironmentId: null,

      setActiveEnvironment: (id) => set({ activeEnvironmentId: id }),

      addEnvironment: (name) => {
        const env: Environment = {
          id: Math.random().toString(36).slice(2) + Date.now().toString(36),
          name,
          variables: [],
        };
        set((state) => ({ environments: [...state.environments, env] }));
      },

      updateEnvironment: (id, updates) => {
        set((state) => ({
          environments: state.environments.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        }));
      },

      deleteEnvironment: (id) => {
        set((state) => ({
          environments: state.environments.filter((e) => e.id !== id),
          activeEnvironmentId:
            state.activeEnvironmentId === id ? null : state.activeEnvironmentId,
        }));
      },

      getActiveVariables: () => {
        const { environments, activeEnvironmentId } = get();
        if (!activeEnvironmentId) return [];
        const env = environments.find((e) => e.id === activeEnvironmentId);
        return env ? env.variables.filter((v) => v.enabled) : [];
      },
    }),
    { name: 'apilot_environments' }
  )
);
