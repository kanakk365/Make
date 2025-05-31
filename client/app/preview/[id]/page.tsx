import { WebContainer } from "@webcontainer/api";
import { useEffect, useState } from "react";

interface PreveiwFrameProps {
  files: any[];
  webContainer: WebContainer;
}

export default function PreviewPage({
  webContainer,
  files,
}: PreveiwFrameProps) {
  const [url, setUrl] = useState("");

  async function start() {
     console.log(webContainer);
    if (!webContainer) {
      console.error("WebContainer not initialized");
      return;
    }
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
    });

    webContainer.on("error", (error) => {
      console.error("WebContainer error:", error.message);
    });

    // It might also be useful to log the exit of the dev process
    devProcess.exit.then(code => {
      console.log(`Dev server process exited with code ${code}`);
    });
  }
  useEffect(() => {
    start();
  }, []);
  

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      {!url && (
        <div className="text-center">
          <p className="mb-2">Loading...</p>
        </div>
      )}
      {url && <iframe width={"100%"} height={"100%"} src={url} />}
    </div>
  );
}
