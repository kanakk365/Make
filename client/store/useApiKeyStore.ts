import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const AVAILABLE_MODELS = [
  { id: 'gpt-4.1', name: 'GPT-4.1 (Latest)', description: 'Newest and most capable model from OpenAI' },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable model, best for complex projects' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and cost-effective, good for most projects' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Previous generation flagship model' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Most affordable option' },
] as const;

export type ModelId = typeof AVAILABLE_MODELS[number]['id'];

interface ApiKeyStore {
  apiKey: string | null;
  selectedModel: ModelId;
  setApiKey: (key: string) => void;
  setModel: (model: ModelId) => void;
  clearApiKey: () => void;
  hasApiKey: () => boolean;
}

export const useApiKeyStore = create<ApiKeyStore>()(
  persist(    (set, get) => ({
      apiKey: null,
      selectedModel: 'gpt-4.1',
      setApiKey: (key: string) => set({ apiKey: key }),
      setModel: (model: ModelId) => set({ selectedModel: model }),
      clearApiKey: () => set({ apiKey: null }),
      hasApiKey: () => Boolean(get().apiKey),
    }),
    {
      name: 'cloneit-api-key',
    }
  )
);
