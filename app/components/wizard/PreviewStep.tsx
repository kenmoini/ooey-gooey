"use client";

import { useFormContext } from "@/app/context/FormContext";
import { generateYaml, generateInstallConfigYAML } from "@/app/utils/generateYaml";

export default function PreviewStep() {
  const { formData } = useFormContext();
  const yamlOutput = generateYaml(formData);
  const installConfigYAMLOutput = generateInstallConfigYAML(formData);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Preview Configuration</h2>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Generated install-config.yaml </h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-auto font-mono text-sm">
            {installConfigYAMLOutput}
          </pre>
        </div>
      </div>
    </div>
  );
}
