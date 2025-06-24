import { WebContainer } from "@webcontainer/api";
import { useEffect, useState, useRef } from "react";

// Global singleton instance
let globalWebContainer: WebContainer | null = null;
let isBooting = false;
let bootPromise: Promise<WebContainer> | null = null;

export function useWebContainer() {
  const [webContainerInstance, setWebContainerInstance] = useState<WebContainer | undefined>(
    globalWebContainer || undefined
  );
  const mountedRef = useRef(true);

  useEffect(() => {
    async function initWebContainer() {
      // If we already have an instance, use it
      if (globalWebContainer) {
        if (mountedRef.current) {
          setWebContainerInstance(globalWebContainer);
        }
        return;
      }

      // If already booting, wait for the existing promise
      if (isBooting && bootPromise) {
        try {
          const instance = await bootPromise;
          if (mountedRef.current) {
            setWebContainerInstance(instance);
          }
        } catch (error) {
          console.error("Failed to wait for WebContainer boot:", error);
        }
        return;
      }

      try {
        isBooting = true;
        bootPromise = WebContainer.boot();
        const webcontainerInstance = await bootPromise;
        globalWebContainer = webcontainerInstance;
        
        if (mountedRef.current) {
          setWebContainerInstance(webcontainerInstance);
        }
      } catch (error) {
        console.error("Failed to boot WebContainer:", error);
      } finally {
        isBooting = false;
        bootPromise = null;
      }
    }

    initWebContainer();

    // Cleanup function
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Update ref on mount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return webContainerInstance;
}
