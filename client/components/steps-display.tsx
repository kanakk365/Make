"use client"

import { useState, useEffect } from 'react';
import { Check, Clock, ChevronDown, FileText, FolderOpen, Terminal, Edit, Trash2 } from 'lucide-react';
import { Step, StepType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StepsDisplayProps {
  steps: Step[];
  templateSteps?: Step[];
  generationSteps?: Step[];
  initialSetupComplete?: boolean;
  currentPhase?: "template" | "generation" | "complete" | null;
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

export function StepsDisplay({ 
  steps, 
  templateSteps = [], 
  generationSteps = [], 
  initialSetupComplete = false,
  currentPhase = null 
}: StepsDisplayProps) {
  const [collapsed, setCollapsed] = useState(false);
  
  // Auto-collapse when initial setup is complete
  useEffect(() => {
    if (initialSetupComplete) {
      setCollapsed(true);
    }
  }, [initialSetupComplete]);
  
  // Only show if we have template or generation steps to display
  if ((templateSteps.length === 0 && generationSteps.length === 0) || 
      (!steps || steps.length === 0)) {
    return null;
  }

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const templateCompletedCount = templateSteps.filter(s => s.status === 'completed').length;
  const generationCompletedCount = generationSteps.filter(s => s.status === 'completed').length;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
      <div
        className="flex items-center px-6 py-4 border-b border-zinc-800 cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <ChevronDown 
          className={cn(
            "h-5 w-5 mr-2 text-white transition-transform", 
            collapsed ? "-rotate-90" : ""
          )} 
        />
        <h2 className="text-white font-medium text-lg">Project Setup Progress</h2>
        <div className="ml-auto text-sm text-zinc-400">
          {completedCount}/{steps.length} completed
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-6">          {/* Template Setup Phase */}
          {templateSteps.length > 0 && (
            <div>
              <div className="flex items-center mb-3">
                {currentPhase === "template" ? (
                  <div className="h-2 w-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                ) : (
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                )}
                <h3 className="text-white font-medium text-sm">Phase 1: Template Setup</h3>
                {currentPhase === "template" && (
                  <div className="ml-2">
                    <div className="h-3 w-3 rounded-full border border-blue-500 border-t-transparent animate-spin"></div>
                  </div>
                )}
                <div className="ml-auto text-xs text-zinc-400">
                  {templateCompletedCount}/{templateSteps.length}
                </div>
              </div>
              <div className="space-y-2 ml-4">
                {templateSteps.map((step) => {
                  const IconComponent = getStepIcon(step.type);
                  return (
                    <div key={step.id} className="flex items-start">
                      <div className="mt-1 mr-3">
                        {step.status === 'in-progress' ? (
                          <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                        ) : step.status === 'completed' ? (
                          <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded-full bg-zinc-700/50 flex items-center justify-center">
                            <Clock className="h-2.5 w-2.5 text-zinc-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <IconComponent className="h-3.5 w-3.5 mr-2 text-zinc-400" />
                          <span className={cn(
                            "text-xs",
                            step.status === 'in-progress' ? "text-blue-400" : 
                            step.status === 'completed' ? "text-zinc-300" : "text-zinc-400"
                          )}>
                            {step.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}          {/* AI Generation Phase */}
          {generationSteps.length > 0 && (
            <div>
              <div className="flex items-center mb-3">
                {currentPhase === "generation" ? (
                  <div className="h-2 w-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
                ) : currentPhase === "complete" ? (
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                ) : (
                  <div className="h-2 w-2 bg-zinc-600 rounded-full mr-2"></div>
                )}
                <h3 className="text-white font-medium text-sm">Phase 2: AI Code Generation</h3>
                {currentPhase === "generation" && (
                  <div className="ml-2">
                    <div className="h-3 w-3 rounded-full border border-purple-500 border-t-transparent animate-spin"></div>
                  </div>
                )}
                <div className="ml-auto text-xs text-zinc-400">
                  {generationCompletedCount}/{generationSteps.length}
                </div>
              </div>
              <div className="space-y-2 ml-4">
                {generationSteps.map((step) => {
                  const IconComponent = getStepIcon(step.type);
                  return (
                    <div key={step.id} className="flex items-start">
                      <div className="mt-1 mr-3">
                        {step.status === 'in-progress' ? (
                          <div className="h-4 w-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                        ) : step.status === 'completed' ? (
                          <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </div>
                        ) : (
                          <div className="h-4 w-4 rounded-full bg-zinc-700/50 flex items-center justify-center">
                            <Clock className="h-2.5 w-2.5 text-zinc-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <IconComponent className="h-3.5 w-3.5 mr-2 text-zinc-400" />
                          <span className={cn(
                            "text-xs",
                            step.status === 'in-progress' ? "text-purple-400" : 
                            step.status === 'completed' ? "text-zinc-300" : "text-zinc-400"
                          )}>
                            {step.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fallback: Show all steps if phases are not separated */}
          {templateSteps.length === 0 && generationSteps.length === 0 && (
            <div className="space-y-3">
              {steps.map((step) => {
                const IconComponent = getStepIcon(step.type);
                return (
                  <div key={step.id} className="flex items-start">
                    <div className="mt-1 mr-3">
                      {step.status === 'in-progress' ? (
                        <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                      ) : step.status === 'completed' ? (
                        <div className="h-5 w-5 rounded-full flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 text-gray-300" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-zinc-700/50 flex items-center justify-center">
                          <Clock className="h-3.5 w-3.5 text-zinc-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <IconComponent className="h-4 w-4 mr-2 text-zinc-400" />
                        <span className={cn(
                          "text-sm",
                          step.status === 'in-progress' ? "text-blue-500" : "text-white"
                        )}>
                          {step.title}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
