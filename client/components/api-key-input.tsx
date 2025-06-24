"use client";

import { useState } from "react";
import { useApiKeyStore } from "@/store/useApiKeyStore";
import { Eye, EyeOff, Key, X } from "lucide-react";

interface ApiKeyInputProps {
  onApiKeySet?: () => void;
}

export function ApiKeyInput({ onApiKeySet }: ApiKeyInputProps) {
  const [tempApiKey, setTempApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const { setApiKey, hasApiKey, clearApiKey } = useApiKeyStore();

  const handleSetApiKey = () => {
    if (tempApiKey.trim()) {
      setApiKey(tempApiKey.trim());
      setTempApiKey("");
      onApiKeySet?.();
    }
  };

  const handleClearApiKey = () => {
    clearApiKey();
    setTempApiKey("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSetApiKey();
    }
  };

  if (hasApiKey()) {
    return (
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-900/50 border border-neutral-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Key className="w-3 h-3 text-green-400" />
          <span className="text-xs text-neutral-400">API Key configured</span>
        </div>
        <button
          onClick={handleClearApiKey}
          className="text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          value={tempApiKey}
          onChange={(e) => setTempApiKey(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your OpenAI API key (sk-...)"
          className="w-full pl-3 pr-20 py-2 text-xs bg-neutral-900/50 border border-neutral-800 rounded-lg text-neutral-300 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 focus:bg-neutral-900"
          type={showApiKey ? "text" : "password"}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            {showApiKey ? (
              <EyeOff className="w-3 h-3" />
            ) : (
              <Eye className="w-3 h-3" />
            )}
          </button>
          {tempApiKey.trim() && (
            <button
              onClick={handleSetApiKey}
              className="ml-1 px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded transition-colors"
            >
              Set
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
