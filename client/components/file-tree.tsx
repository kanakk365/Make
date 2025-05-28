"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, File, Folder } from "lucide-react"
import { cn } from "@/lib/utils"
import { FileItem } from "@/lib/types"

interface FileTreeProps {
  files: FileItem[]
  selectedFile: string | null
  onSelectFile: (file: FileItem) => void
  expandedFolders?: Record<string, boolean>
  onToggleFolder?: (path: string) => void
}

interface FileTreeItemProps {
  item: FileItem
  selectedFile: string | null
  onSelectFile: (file: FileItem) => void
  expandedFolders: Record<string, boolean>
  onToggleFolder: (path: string) => void
  level?: number
}

function FileTreeItem({
  item,
  selectedFile,
  onSelectFile,
  expandedFolders,
  onToggleFolder,
  level = 0,
}: FileTreeItemProps) {
  const isExpanded = expandedFolders[item.path] || false
  const isSelected = selectedFile === item.path

  const getFileIcon = (fileName: string, isFolder: boolean) => {
    if (isFolder) {
      return <Folder className="h-4 w-4 text-gray-500" />
    }
    
    if (fileName.endsWith(".tsx") || fileName.endsWith(".ts")) {
      return <File className="h-4 w-4 text-cyan-400" />
    }
    if (fileName.endsWith(".css")) {
      return <File className="h-4 w-4 text-violet-400" />
    }
    if (fileName.endsWith(".js") || fileName.endsWith(".jsx")) {
      return <File className="h-4 w-4 text-yellow-400" />
    }
    if (fileName.endsWith(".html")) {
      return <File className="h-4 w-4 text-orange-400" />
    }
    if (fileName.endsWith(".json")) {
      return <File className="h-4 w-4 text-yellow-600" />
    }
    if (fileName.endsWith(".md")) {
      return <File className="h-4 w-4 text-blue-400" />
    }
    return <File className="h-4 w-4 text-gray-400" />
  }

  if (item.type === "folder") {
    return (
      <li>
        <button
          className={cn(
            "w-full flex items-center gap-1 py-1 text-sm rounded-md text-left text-gray-300 hover:text-white hover:bg-[#1a1a1c] transition-colors",
            "px-2"
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => onToggleFolder(item.path)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
          )}
          {getFileIcon(item.name, true)}
          <span className="truncate">{item.name}</span>
        </button>
        
        {isExpanded && item.children && (
          <ul className="mt-1">
            {item.children.map((child) => (
              <FileTreeItem
                key={child.path}
                item={child}
                selectedFile={selectedFile}
                onSelectFile={onSelectFile}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
                level={level + 1}
              />
            ))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <li>
      <button
        className={cn(
          "w-full flex items-center gap-1 py-1 text-sm rounded-md text-left transition-colors",
          "px-2",
          isSelected
            ? "bg-[#1a1a1c] text-white"
            : "text-gray-400 hover:text-white hover:bg-[#1a1a1c]"
        )}
        style={{ paddingLeft: `${level * 12 + 24}px` }}
        onClick={() => onSelectFile(item)}
      >
        {getFileIcon(item.name, false)}
        <span className="truncate">{item.name}</span>
      </button>
    </li>
  )
}

export function FileTree({ 
  files, 
  selectedFile, 
  onSelectFile, 
  expandedFolders: externalExpandedFolders,
  onToggleFolder: externalOnToggleFolder
}: FileTreeProps) {
  const [internalExpandedFolders, setInternalExpandedFolders] = useState<Record<string, boolean>>({})
  
  const expandedFolders = externalExpandedFolders || internalExpandedFolders
  const onToggleFolder = externalOnToggleFolder || ((path: string) => {
    setInternalExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }))
  })

  return (
    <div className="p-2">
      <ul className="space-y-0.5">
        {files.map((file) => (
          <FileTreeItem
            key={file.path}
            item={file}
            selectedFile={selectedFile}
            onSelectFile={onSelectFile}
            expandedFolders={expandedFolders}
            onToggleFolder={onToggleFolder}
          />
        ))}
      </ul>
    </div>
  )
}
