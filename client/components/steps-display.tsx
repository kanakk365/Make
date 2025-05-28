import React from 'react';
import { Check, Clock, Play, FileText, FolderOpen, Terminal, Edit, Trash2 } from 'lucide-react';
import { Step, StepType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StepsDisplayProps {
  steps: Step[];
}

const getStepIcon = (type: StepType) => {
  switch (type) {
    case StepType.CreateFile:
      return FileText;
    case StepType.CreateFolder:
      return FolderOpen;
    case StepType.EditFile:
      return Edit;
    case StepType.DeleteFile:
      return Trash2;
    case StepType.RunScript:
      return Terminal;
    default:
      return FileText;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return Check;
    case 'in-progress':
      return Play;
    case 'pending':
    default:
      return Clock;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-500';
    case 'in-progress':
      return 'text-blue-500';
    case 'pending':
    default:
      return 'text-gray-400';
  }
};

export function StepsDisplay({ steps }: StepsDisplayProps) {
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#0f0f10] border border-[#1a1a1c] rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-white mb-3">
        <Terminal className="w-4 h-4" />
        Project Setup Steps
      </div>
      
      <div className="space-y-2">
        {steps.map((step, index) => {
          const StepIcon = getStepIcon(step.type);
          const StatusIcon = getStatusIcon(step.status);
          const statusColor = getStatusColor(step.status);
          
          return (
            <div
              key={step.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-md transition-colors",
                step.status === 'completed' ? 'bg-green-500/10' : 
                step.status === 'in-progress' ? 'bg-blue-500/10' : 'bg-gray-500/10'
              )}
            >
              {/* Step number */}
              <div className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                step.status === 'completed' ? 'bg-green-500 text-white' :
                step.status === 'in-progress' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
              )}>
                {index + 1}
              </div>
              
              {/* Step icon */}
              <div className={cn("flex-shrink-0 mt-0.5", statusColor)}>
                <StepIcon className="w-4 h-4" />
              </div>
              
              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-white truncate">
                    {step.title}
                  </h4>
                  <StatusIcon className={cn("w-4 h-4", statusColor)} />
                </div>
                
                {step.description && (
                  <p className="text-xs text-gray-400 mb-2">
                    {step.description}
                  </p>
                )}
                
                {step.path && (
                  <p className="text-xs text-gray-500 font-mono">
                    {step.path}
                  </p>
                )}
                
                {step.code && step.code.length > 0 && (
                  <div className="mt-2 p-2 bg-black/30 rounded border border-gray-700">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto">
                      {step.code.length > 100 ? `${step.code.substring(0, 100)}...` : step.code}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Progress indicator */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Progress</span>
          <span>
            {steps.filter(s => s.status === 'completed').length} / {steps.length} completed
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}
