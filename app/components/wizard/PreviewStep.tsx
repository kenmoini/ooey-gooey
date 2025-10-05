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
  const [instructionsOpen, setInstructionsOpen] = useState(false);
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

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Preview Configuration</h2>

      <div className="space-y-6">

        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => setInstructionsOpen(!instructionsOpen)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold">Instructions</h3>
            <svg
              className={`w-5 h-5 transition-transform ${instructionsOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {instructionsOpen && (
            <div className="p-4 border-t border-gray-200">
              <ol className="list-decimal list-inside space-y-2">
                <li>Review the generated YAML files for accuracy.</li>
                <li>Copy/Download the following two generated YAML files below. Take note of the filenames and replace <span className="text-gray-500 font-mono text-sm">PULL_SECRET_CHANGE_ME</span> and other placeholders with your actual pull secret.</li>
                <li>Download the OpenShift binaries, ensure NMState is installed.<br />
                  <span className="text-gray-500 font-mono text-sm ml-5">curl -s https://raw.githubusercontent.com/kenmoini/disconnected-openshift/refs/heads/main/binaries/download-ocp-binaries.sh | bash</span>
                </li>
                <li>Create the Agent Based Installer ISO:<br />
                  <span className="text-gray-500 font-mono text-sm ml-5">./bin/openshift-install agent create iso --dir path/with/yaml/files</span>
                </li>
                <li>Use the generated <span className="text-gray-500 font-mono text-sm">agent.ARCH.iso</span> ISO to boot each host you plan to use in the cluster.</li>
                <li>Once all hosts are booted, the installation should automatically begin.</li>
                <li>Monitor the installation progress:<br />
                  <span className="text-gray-500 font-mono text-sm ml-5">./bin/openshift-install agent wait-for install-complete --dir path/with/yaml/files [--log-level=debug]</span>
                </li>
              </ol>
            </div>
          )}
        </div>

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
                <div className="absolute top-2 right-2 flex gap-2 z-10">
                  <button
                    onClick={() => downloadFile(installConfigYAMLOutput, "install-config.yaml")}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => copyToClipboard(installConfigYAMLOutput, setCopiedInstall)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    {copiedInstall ? "Copied!" : "Copy"}
                  </button>
                </div>
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
                <div className="absolute top-2 right-2 flex gap-2 z-10">
                  <button
                    onClick={() => downloadFile(agentConfigYAMLOutput, "agent-config.yaml")}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => copyToClipboard(agentConfigYAMLOutput, setCopiedAgent)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    {copiedAgent ? "Copied!" : "Copy"}
                  </button>
                </div>
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
