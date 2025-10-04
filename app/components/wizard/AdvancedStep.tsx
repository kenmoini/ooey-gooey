"use client";

import { useFormContext } from "@/app/context/FormContext";
import { useState } from "react";

const hostPrefixOptions = Array.from({ length: 19 }, (_, i) => i + 8); // 8-26

export default function AdvancedStep() {
  const { formData, updateFormData } = useFormContext();
  const [ntpServer, setNtpServer] = useState("");
  const [sshPublicKey, setSshPublicKey] = useState("");
  const [isProxyExpanded, setIsProxyExpanded] = useState(false);
  const [isSubnetsExpanded, setIsSubnetsExpanded] = useState(false);

  const addNtpServer = () => {
    if (ntpServer.trim()) {
      updateFormData({ ntpServers: [...formData.ntpServers, ntpServer.trim()] });
      setNtpServer("");
    }
  };

  const removeNtpServer = (index: number) => {
    updateFormData({
      ntpServers: formData.ntpServers.filter((_, i) => i !== index),
    });
  };

  const addSshPublicKey = () => {
    if (sshPublicKey.trim()) {
      updateFormData({ sshPublicKeys: [...formData.sshPublicKeys, sshPublicKey.trim()] });
      setSshPublicKey("");
    }
  };

  const removeSshPublicKey = (index: number) => {
    updateFormData({
      sshPublicKeys: formData.sshPublicKeys.filter((_, i) => i !== index),
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content.trim()) {
          updateFormData({ sshPublicKeys: [...formData.sshPublicKeys, content.trim()] });
        }
      };
      reader.readAsText(file);
      // Reset the input value so the same file can be uploaded again
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Advanced Configuration</h2>

      <div className="space-y-4">
        <div className="pb-4">
          <label htmlFor="ntpServers" className="block text-sm font-medium mb-2">
            NTP Servers
          </label>
          <div className="flex gap-2">
            <input
              id="ntpServers"
              type="text"
              value={ntpServer}
              onChange={(e) => setNtpServer(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addNtpServer()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter NTP server address"
            />
            <button
              onClick={addNtpServer}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
          {formData.ntpServers.length > 0 && (
            <ul className="mt-2 space-y-2">
              {formData.ntpServers.map((server, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <span>{server}</span>
                  <button
                    onClick={() => removeNtpServer(index)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <hr />

        <div className="py-5">
          <label htmlFor="sshPublicKeys" className="block text-sm font-medium mb-2">
            SSH Public Keys
          </label>
          <div className="flex gap-2">
            <input
              id="sshPublicKeys"
              type="text"
              value={sshPublicKey}
              onChange={(e) => setSshPublicKey(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addSshPublicKey()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ..."
            />
            <label
              htmlFor="sshKeyFileUpload"
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 cursor-pointer"
            >
              Upload
              <input
                id="sshKeyFileUpload"
                type="file"
                accept=".pub,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={addSshPublicKey}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
          {formData.sshPublicKeys.length > 0 && (
            <ul className="mt-2 space-y-2">
              {formData.sshPublicKeys.map((key, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <span className="font-mono text-sm truncate flex-1">{key}</span>
                  <button
                    onClick={() => removeSshPublicKey(index)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded ml-2"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <hr />

        <div className="py-5">
          <label htmlFor="additionalTrustedRootCAs" className="block text-sm font-medium mb-2">
            Additional Trusted Root CAs
          </label>
          <textarea
            id="additionalTrustedRootCAs"
            value={formData.additionalTrustedRootCAs}
            onChange={(e) => updateFormData({ additionalTrustedRootCAs: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] font-mono"
            placeholder="Paste additional trusted root CAs here..."
          />
        </div>

        <div className="border border-gray-300 rounded-md">
          <button
            type="button"
            onClick={() => setIsSubnetsExpanded(!isSubnetsExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium">Cluster Subnets</span>
            <svg
              className={`w-5 h-5 transition-transform ${isSubnetsExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isSubnetsExpanded && (
            <div className="px-4 pb-4 space-y-4 border-t border-gray-300">
              <div className="pt-4">
                <label htmlFor="totalClusterNetworkCIDR" className="block text-sm font-medium mb-2">
                  Total Cluster Network CIDR
                </label>
                <input
                  id="totalClusterNetworkCIDR"
                  type="text"
                  value={formData.totalClusterNetworkCIDR}
                  onChange={(e) => updateFormData({ totalClusterNetworkCIDR: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter cluster network CIDR"
                />
              </div>

              <div>
                <label htmlFor="clusterNetworkHostPrefix" className="block text-sm font-medium mb-2">
                  Cluster Network Host Prefix
                </label>
                <select
                  id="clusterNetworkHostPrefix"
                  value={formData.clusterNetworkHostPrefix}
                  onChange={(e) => updateFormData({ clusterNetworkHostPrefix: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {hostPrefixOptions.map((prefix) => (
                    <option key={prefix} value={prefix}>
                      {prefix}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="serviceNetworkCIDR" className="block text-sm font-medium mb-2">
                  Service Network CIDR
                </label>
                <input
                  id="serviceNetworkCIDR"
                  type="text"
                  value={formData.serviceNetworkCIDR}
                  onChange={(e) => updateFormData({ serviceNetworkCIDR: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter service network CIDR"
                />
              </div>
            </div>
          )}
        </div>

        <div className="border border-gray-300 rounded-md">
          <button
            type="button"
            onClick={() => setIsProxyExpanded(!isProxyExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium">Proxy Configuration</span>
            <svg
              className={`w-5 h-5 transition-transform ${isProxyExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isProxyExpanded && (
            <div className="px-4 pb-4 space-y-4 border-t border-gray-300">
              <div className="pt-4">
                <label htmlFor="httpProxy" className="block text-sm font-medium mb-2">
                  HTTP Proxy
                </label>
                <input
                  id="httpProxy"
                  type="text"
                  value={formData.httpProxy}
                  onChange={(e) => updateFormData({ httpProxy: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="http://proxy.example.com:8080"
                />
              </div>

              <div>
                <label htmlFor="httpsProxy" className="block text-sm font-medium mb-2">
                  HTTPS Proxy
                </label>
                <input
                  id="httpsProxy"
                  type="text"
                  value={formData.httpsProxy}
                  onChange={(e) => updateFormData({ httpsProxy: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://proxy.example.com:8443"
                />
              </div>

              <div>
                <label htmlFor="noProxy" className="block text-sm font-medium mb-2">
                  No Proxy
                </label>
                <input
                  id="noProxy"
                  type="text"
                  value={formData.noProxy}
                  onChange={(e) => updateFormData({ noProxy: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="localhost,127.0.0.1,.example.com"
                />
              </div>
              <div>
                <span className="text-xs text-gray-500">If your outbound proxy is doing SSL-reencryption then ensure the Root CA is present in the Additional Trusted Root CAs field above.</span>
              </div>
            </div>
          )}
        </div>

        <div className="items-center pt-4">
          <input
            id="fipsMode"
            type="checkbox"
            checked={formData.fipsMode}
            onChange={(e) => updateFormData({ fipsMode: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="fipsMode" className="ml-2 text-sm font-medium">
            FIPS Mode
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Note: To deploy a FIPS-enabled cluster, the host used to generate the ABI ISO must also be FIPS-enabled.
          </p>
        </div>
      </div>
    </div>
  );
}
