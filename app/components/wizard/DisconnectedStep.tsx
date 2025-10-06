"use client";

import { useFormContext } from "@/app/context/FormContext";
import { RegistryMapping } from "@/app/types";
import { useState } from "react";

export default function DisconnectedStep() {
  const { formData, updateFormData } = useFormContext();
  const [sourceRegistry, setSourceRegistry] = useState("");
  const [mirrorRegistry, setMirrorRegistry] = useState("");

  const addRegistryMapping = () => {
    if (sourceRegistry.trim() && mirrorRegistry.trim()) {
      const newMapping: RegistryMapping = {
        id: Date.now().toString(),
        sourceRegistry: sourceRegistry.trim(),
        mirrorRegistry: mirrorRegistry.trim(),
      };
      updateFormData({ registryMappings: [...formData.registryMappings, newMapping] });
      setSourceRegistry("");
      setMirrorRegistry("");
    }
  };

  const removeRegistryMapping = (id: string) => {
    updateFormData({
      registryMappings: formData.registryMappings.filter((mapping) => mapping.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Disconnected Configuration</h2>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id="configureDisconnectedRegistries"
            type="checkbox"
            checked={formData.configureDisconnectedRegistries}
            onChange={(e) => updateFormData({ configureDisconnectedRegistries: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="configureDisconnectedRegistries" className="ml-2 text-md font-medium">
            Configure Disconnected Registries
          </label>
        </div>

        {formData.configureDisconnectedRegistries && (
          <div className="space-y-4 pl-6 border-l-2 border-blue-500">

              <div className="py-2 text-sm text-gray-600">
                <span>Ensure the Root Certificate Authority that is used for the Mirror Registry is added in the Additional Trusted Root CAs field in the next step.</span>
              </div>
            <div>
              <label htmlFor="releaseImageRegistry" className="block text-md font-medium mb-2">
                Release Image Registry
              </label>
              <input
                id="releaseImageRegistry"
                type="text"
                value={formData.releaseImageRegistry}
                onChange={(e) => updateFormData({ releaseImageRegistry: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="quay.io/openshift-release-dev/ocp-release"
              />
            </div>

            <div className="pb-5">
              <label htmlFor="platformImagesRegistry" className="block text-md font-medium mb-2">
                Platform Images Registry
              </label>
              <input
                id="platformImagesRegistry"
                type="text"
                value={formData.platformImagesRegistry}
                onChange={(e) => updateFormData({ platformImagesRegistry: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="quay.io/openshift-release-dev/ocp-v4.0-art-dev"
              />
            </div>

            <hr />

            <div className="pt-5">
              <label className="block text-md font-medium mb-2">
                Additional Registry Mappings
              </label>
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-2">
                  <input
                    type="text"
                    value={sourceRegistry}
                    onChange={(e) => setSourceRegistry(e.target.value)}
                    className="col-span-3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Source Registry"
                  />
                  <input
                    type="text"
                    value={mirrorRegistry}
                    onChange={(e) => setMirrorRegistry(e.target.value)}
                    className="col-span-3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mirror Registry"
                  />
                <button
                  onClick={addRegistryMapping}
                  className="col-span-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                  + Add
                </button>
                  </div>
              </div>

              {formData.registryMappings.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.registryMappings.map((mapping) => (
                    <div
                      key={mapping.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-500">Source:</span>
                          <div className="font-mono text-sm">{mapping.sourceRegistry}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Mirror:</span>
                          <div className="font-mono text-sm">{mapping.mirrorRegistry}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeRegistryMapping(mapping.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded ml-4"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
