"use client";

import { useFormContext } from "@/app/context/FormContext";
import { generateYaml } from "@/app/utils/generateYaml";

export default function PreviewStep() {
  const { formData } = useFormContext();
  const yamlOutput = generateYaml(formData);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Preview Configuration</h2>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Form Data Summary</h3>

          <div className="bg-gray-50 p-4 rounded-md space-y-2">
            <div>
              <span className="font-medium">Cluster Name:</span> {formData.clusterName}
            </div>
            <div>
              <span className="font-medium">Cluster Domain:</span> {formData.clusterDomain}
            </div>
            <div>
              <span className="font-medium">Cluster Type:</span> {formData.clusterType}
            </div>
            <div>
              <span className="font-medium">Platform Type:</span> {formData.platformType}
            </div>
            <div>
              <span className="font-medium">Load Balancer Type:</span> {formData.loadBalancerType}
            </div>
            {formData.apiVIP && (
              <div>
                <span className="font-medium">API VIP:</span> {formData.apiVIP}
              </div>
            )}
            {formData.ingressVIP && (
              <div>
                <span className="font-medium">Ingress VIP:</span> {formData.ingressVIP}
              </div>
            )}
            {formData.dnsServers.length > 0 && (
              <div>
                <span className="font-medium">DNS Servers:</span>
                <ul className="ml-6 mt-1">
                  {formData.dnsServers.map((server, index) => (
                    <li key={index} className="list-disc">
                      {server}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {formData.dnsSearchDomains.length > 0 && (
              <div>
                <span className="font-medium">DNS Search Domains:</span>
                <ul className="ml-6 mt-1">
                  {formData.dnsSearchDomains.map((domain, index) => (
                    <li key={index} className="list-disc">
                      {domain}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {formData.nodes.length > 0 && (
              <div>
                <span className="font-medium">Nodes:</span>
                <ul className="ml-6 mt-1">
                  {formData.nodes.map((node) => (
                    <li key={node.id} className="list-disc">
                      {node.name}
                      {node.role && ` - ${node.role}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {formData.ntpServers.length > 0 && (
              <div>
                <span className="font-medium">NTP Servers:</span>
                <ul className="ml-6 mt-1">
                  {formData.ntpServers.map((server, index) => (
                    <li key={index} className="list-disc">
                      {server}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <span className="font-medium">Total Cluster Network CIDR:</span> {formData.totalClusterNetworkCIDR}
            </div>
            <div>
              <span className="font-medium">Cluster Network Host Prefix:</span> {formData.clusterNetworkHostPrefix}
            </div>
            <div>
              <span className="font-medium">Service Network CIDR:</span> {formData.serviceNetworkCIDR}
            </div>
            {formData.configureDisconnectedRegistries && (
              <div>
                <span className="font-medium">Disconnected Registries:</span>
                <div className="ml-6 mt-1">
                  <div className="text-sm">
                    <span className="font-medium">Release Image Registry:</span> {formData.releaseImageRegistry}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Platform Images Registry:</span> {formData.platformImagesRegistry}
                  </div>
                  {formData.registryMappings.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium">Registry Mappings:</span>
                      <ul className="ml-6 mt-1">
                        {formData.registryMappings.map((mapping) => (
                          <li key={mapping.id} className="list-disc text-sm">
                            {mapping.sourceRegistry} → {mapping.mirrorRegistry}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
            {formData.sshPublicKeys.length > 0 && (
              <div>
                <span className="font-medium">SSH Public Keys:</span>
                <ul className="ml-6 mt-1">
                  {formData.sshPublicKeys.map((key, index) => (
                    <li key={index} className="list-disc">
                      <span className="font-mono text-xs">{key.substring(0, 50)}...</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(formData.httpProxy || formData.httpsProxy || formData.noProxy) && (
              <div>
                <span className="font-medium">Proxy Configuration:</span>
                <div className="ml-6 mt-1">
                  {formData.httpProxy && (
                    <div className="text-sm">
                      <span className="font-medium">HTTP Proxy:</span> {formData.httpProxy}
                    </div>
                  )}
                  {formData.httpsProxy && (
                    <div className="text-sm">
                      <span className="font-medium">HTTPS Proxy:</span> {formData.httpsProxy}
                    </div>
                  )}
                  {formData.noProxy && (
                    <div className="text-sm">
                      <span className="font-medium">No Proxy:</span> {formData.noProxy}
                    </div>
                  )}
                </div>
              </div>
            )}
            {formData.additionalTrustedRootCAs && (
              <div>
                <span className="font-medium">Additional Trusted Root CAs:</span>
                <pre className="mt-1 text-sm bg-white p-2 rounded border overflow-auto">
                  {formData.additionalTrustedRootCAs}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Generated YAML</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-auto font-mono text-sm">
            {yamlOutput}
          </pre>
        </div>
      </div>
    </div>
  );
}
