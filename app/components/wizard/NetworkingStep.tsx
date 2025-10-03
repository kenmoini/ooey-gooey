"use client";

import { useFormContext } from "@/app/context/FormContext";
import { LoadBalancerType } from "@/app/types";
import { useState } from "react";

const loadBalancerTypes: LoadBalancerType[] = ["Internal", "External"];

export default function NetworkingStep() {
  const { formData, updateFormData } = useFormContext();
  const [dnsServer, setDnsServer] = useState("");
  const [dnsSearchDomain, setDnsSearchDomain] = useState("");

  const addDnsServer = () => {
    if (dnsServer.trim()) {
      updateFormData({ dnsServers: [...formData.dnsServers, dnsServer.trim()] });
      setDnsServer("");
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Networking Configuration</h2>

      <div className="space-y-4">
        <div className="pb-4">
          <label htmlFor="loadBalancerType" className="block text-sm font-medium mb-2">
            Load Balancer Type
          </label>
          <select
            id="loadBalancerType"
            value={formData.loadBalancerType}
            onChange={(e) =>
              updateFormData({ loadBalancerType: e.target.value as LoadBalancerType })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {loadBalancerTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <hr className="pt-4" />
        <div>
          <label htmlFor="apiVIP" className="block text-sm font-medium mb-2">
            API VIP
          </label>
          <input
            id="apiVIP"
            type="text"
            value={formData.apiVIP}
            onChange={(e) => updateFormData({ apiVIP: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter API VIP address"
          />
        </div>

        <div className="pb-4">
          <label htmlFor="ingressVIP" className="block text-sm font-medium mb-2">
            Ingress VIP
          </label>
          <input
            id="ingressVIP"
            type="text"
            value={formData.ingressVIP}
            onChange={(e) => updateFormData({ ingressVIP: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Ingress VIP address"
          />
        </div>


        <hr className="pt-4" />

        <div className="pb-4">
          <label htmlFor="dnsServers" className="block text-sm font-medium mb-2">
            DNS Servers
          </label>
          <div className="flex gap-2">
            <input
              id="dnsServers"
              type="text"
              value={dnsServer}
              onChange={(e) => setDnsServer(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addDnsServer()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <div>
          <label htmlFor="dnsSearchDomains" className="block text-sm font-medium mb-2">
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
      </div>
    </div>
  );
}
