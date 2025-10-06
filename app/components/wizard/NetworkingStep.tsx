"use client";

import { useFormContext } from "@/app/context/FormContext";
import { LoadBalancerType } from "@/app/types";
import { useState, useEffect } from "react";
import { validateIPv4Address, validateIPv4CIDR } from "@/app/utils/validation";

const loadBalancerTypes: LoadBalancerType[] = ["Internal", "External"];

export default function NetworkingStep() {
  const { formData, updateFormData } = useFormContext();
  const [dnsServer, setDnsServer] = useState("");
  const [dnsSearchDomain, setDnsSearchDomain] = useState("");
  const [machineNetworkCIDR, setMachineNetworkCIDR] = useState("");
  const [apiVIPError, setApiVIPError] = useState("");
  const [ingressVIPError, setIngressVIPError] = useState("");
  const [dnsServerError, setDnsServerError] = useState("");
  const [machineNetworkCIDRError, setMachineNetworkCIDRError] = useState("");

  const handleDnsServerChange = (value: string) => {
    setDnsServer(value);
    const error = validateIPv4Address(value);
    setDnsServerError(error);
  };

  const addDnsServer = () => {
    if (dnsServer.trim()) {
      const error = validateIPv4Address(dnsServer.trim());
      if (error) {
        setDnsServerError(error);
        return;
      }
      updateFormData({ dnsServers: [...formData.dnsServers, dnsServer.trim()] });
      setDnsServer("");
      setDnsServerError("");
    }
  };

  const removeDnsServer = (index: number) => {
    updateFormData({
      dnsServers: formData.dnsServers.filter((_, i) => i !== index),
    });
  };

  const addDnsSearchDomain = () => {
    if (dnsSearchDomain.trim()) {
      updateFormData({ dnsSearchDomains: [...formData.dnsSearchDomains, dnsSearchDomain.trim()] });
      setDnsSearchDomain("");
    }
  };

  const removeDnsSearchDomain = (index: number) => {
    updateFormData({
      dnsSearchDomains: formData.dnsSearchDomains.filter((_, i) => i !== index),
    });
  };

  const handleMachineNetworkCIDRChange = (value: string) => {
    setMachineNetworkCIDR(value);
    const error = validateIPv4CIDR(value);
    setMachineNetworkCIDRError(error);
  };

  const addMachineNetworkCIDR = () => {
    if (machineNetworkCIDR.trim()) {
      const error = validateIPv4CIDR(machineNetworkCIDR.trim());
      if (error) {
        setMachineNetworkCIDRError(error);
        return;
      }
      updateFormData({ machineNetworkCIDRs: [...formData.machineNetworkCIDRs, machineNetworkCIDR.trim()] });
      setMachineNetworkCIDR("");
      setMachineNetworkCIDRError("");
    }
  };

  const removeMachineNetworkCIDR = (index: number) => {
    updateFormData({
      machineNetworkCIDRs: formData.machineNetworkCIDRs.filter((_, i) => i !== index),
    });
  };

  const handleApiVIPChange = (value: string) => {
    updateFormData({ apiVIP: value });
    const error = validateIPv4Address(value);
    setApiVIPError(error);
  };

  const handleIngressVIPChange = (value: string) => {
    updateFormData({ ingressVIP: value });
    const error = validateIPv4Address(value);
    setIngressVIPError(error);
  };

  // Validate networking step
  useEffect(() => {
    const isSingleNode = formData.clusterType === "Single Node";
    const isValid = () => {
      // For non-Single Node clusters, API VIP and Ingress VIP are required and must be valid
      if (!isSingleNode) {
        if (!formData.apiVIP || !formData.ingressVIP) {
          return false;
        }
        // Check for validation errors
        const apiError = validateIPv4Address(formData.apiVIP);
        const ingressError = validateIPv4Address(formData.ingressVIP);
        if (apiError || ingressError) {
          return false;
        }
      }

      // DNS Servers, DNS Search Domains, and Machine Network CIDRs must not be empty
      if (formData.dnsServers.length === 0) {
        return false;
      }
      if (formData.dnsSearchDomains.length === 0) {
        return false;
      }
      if (formData.machineNetworkCIDRs.length === 0) {
        return false;
      }

      return true;
    };

    updateFormData({
      networkingStepValid: isValid()
    });
  }, [
    formData.clusterType,
    formData.apiVIP,
    formData.ingressVIP,
    formData.dnsServers,
    formData.dnsSearchDomains,
    formData.machineNetworkCIDRs,
    updateFormData
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Networking Configuration</h2>

      <div className="space-y-4">

        {formData.clusterType === "Single Node" ? (
          <div className="pb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">Single Node Deployment</h3>
                <p className="text-sm text-blue-800">
                  API VIP and Ingress VIP are not used with Single Node deployments. Only the Node IP address is needed, which should be configured in the Host Networking section.<br /><strong>API and Ingress DNS records should point to the Single Node Host IP address.</strong>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="apiVIP" className="block text-md font-medium mb-2">
                API VIP {apiVIPError && ( <span className="ml-4 text-sm text-red-600">{apiVIPError}</span> )}
                <br /><span className="text-gray-400" title="Virtual IP for the API server">DNS A Record matching <span className="font-mono">api.{formData.clusterName}.{formData.clusterDomain}</span></span>
              </label>
              <input
                id="apiVIP"
                type="text"
                value={formData.apiVIP}
                onChange={(e) => handleApiVIPChange(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  apiVIPError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Enter API VIP address"
              />
            </div>

            <div className="pb-4">
              <label htmlFor="ingressVIP" className="block text-md font-medium mb-2">
                Ingress VIP
                <br /><span className="text-gray-400" title="Virtual IP for the API server">DNS A Record matching <span className="font-mono">*.apps.{formData.clusterName}.{formData.clusterDomain}</span></span>
              </label>
              <input
                id="ingressVIP"
                type="text"
                value={formData.ingressVIP}
                onChange={(e) => handleIngressVIPChange(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  ingressVIPError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Enter Ingress VIP address"
              />
              {ingressVIPError && (
                <p className="mt-1 text-sm text-red-600">{ingressVIPError}</p>
              )}
            </div>
          </>
        )}


        <hr className="pt-4" />

        <div className="pb-4">
          <label htmlFor="dnsServers" className="block text-md font-medium mb-2">
            DNS Servers{dnsServerError && ( <span className="ml-4 text-sm text-red-600">{dnsServerError}</span> )}
          </label>
          <div className="flex gap-2">
              <input
                id="dnsServers"
                type="text"
                value={dnsServer}
                onChange={(e) => handleDnsServerChange(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addDnsServer()}
                className={`w-full px-4 flex-1 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  dnsServerError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Enter DNS server address"
              />
            <button
              onClick={addDnsServer}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
          {formData.dnsServers.length > 0 && (
            <ul className="mt-2 space-y-2">
              {formData.dnsServers.map((server, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <span>{server}</span>
                  <button
                    onClick={() => removeDnsServer(index)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="pb-4">
          <label htmlFor="dnsSearchDomains" className="block text-md font-medium mb-2">
            DNS Search Domains
          </label>
          <div className="flex gap-2">
            <input
              id="dnsSearchDomains"
              type="text"
              value={dnsSearchDomain}
              onChange={(e) => setDnsSearchDomain(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addDnsSearchDomain()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter DNS search domain"
            />
            <button
              onClick={addDnsSearchDomain}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
          {formData.dnsSearchDomains.length > 0 && (
            <ul className="mt-2 space-y-2">
              {formData.dnsSearchDomains.map((domain, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <span>{domain}</span>
                  <button
                    onClick={() => removeDnsSearchDomain(index)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <hr className="pt-4" />

        <div>
          <label htmlFor="machineNetworkCIDRs" className="block text-md font-medium mb-2">
            Machine Network CIDRs {machineNetworkCIDRError && ( <span className="ml-4 text-sm text-red-600">{machineNetworkCIDRError}</span> )}
            <br /><span className="text-gray-400 text-sm">Must include used subnets for node default route interfaces and VIPs</span>
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                id="machineNetworkCIDRs"
                type="text"
                value={machineNetworkCIDR}
                onChange={(e) => handleMachineNetworkCIDRChange(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addMachineNetworkCIDR()}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  machineNetworkCIDRError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Enter machine network CIDR (e.g., 192.168.1.0/24)"
              />
              
            </div>
            <button
              onClick={addMachineNetworkCIDR}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
          {formData.machineNetworkCIDRs.length > 0 && (
            <ul className="mt-2 space-y-2">
              {formData.machineNetworkCIDRs.map((cidr, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <span>{cidr}</span>
                  <button
                    onClick={() => removeMachineNetworkCIDR(index)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
