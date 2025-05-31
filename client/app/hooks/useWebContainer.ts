import { WebContainer } from "@webcontainer/api";
import { useEffect, useState } from "react";

export function useWebContainer() {
  const [webContainerInstance, setWebContainerInstance] = useState<WebContainer | undefined>();
  async function main() {
    const webcontainerInstance = await WebContainer.boot();
    setWebContainerInstance(webcontainerInstance);
  }

  useEffect(() => {
    main();
  }, []);

  return webContainerInstance;
}
