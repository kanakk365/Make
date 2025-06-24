import React from 'react';
import Editor from '@monaco-editor/react';
import { FileItem } from '../lib/types';

interface CodeEditorProps {
  file: FileItem | null;
}

export function CodeEditor({ file }: CodeEditorProps) {
  const defineCustomTheme = (monaco: typeof import('monaco-editor')) => {
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0f0f10',
      }
    });
  };

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Select a file to view its contents
      </div>
    );
  }

  const getLanguage = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'css':
        return 'css';
      case 'scss':
      case 'sass':
        return 'scss';
      case 'html':
      case 'htm':
        return 'html';
      case 'json':
        return 'json';
      case 'md':
      case 'markdown':
        return 'markdown';
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      case 'c':
        return 'c';
      case 'cpp':
      case 'cc':
      case 'cxx':
        return 'cpp';
      case 'php':
        return 'php';
      case 'rb':
        return 'ruby';
      case 'go':
        return 'go';
      case 'rs':
        return 'rust';
      case 'sql':
        return 'sql';
      case 'sh':
      case 'bash':
        return 'shell';
      case 'xml':
        return 'xml';
      case 'yaml':
      case 'yml':
        return 'yaml';
      default:
        return 'plaintext';
    }
  };

  return (
    <Editor
      height="100%"
      defaultLanguage={getLanguage(file.name)}
      theme="custom-dark"
      value={file.content || ''}
      beforeMount={defineCustomTheme}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        lineNumbers: 'on',
        renderWhitespace: 'selection',
        tabSize: 2,
        insertSpaces: true,
      }}
    />
  );
}