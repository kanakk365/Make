"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChatMessage } from "@/components/chat-message";
import { CodeEditor } from "@/components/code-editor";
import { FileTree } from "@/components/file-tree";
import {
  ArrowLeft,
  Send,
  Download,
  Github,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Step, FileItem, StepType } from "@/lib/types";
import { parseXml } from "@/lib/parse";
import { useWebContainer } from "@/app/hooks/useWebContainer";
import { PreviewContainer } from "@/components/preview-container";
import { useApiKeyStore } from "@/store/useApiKeyStore";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function WorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id as string;
  const initialMessage = searchParams.get("message");
  const webcontainer = useWebContainer();
  const [activeTab, setActiveTab] = useState("code");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewDisabled, setIsPreviewDisabled] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [templateSteps, setTemplateSteps] = useState<Step[]>([]);
  const [generationSteps, setGenerationSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({
    "/app": true,
    "/app/workspace": true,
    "/app/workspace/[id]": true,
    "/components": true,
  });
  const [templateSet, setTemplateSet] = useState(false);
  const [initialSetupComplete, setInitialSetupComplete] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<
    "template" | "generation" | "complete" | null
  >(null);
  const [llmMessages, setLlmMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const initialApiCallTriggered = useRef(false);

  useEffect(() => {
    const { hasApiKey } = useApiKeyStore.getState();
    if (!hasApiKey()) {
      router.push("/");
      return;
    }
  }, [router]);

  useEffect(() => {
    const processStepsToFiles = () => {
      const allSteps = [...templateSteps, ...generationSteps];

      if (allSteps.length === 0) return;

      const newFiles: FileItem[] = [];

      allSteps
        .filter(({ type }) => type === StepType.CreateFile)
        .forEach((step) => {
          let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
          let currentFileStructure = newFiles;

          let currentFolder = "";
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`;
            const currentFolderName = parsedPath[0];
            parsedPath = parsedPath.slice(1);

            if (!parsedPath.length) {
              // final file
              const existingFile = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!existingFile) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "file",
                  path: currentFolder,
                  content: step.code || "",
                });
              } else {
                existingFile.content = step.code || "";
              }
            } else {
              /// in a folder
              let folder = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!folder) {
                // create the folder
                folder = {
                  name: currentFolderName,
                  type: "folder",
                  path: currentFolder,
                  children: [],
                };
                currentFileStructure.push(folder);
              }

              currentFileStructure = folder.children!;
            }
          }
        });

      if (newFiles.length > 0) {
        setFiles(newFiles);
        console.log("Files updated:", newFiles);
      }
    };

    processStepsToFiles();
  }, [templateSteps, generationSteps]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const createMountStructure = (files: FileItem[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mountStructure: Record<string, any> = {};

      const processFile = (file: FileItem, isRootFolder: boolean) => {
        if (file.type === "folder") {
          mountStructure[file.name] = {
            directory: file.children
              ? Object.fromEntries(
                  file.children.map((child) => [
                    child.name,
                    processFile(child, false),
                  ])
                )
              : {},
          };
        } else if (file.type === "file") {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || "",
              },
            };
          } else {
            return {
              file: {
                contents: file.content || "",
              },
            };
          }
        }

        return mountStructure[file.name];
      };

      files.forEach((file) => processFile(file, true));

      return mountStructure;
    };

    const mountStructure = createMountStructure(files);

    console.log(mountStructure);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      const findFirstFile = (items: FileItem[]): string | null => {
        for (const item of items) {
          if (item.type === "file") {
            return item.path;
          }
          if (item.children) {
            const found = findFirstFile(item.children);
            if (found) return found;
          }
        }
        return null;
      };

      const firstFile = findFirstFile(files);
      if (firstFile) {
        setSelectedFile(firstFile);
      }
    }
  }, [files, selectedFile]);

  const handleBackendCall = useCallback(
    async (message: string) => {
      try {
        setIsLoading(true);
        setIsPreviewDisabled(true);
        setActiveTab("code");
        const { apiKey, selectedModel } = useApiKeyStore.getState();

        if (!apiKey) {
          throw new Error("API key is required");
        }

        if (!templateSet) {
          setCurrentPhase("template");

          const response = await axios.post(`${BACKEND_URL}/template`, {
            prompt: message.trim(),
            apiKey,
            model: selectedModel,
          });
          setTemplateSet(true);

          const { prompts, uiPrompts } = response.data;
          console.log(prompts, uiPrompts);

          const templateStepsData = parseXml(uiPrompts[0]).map((x: Step) => ({
            ...x,
            status: "in-progress" as const,
            phase: "template" as const,
          }));

          console.log("Template steps data:", templateStepsData);
          setTemplateSteps(templateStepsData);

          setTemplateSteps((prev) =>
            prev.map((step) => ({
              ...step,
              status: "completed" as const,
            }))
          );
          setCurrentPhase("generation");

          try {
            const generatingMessage: Message = {
              id: `generating-setup-${Date.now()}`,
              role: "assistant",
              content: "Generating edits...",
            };
            console.log("set");
            setMessages((prev) => [...prev, generatingMessage]);

            const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
              messages: [...prompts, message].map((content) => ({
                role: "user",
                content,
              })),
              apiKey,
              model: selectedModel,
            });

            const generationStepsData = parseXml(
              stepsResponse.data.response
            ).map((x) => ({
              ...x,
              status: "in-progress" as const,
              phase: "generation" as const,
            }));

            console.log("Generation steps data:", generationStepsData);
            setGenerationSteps(generationStepsData);

            setLlmMessages(
              [...prompts, message].map((content) => ({
                role: "user" as const,
                content,
              }))
            );

            setLlmMessages((x) => [
              ...x,
              {
                role: "assistant" as const,
                content: stepsResponse.data.response,
              },
            ]);

            setGenerationSteps((prev) =>
              prev.map((step) => ({
                ...step,
                status: "completed" as const,
              }))
            );
            setCurrentPhase("complete");
            setInitialSetupComplete(true);
            setIsPreviewDisabled(false);
            setActiveTab("preview");

            console.log("Initial setup completed, clearing steps display");

            const extractArtifactTitle = (content: string): string => {
              const match = content.match(
                /<boltArtifact[^>]*title="([^"]*)"[^>]*>/
              );
              return match
                ? match[1]
                : "Project setup completed! Your files have been generated and are ready for editing.";
            };

            const aiResponseContent = extractArtifactTitle(
              stepsResponse.data.response
            );

            setMessages((prev) =>
              prev.map((msg) =>
                msg.content === "Generating edits..."
                  ? { ...msg, content: aiResponseContent }
                  : msg
              )
            );
          } catch (error) {
            console.error("Error in generation phase:", error);
            setCurrentPhase("complete");
            setInitialSetupComplete(true);
            setIsPreviewDisabled(false);
          }
        } else {
          const newMessage = {
            role: "user" as const,
            content: message,
          };

          const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content: message,
          };
          setMessages((prev) => [...prev, userMessage]);

          const generatingMessage: Message = {
            id: `generating-${Date.now()}`,
            role: "assistant",
            content: "Generating edits...",
          };
          setMessages((prev) => [...prev, generatingMessage]);

          const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
            messages: [...llmMessages, newMessage],
            apiKey,
            model: selectedModel,
          });

          const assistantResponse = stepsResponse.data.response;

          const newGenerationStepsData = parseXml(assistantResponse).map(
            (x: Step) => ({
              ...x,
              id: x.id + Date.now(),
              status: "in-progress" as const,
              phase: "generation" as const,
            })
          );

          console.log(
            "Parsed new generation steps from AI edit:",
            newGenerationStepsData
          );
          if (newGenerationStepsData.length > 0) {
            setGenerationSteps((prev) => [...prev, ...newGenerationStepsData]);
            setTimeout(() => {
              setGenerationSteps((prev) =>
                prev.map((step) => ({
                  ...step,
                  status: "completed" as const,
                }))
              );
              setIsPreviewDisabled(false);
              setActiveTab("preview");
            }, 100);
          } else {
            setIsPreviewDisabled(false);
            setActiveTab("preview");
          }

          setLlmMessages((x) => [...x, newMessage]);
          setLlmMessages((x) => [
            ...x,
            {
              role: "assistant" as const,
              content: assistantResponse,
            },
          ]);

          const extractArtifactTitle = (content: string): string => {
            const match = content.match(
              /<boltArtifact[^>]*title="([^"]*)"[^>]*>/
            );
            return match ? match[1] : content;
          };

          const displayContent = extractArtifactTitle(assistantResponse);

          setMessages((prev) =>
            prev.map((msg) =>
              msg.content === "Generating edits..."
                ? { ...msg, content: displayContent }
                : msg
            )
          );
        }
      } catch (error) {
        console.error("Error calling backend:", error);

        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "Sorry, there was an error processing your request. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsPreviewDisabled(false);
      } finally {
        setIsLoading(false);
      }
    },
    [templateSet, llmMessages]
  );

  useEffect(() => {
    console.log(
      "Initial setup useEffect. initialMessage:",
      !!initialMessage,
      "templateSet:",
      templateSet,
      "initialApiCallTriggered.current:",
      initialApiCallTriggered.current
    );
    if (initialMessage && !templateSet && !initialApiCallTriggered.current) {
      console.log(
        "Initial setup useEffect: Condition MET. Triggering initial call."
      );
      initialApiCallTriggered.current = true;

      const userMessage: Message = {
        id: `user-initial-${Date.now()}`,
        role: "user",
        content: initialMessage,
      };
      setMessages([userMessage]);
      handleBackendCall(initialMessage);
    } else {
      console.log(
        "Initial setup useEffect: Condition NOT MET or already triggered."
      );
      if (!initialMessage) console.log("Reason: No initialMessage");
      if (templateSet) console.log("Reason: templateSet is true");
      if (
        initialApiCallTriggered.current &&
        !(initialMessage && !templateSet)
      ) {
        console.log(
          "Reason: Initial call already triggered and conditions no longer meet for a new trigger."
        );
      }
    }
  }, [initialMessage, templateSet, handleBackendCall]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const message = input.trim();
    setInput("");
    handleBackendCall(message);
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const getFileContent = (filePath: string): string => {
    const findFile = (
      items: FileItem[],
      targetPath: string
    ): FileItem | null => {
      for (const item of items) {
        if (item.path === targetPath) {
          return item;
        }
        if (item.children) {
          const found = findFile(item.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };

    const file = findFile(files, filePath);
    return file?.content || `// File content for ${filePath}`;
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      <header className="border-b border-gray-800 bg-[#0f0f10]">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-[#0a0a0a] h-9 w-9"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to home</span>
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-700" />
            <h1 className="text-lg font-semibold text-white tracking-tight">
              {id}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-gray-400 hover:text-white hover:bg-[#0a0a0a]"
              onClick={() => setShowComingSoonModal(true)}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-gray-400 hover:text-white hover:bg-[#0a0a0a]"
              onClick={() => setShowComingSoonModal(true)}
            >
              <Github className="h-4 w-4" />
              GitHub
            </Button>
            <div className="h-6 w-px bg-gray-700" />
            <Button
              size="sm"
              className="gap-2 bg-white text-black hover:bg-gray-200 font-medium"
              onClick={() => setShowComingSoonModal(true)}
            >
              <ExternalLink className="h-4 w-4" />
              Deploy
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="flex flex-col h-full border-r border-gray-800 bg-[#0f0f10]">
              <ScrollArea className="flex-1 py-4 pl-4 max-h-full overflow-auto">
                <div className="space-y-4 sm:w-[60%] ">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      templateSteps={[]}
                      generationSteps={[]}
                      currentPhase={currentPhase}
                    />
                  ))}

                  {isLoading && !initialSetupComplete && (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-3 text-gray-400">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span className="text-sm">
                          Setting up your project...
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-gray-800 flex-shrink-0 bg-[#0f0f10]">
                <div className="relative">
                  <Textarea
                    placeholder="Type your message..."
                    className="min-h-24 bg-[#0a0a0a] border-gray-700 rounded-xl resize-none text-white placeholder:text-gray-500 pr-12 focus:border-gray-600"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    className="absolute bottom-3 right-3 h-8 w-8 bg-white text-black hover:bg-gray-200 rounded-lg"
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={100}>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col bg-[#0a0a0a]"
            >
              <div className="border-b border-gray-800 px-4 bg-[#0f0f10]">
                <TabsList className="h-14 bg-transparent">
                  <TabsTrigger
                    value="preview"
                    disabled={isPreviewDisabled}
                    className="data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-white text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-400"
                  >
                    Preview
                  </TabsTrigger>
                  <TabsTrigger
                    value="code"
                    className="data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-white text-gray-400 hover:text-white"
                  >
                    Code
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="preview" className="flex-1 p-0 m-0">
                {isPreviewDisabled ? (
                  <div className="flex items-center justify-center h-full bg-[#0a0a0a]">
                    <div className="flex items-center gap-3 text-gray-400">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span className="text-sm">
                        Generating project updates...
                      </span>
                    </div>
                  </div>
                ) : webcontainer ? (
                  <PreviewContainer webContainer={webcontainer} files={files} />
                ) : (
                  <div className="flex items-center justify-center h-full bg-[#0a0a0a]">
                    <p className="text-gray-400">Loading web container...</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="code" className="flex-1 p-0 m-0 border-0">
                <div className="flex h-full">
                  <div className="w-64 border-r border-gray-800 bg-[#0f0f10] overflow-auto">
                    <div className="p-4 border-b border-gray-800">
                      <h3 className="font-medium text-white">Files</h3>
                    </div>
                    <FileTree
                      files={files}
                      selectedFile={selectedFile}
                      onSelectFile={(file: FileItem) =>
                        setSelectedFile(file.path)
                      }
                      expandedFolders={expandedFolders}
                      onToggleFolder={toggleFolder}
                    />
                  </div>
                  <div className="flex-1 flex flex-col bg-[#0a0a0a]">
                    {selectedFile && (
                      <div className="p-4 border-b border-gray-800 bg-[#0f0f10] flex items-center">
                        <span className="text-gray-400 text-sm">
                          {selectedFile}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <CodeEditor
                        file={
                          selectedFile
                            ? {
                                name: selectedFile.split("/").pop() || "",
                                type: "file",
                                path: selectedFile,
                                content: getFileContent(selectedFile),
                              }
                            : null
                        }
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <Dialog open={showComingSoonModal} onOpenChange={setShowComingSoonModal}>
        <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-gray-800 [&>button]:text-gray-400 [&>button]:hover:text-white [&>button]:hover:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white text-center">
              🚀 Coming Soon!
            </DialogTitle>
            <DialogDescription className="text-center py-4 text-gray-300">
              This feature is currently under development and will be available
              soon.
              <br />
              <span className="text-sm text-gray-400 mt-2 block">
                Stay tuned for updates!
              </span>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
