"use client";

import { useFormContext } from "@/app/context/FormContext";
import { LoadBalancerType } from "@/app/types";

const loadBalancerTypes: LoadBalancerType[] = ["Internal", "External"];

export default function NetworkingStep() {
  const { formData, updateFormData } = useFormContext();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Networking Configuration</h2>

      <div className="space-y-4">
        <div>
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

        <div>
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
      </div>
    </div>
  );
}
