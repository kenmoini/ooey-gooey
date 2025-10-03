"use client";

import { useFormContext } from "@/app/context/FormContext";
import { ClusterType, PlatformType } from "@/app/types";
import { useEffect } from "react";

const clusterTypes: ClusterType[] = ["Single Node", "Compact", "Multi HA Cluster"];
const platformTypes: PlatformType[] = ["Bare Metal", "vSphere", "None"];

export default function ArchitectureStep() {
  const { formData, updateFormData } = useFormContext();
  const isSingleNode = formData.clusterType === "Single Node";

  useEffect(() => {
    // Force Platform Type to "None" when Cluster Type is "Single Node"
    if (isSingleNode && formData.platformType !== "None") {
      updateFormData({ platformType: "None" });
    }
  }, [isSingleNode, formData.platformType, updateFormData]);

  const handleClusterTypeChange = (value: ClusterType) => {
    if (value === "Single Node") {
      updateFormData({ clusterType: value, platformType: "None" });
    } else {
      updateFormData({ clusterType: value });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Architecture Configuration</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="clusterType" className="block text-sm font-medium mb-2">
            Cluster Type
          </label>
          <select
            id="clusterType"
            value={formData.clusterType}
            onChange={(e) => handleClusterTypeChange(e.target.value as ClusterType)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {clusterTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="platformType" className="block text-sm font-medium mb-2">
            Platform Type
          </label>
          <select
            id="platformType"
            value={formData.platformType}
            onChange={(e) => updateFormData({ platformType: e.target.value as PlatformType })}
            disabled={isSingleNode}
            className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isSingleNode ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          >
            {platformTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {isSingleNode && (
            <p className="mt-1 text-xs text-gray-500">
              Platform Type is set to "None" for Single Node clusters
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
