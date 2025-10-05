"use client";

import { useState } from "react";
import { useFormContext } from "@/app/context/FormContext";
import { generateInstallConfigYAML, generateAgentConfigYAML } from "@/app/utils/generateYaml";

export default function PreviewStep() {
  const { formData } = useFormContext();
  const installConfigYAMLOutput = generateInstallConfigYAML(formData);
  const agentConfigYAMLOutput = generateAgentConfigYAML(formData);

  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedAgent, setCopiedAgent] = useState(false);
  const [installConfigOpen, setInstallConfigOpen] = useState(false);
  const [agentConfigOpen, setAgentConfigOpen] = useState(false);

  const copyToClipboard = async (text: string, setStatus: (status: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(true);
      setTimeout(() => setStatus(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Preview Configuration</h2>

      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => setInstallConfigOpen(!installConfigOpen)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold">Generated install-config.yaml</h3>
            <svg
              className={`w-5 h-5 transition-transform ${installConfigOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {installConfigOpen && (
            <div className="p-4 border-t border-gray-200">
              <div className="relative">
                <button
                  onClick={() => copyToClipboard(installConfigYAMLOutput, setCopiedInstall)}
                  className="absolute top-2 right-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors z-10"
                >
                  {copiedInstall ? "Copied!" : "Copy"}
                </button>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto font-mono text-sm">
                  {installConfigYAMLOutput}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => setAgentConfigOpen(!agentConfigOpen)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold">Generated agent-config.yaml</h3>
            <svg
              className={`w-5 h-5 transition-transform ${agentConfigOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {agentConfigOpen && (
            <div className="p-4 border-t border-gray-200">
              <div className="relative">
                <button
                  onClick={() => copyToClipboard(agentConfigYAMLOutput, setCopiedAgent)}
                  className="absolute top-2 right-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors z-10"
                >
                  {copiedAgent ? "Copied!" : "Copy"}
                </button>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto font-mono text-sm">
                  {agentConfigYAMLOutput}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
