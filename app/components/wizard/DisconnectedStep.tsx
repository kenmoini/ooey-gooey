"use client";

import { useFormContext } from "@/app/context/FormContext";

export default function DisconnectedStep() {
  const { formData, updateFormData } = useFormContext();

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
          <label htmlFor="configureDisconnectedRegistries" className="ml-2 text-sm font-medium">
            Configure Disconnected Registries
          </label>
        </div>

        {formData.configureDisconnectedRegistries && (
          <div className="space-y-4 pl-6 border-l-2 border-blue-500">
            <div>
              <label htmlFor="releaseImageRegistry" className="block text-sm font-medium mb-2">
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

            <div>
              <label htmlFor="platformImagesRegistry" className="block text-sm font-medium mb-2">
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
          </div>
        )}
      </div>
    </div>
  );
}
