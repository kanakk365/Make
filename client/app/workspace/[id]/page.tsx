"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
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
import PreviewPage from "@/app/preview/[id]/page";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function WorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const initialMessage = searchParams.get("message");
  const webcontainer = useWebContainer();
  const [activeTab, setActiveTab] = useState("code");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
  const chatEndRef = useRef<HTMLDivElement>(null);
  const initialApiCallTriggered = useRef(false);

  useEffect(() => {
    const processStepsToFiles = () => {
      // Process all steps (both template and generation phases)
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
          // For folders, create a directory entry
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
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || "",
              },
            };
          }
        }

        return mountStructure[file.name];
      };

      // Process each top-level file/folder
      files.forEach((file) => processFile(file, true));

      return mountStructure;
    };

    const mountStructure = createMountStructure(files);

    // Mount the structure if WebContainer is available
    console.log(mountStructure);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  // Auto-select first file when files are available
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

        if (!templateSet) {
          // Initial setup phase
          setCurrentPhase("template");

          // Phase 1: Template Setup
          const response = await axios.post(`${BACKEND_URL}/template`, {
            prompt: message.trim(),
          });
          setTemplateSet(true);

          const { prompts, uiPrompts } = response.data;
          console.log(prompts, uiPrompts);

          // Set template steps with loading status
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

          // Phase 2: AI Generation
          try {
            // Add generating message for the initial setup
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

            // Complete generation phase
            setGenerationSteps((prev) =>
              prev.map((step) => ({
                ...step,
                status: "completed" as const,
              }))
            );
            setCurrentPhase("complete");
            setInitialSetupComplete(true);

            console.log("Initial setup completed, clearing steps display");

            // Extract title from first boltArtifact for the AI response
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

            // Replace the generating message with the actual AI response
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
          }
        } else {
          // Subsequent chat messages - only user/AI conversation
          const newMessage = {
            role: "user" as const,
            content: message,
          };

          // Add user message to chat immediately
          const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content: message,
          };
          setMessages((prev) => [...prev, userMessage]);

          // Add temporary "generating" message
          const generatingMessage: Message = {
            id: `generating-${Date.now()}`,
            role: "assistant",
            content: "Generating edits...",
          };
          setMessages((prev) => [...prev, generatingMessage]);

          const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
            messages: [...llmMessages, newMessage],
          });

          const assistantResponse = stepsResponse.data.response;

          setLlmMessages((x) => [...x, newMessage]);
          setLlmMessages((x) => [
            ...x,
            {
              role: "assistant" as const,
              content: assistantResponse,
            },
          ]);

          // Extract title from first boltArtifact for the AI response
          const extractArtifactTitle = (content: string): string => {
            const match = content.match(
              /<boltArtifact[^>]*title="([^"]*)"[^>]*>/
            );
            return match ? match[1] : content;
          };

          const displayContent = extractArtifactTitle(assistantResponse);

          // Replace the generating message with the actual AI response
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

    // Only proceed if there's an initial message, the template isn't set,
    // and this specific trigger logic hasn't run yet.
    if (initialMessage && !templateSet && !initialApiCallTriggered.current) {
      console.log(
        "Initial setup useEffect: Condition MET. Triggering initial call."
      );
      initialApiCallTriggered.current = true; // Mark that we are triggering the call

      const userMessage: Message = {
        id: `user-initial-${Date.now()}`,
        role: "user",
        content: initialMessage,
      };
      setMessages([userMessage]); // Add user message
      handleBackendCall(initialMessage); // Call backend
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
        // This log is for when the effect runs again after the initial trigger,
        // and the main conditions (initialMessage && !templateSet) are no longer met.
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

  // Get file content from the files state
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
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-gray-400 hover:text-white hover:bg-[#0a0a0a]"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-gray-400 hover:text-white hover:bg-[#0a0a0a]"
            >
              <Github className="h-4 w-4" />
              GitHub
            </Button>
            <div className="h-6 w-px bg-gray-700" />
            <Button 
              size="sm"
              className="gap-2 bg-white text-black hover:bg-gray-200 font-medium"
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
              <ScrollArea className="flex-1 p-4 max-h-full overflow-auto">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      templateSteps={[]}
                      generationSteps={[]}
                      currentPhase={currentPhase}
                    />
                  ))}

                  {/* Show loading indicator when AI is processing */}
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
                    className="data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-white text-gray-400 hover:text-white"
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
                {webcontainer ? (
                  <PreviewPage webContainer={webcontainer} files={files} />
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
    </div>
  );
}
