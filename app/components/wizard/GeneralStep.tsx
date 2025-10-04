"use client";

import { useFormContext } from "@/app/context/FormContext";
import { useState } from "react";
import { useEffect } from "react";
import { ClusterType, PlatformType } from "@/app/types";

const clusterTypes: ClusterType[] = ["Single Node", "Compact", "Multi HA Cluster"];
const platformTypes: PlatformType[] = ["Bare Metal", "vSphere", "None"];

export default function GeneralStep() {
  const { formData, updateFormData } = useFormContext();
  const [clusterNameError, setClusterNameError] = useState("");
  const [clusterDomainError, setClusterDomainError] = useState("");
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

  const validateClusterName = (name: string): string => {
    if (name.length === 0) {
      return "";
    }

    if (name.length > 63) {
      return "Cluster name must not exceed 63 characters";
    }

    if (!/^[a-z]/.test(name)) {
      return "Cluster name must start with a lowercase alphabetic character";
    }

    if (!/[a-z0-9]$/.test(name)) {
      return "Cluster name must end with a lowercase alphanumeric character";
    }

    if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(name) && name.length > 1) {
      return "Cluster name must contain only lowercase alphanumeric characters or '-'";
    }

    if (name.length === 1 && !/^[a-z]$/.test(name)) {
      return "Cluster name must contain only lowercase alphabetic characters";
    }

    return "";
  };

  const validateClusterDomain = (domain: string): string => {
    if (domain.length === 0) {
      return "";
    }

    // Check overall length (max 253 characters for FQDN)
    if (domain.length > 253) {
      return "Domain name must not exceed 253 characters";
    }

    // Check if domain ends with a dot (valid but we'll normalize)
    const normalizedDomain = domain.endsWith('.') ? domain.slice(0, -1) : domain;

    // Split into labels
    const labels = normalizedDomain.split('.');

    // Must have at least one label
    if (labels.length === 0) {
      return "Domain must not be empty";
    }

    // Validate each label
    for (const label of labels) {
      if (label.length === 0) {
        return "Domain part cannot be empty";
      }

      if (label.length > 63) {
        return "Each domain part must not exceed 63 characters";
      }

      // Check label format: must start and end with alphanumeric, can contain hyphens
      if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test(label)) {
        return "Invalid input";
      }

      // Check for consecutive hyphens (not allowed in some contexts)
      if (/--/.test(label)) {
        return "Domain parts cannot contain consecutive hyphens";
      }
    }

    // Check for valid TLD (at least 2 parts, last one should be letters)
    if (labels.length < 2) {
      return "Domain must contain at least two parts (e.g., example.com)";
    }

    const tld = labels[labels.length - 1];
    if (!/^[a-z]+$/i.test(tld)) {
      return "Top-level domain must contain only letters";
    }

    return "";
  };

  const handleClusterNameChange = (value: string) => {
    updateFormData({ clusterName: value });
    const error = validateClusterName(value);
    setClusterNameError(error);
  };

  const handleClusterDomainChange = (value: string) => {
    updateFormData({ clusterDomain: value });
    const error = validateClusterDomain(value);
    setClusterDomainError(error);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">General Configuration</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="clusterName" className="block text-sm font-medium mb-2">
            Cluster Name
          </label>
          <input
            id="clusterName"
            type="text"
            value={formData.clusterName}
            onChange={(e) => handleClusterNameChange(e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              clusterNameError
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="Enter cluster name"
          />
          {clusterNameError && (
            <p className="mt-1 text-sm text-red-600">{clusterNameError}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Must follow RFC 1123: lowercase, max 63 chars, start with letter, end with alphanumeric, only alphanumeric or dashes.
          </p>
        </div>

        <div>
          <label htmlFor="clusterDomain" className="block text-sm font-medium mb-2">
            Cluster Domain
          </label>
          <input
            id="clusterDomain"
            type="text"
            value={formData.clusterDomain}
            onChange={(e) => handleClusterDomainChange(e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              clusterDomainError
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="Enter cluster domain"
          />
          {clusterDomainError && (
            <p className="mt-1 text-sm text-red-600">{clusterDomainError}</p>
          )}
        </div>
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
              Platform Type is set to &quot;None&quot; for Single Node clusters
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
