"use client";

import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useApiKeyStore } from "@/store/useApiKeyStore";
import { ApiKeyInput } from "@/components/api-key-input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MonitorIcon,
  ArrowUpIcon,
  ChevronDown,
  LayoutDashboard,
  CreditCard,
  Users,
  Settings,
} from "lucide-react";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;

      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);
  return { textareaRef, adjustHeight };
}

const MODEL_OPTIONS = [
  { value: "gpt-4.1", label: "GPT-4.1" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
];

export function PromptInput() {
  const [value, setValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4.1");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(false);
  const router = useRouter();
  const { hasApiKey } = useApiKeyStore();
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isModelDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest(".model-selector")) {
          setIsModelDropdownOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModelDropdownOpen]);
  const handleGenerate = async () => {
    if (!value.trim()) return;

    if (!hasApiKey()) {
      setShowApiKeyAlert(true);
      return;
    }

    setIsGenerating(true);
    const projectId = `project-${Math.random().toString(36).substring(2, 10)}`;
    const encodedMessage = encodeURIComponent(value);
    const encodedModel = encodeURIComponent(selectedModel);

    router.push(
      `/workspace/${projectId}?message=${encodedMessage}&model=${encodedModel}`
    );

    setIsGenerating(false);
  };
  const handleActionButtonClick = (label: string) => {
    let prompt = "";
    switch (label) {
      case "SaaS Landing Page":
        prompt =
          "Create a modern landing page for a SaaS platform with hero section, features, and CTA";
        break;
      case "Dashboard UI":
        prompt =
          "Create a clean dashboard interface with navigation, cards, and data visualization";
        break;
      case "Pricing Page":
        prompt =
          "Create a pricing page with multiple tiers and feature comparison";
        break;
      case "User Profile":
        prompt =
          "Create a user profile page with account settings, preferences, and profile management";
        break;
      case "Settings Panel":
        prompt =
          "Create a comprehensive settings panel with tabs for account, billing, and preferences";
        break;
      default:
        return;
    }
    setValue(prompt);
    adjustHeight();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.metaKey) {
      e.preventDefault();
      handleGenerate();
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        handleGenerate();
      }
    }
  };
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-8">
      <div className="w-full">
        <ApiKeyInput />{" "}
        <div className="relative bg-neutral-900 rounded-xl border border-neutral-800 mt-4">
          <div className="overflow-y-auto">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="How can BuildAI help you today?"
              className={cn(
                "w-full px-4 py-3",
                "resize-none",
                "bg-transparent",
                "border-none",
                "text-white text-sm",
                "focus:outline-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-neutral-500 placeholder:text-sm",
                "min-h-[60px]"
              )}
              style={{
                overflow: "hidden",
              }}
            />
          </div>{" "}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              {/* Model Selector - moved to bottom left */}
              <div className="relative model-selector">
                <button
                  type="button"
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="flex items-center gap-1 px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-md border border-neutral-700 text-neutral-300 text-xs transition-colors"
                >
                  <span>
                    {
                      MODEL_OPTIONS.find((m) => m.value === selectedModel)
                        ?.label
                    }
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {isModelDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-1 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg min-w-[120px] z-20">
                    {MODEL_OPTIONS.map((model) => (
                      <button
                        key={model.value}
                        type="button"
                        onClick={() => {
                          setSelectedModel(model.value);
                          setIsModelDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-xs hover:bg-neutral-700 transition-colors first:rounded-t-md last:rounded-b-md",
                          selectedModel === model.value
                            ? "text-white bg-neutral-700"
                            : "text-neutral-300"
                        )}
                      >
                        {model.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !value.trim()}
                className={cn(
                  "px-1.5 py-1.5 rounded-lg text-sm transition-colors border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 flex items-center justify-between gap-1",
                  value.trim() && !isGenerating
                    ? "bg-white text-black hover:bg-gray-100"
                    : "text-zinc-400",
                  isGenerating && "opacity-50 cursor-not-allowed"
                )}
              >
                <ArrowUpIcon
                  className={cn(
                    "w-4 h-4",
                    value.trim() && !isGenerating
                      ? "text-black"
                      : "text-zinc-400"
                  )}
                />
                <span className="sr-only">
                  {isGenerating ? "Generating..." : "Send"}
                </span>
              </button>
            </div>
          </div>{" "}
        </div>
        <div className="flex items-center justify-center mt-3"></div>{" "}
        <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
          <ActionButton
            icon={<MonitorIcon className="w-4 h-4" />}
            label="SaaS Landing Page"
            onClick={handleActionButtonClick}
          />
          <ActionButton
            icon={<LayoutDashboard className="w-4 h-4" />}
            label="Dashboard UI"
            onClick={handleActionButtonClick}
          />
          <ActionButton
            icon={<CreditCard className="w-4 h-4" />}
            label="Pricing Page"
            onClick={handleActionButtonClick}
          />
          <ActionButton
            icon={<Users className="w-4 h-4" />}
            label="User Profile"
            onClick={handleActionButtonClick}
          />
          <ActionButton
            icon={<Settings className="w-4 h-4" />}
            label="Settings Panel"
            onClick={handleActionButtonClick}
          />
        </div>
      </div>
      <AlertDialog open={showApiKeyAlert} onOpenChange={setShowApiKeyAlert}>
        <AlertDialogContent className="bg-[#0a0a0a] border-gray-800 [&>button]:text-gray-400 [&>button]:hover:text-white [&>button]:hover:bg-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              API Key Required
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Please set your OpenAI API key first to continue generating
              content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowApiKeyAlert(false)}
              className="bg-white text-black hover:bg-gray-200"
            >
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: (label: string) => void;
}

function ActionButton({ icon, label, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(label)}
      className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-full border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}
