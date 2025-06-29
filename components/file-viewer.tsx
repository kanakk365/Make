"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CodeEditor } from "@/components/code-editor"
import { FileViewerProps } from "@/lib/types"

export function FileViewer({ file, onClose }: FileViewerProps) {
  if (!file) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f0f10] border border-[#1a1a1c] rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1a1a1c]">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium text-white">{file.name}</h2>
            <span className="text-sm text-gray-400">{file.path}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {file.type === "folder" ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>This is a folder. Select a file to view its contents.</p>
            </div>
          ) : (
            <CodeEditor
              file={file}
            />
          )}
        </div>
      </div>
    </div>
  )
}
