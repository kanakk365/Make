"use client"
import { useEffect, useState, useCallback } from "react";
import { WebContainer } from "@webcontainer/api";
import { FileItem } from "@/lib/types";

interface PreviewContainerProps {
  webContainer: WebContainer;
  files: FileItem[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PreviewContainer({ webContainer, files }: PreviewContainerProps) {
  const [url, setUrl] = useState("");
  const [isInstalling, setIsInstalling] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const loadingStates = [
    { text: "Initializing project setup..." },
    { text: "Installing dependencies..." },
    { text: "Configuring development environment..." },
    { text: "Setting up hot reload..." },
    { text: "Starting development server..." },
    { text: "Almost ready..." },
  ];
  // Animation effect for cycling through steps
  useEffect(() => {
    if (!isInstalling) {
      setCurrentStep(0);
      return;
    }

    // Don't advance if we're already at the last step
    if (currentStep >= loadingStates.length - 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, loadingStates.length - 1));
    }, 1500);

    return () => clearInterval(interval);
  }, [isInstalling, loadingStates.length, currentStep]);
  const start = useCallback(async () => {
     console.log(webContainer);
    if (!webContainer) {
      console.error("WebContainer not initialized");
      return;
    }
    
    setIsInstalling(true);
    
    const installProcess = await webContainer?.spawn("npm", ["install"]);

    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log(data);
        },
      })
    ).catch(err=> console.error("Error piping install output" ,err))

     const installExitCode = await installProcess.exit;
    console.log(`npm install exited with code ${installExitCode}`);


    console.log("Starting dev server...");
    const devProcess = await webContainer.spawn('npm', ['run', 'dev']);

    devProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log('Dev server output:', data);
        },
      })
    ).catch(err => console.error("Error piping dev server output:", err));
     // Wait for `server-ready` event
    webContainer.on("server-ready", (port, url) => {
      console.log(`Server ready on port ${port} at ${url}`);
      setUrl(url);
      setIsInstalling(false);
    });

    webContainer.on("error", (error) => {
      console.error("WebContainer error:", error.message);
      setIsInstalling(false);
    });

    // It might also be useful to log the exit of the dev process
    devProcess.exit.then(code => {
      console.log(`Dev server process exited with code ${code}`);
      setIsInstalling(false);
    });
  }, [webContainer]);
  
  useEffect(() => {
    start();
  }, [start]);
  return (
    <div className="h-full flex items-center justify-center text-gray-400 relative">
      {isInstalling && (
        <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm bg-[#0a0a0a]/90">
          <div className="flex relative justify-start max-w-xl mx-auto flex-col">
            {loadingStates.map((loadingState, index) => {
              const isActive = index === currentStep;
              const isPast = index < currentStep;
              
              return (
                <div
                  key={index}
                  className="text-left flex gap-2 mb-4 transition-all duration-500"
                >
                  <div>                    {isPast ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6 text-[#266968]"
                      >
                        <path
                          fillRule="evenodd"
                          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className={`w-6 h-6 ${isActive ? 'text-[#266968]' : 'text-gray-400'}`}
                      >
                        <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`${
                      isActive ? 'text-[#266968]' : isPast ? 'text-white' : 'text-gray-400'
                    } transition-colors duration-500`}
                  >
                    {loadingState.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {!url && !isInstalling && (
        <div className="text-center">
          <p className="mb-2">Loading...</p>
        </div>
      )}
      {url && !isInstalling && (
        <div className="h-full w-full overflow-auto">
          <iframe 
            width="100%" 
            height="100%" 
            src={url}
            className="min-h-full"
            style={{ border: 'none' }}
          />
        </div>
      )}
    </div>
  );
}
