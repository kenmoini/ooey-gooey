import { FormData } from "@/app/types";
import yaml from "js-yaml";

export function generateYaml(formData: FormData): string {
  const yamlData: any = {
    cluster: {
      name: formData.clusterName,
      domain: formData.clusterDomain,
      type: formData.clusterType,
      platformType: formData.platformType,
    },
  };

  if (formData.nodes.length > 0) {
    yamlData.nodes = formData.nodes.map((node) => {
      const nodeData: any = { name: node.name };
      if (node.role) {
        nodeData.role = node.role;
      }
      return nodeData;
    });
  }

  yamlData.networking = {
    loadBalancerType: formData.loadBalancerType,
  };

  if (formData.apiVIP.trim()) {
    yamlData.networking.apiVIP = formData.apiVIP;
  }

  if (formData.ingressVIP.trim()) {
    yamlData.networking.ingressVIP = formData.ingressVIP;
  }

  if (formData.dnsServers.length > 0) {
    yamlData.networking.dnsServers = formData.dnsServers;
  }

  if (formData.dnsSearchDomains.length > 0) {
    yamlData.networking.dnsSearchDomains = formData.dnsSearchDomains;
  }

  if (formData.configureDisconnectedRegistries) {
    yamlData.disconnected = {
      releaseImageRegistry: formData.releaseImageRegistry,
      platformImagesRegistry: formData.platformImagesRegistry,
    };
  }

  yamlData.advanced = {};

  if (formData.ntpServers.length > 0) {
    yamlData.advanced.ntpServers = formData.ntpServers;
  }

  yamlData.advanced.totalClusterNetworkCIDR = formData.totalClusterNetworkCIDR;
  yamlData.advanced.clusterNetworkHostPrefix = formData.clusterNetworkHostPrefix;
  yamlData.advanced.serviceNetworkCIDR = formData.serviceNetworkCIDR;

  if (formData.sshPublicKeys.length > 0) {
    yamlData.advanced.sshPublicKeys = formData.sshPublicKeys;
  }

  if (formData.httpProxy.trim() || formData.httpsProxy.trim() || formData.noProxy.trim()) {
    yamlData.advanced.proxy = {};
    if (formData.httpProxy.trim()) {
      yamlData.advanced.proxy.httpProxy = formData.httpProxy;
    }
    if (formData.httpsProxy.trim()) {
      yamlData.advanced.proxy.httpsProxy = formData.httpsProxy;
    }
    if (formData.noProxy.trim()) {
      yamlData.advanced.proxy.noProxy = formData.noProxy;
    }
  }

  if (formData.additionalTrustedRootCAs.trim()) {
    yamlData.advanced.additionalTrustedRootCAs = formData.additionalTrustedRootCAs;
  }

  // Remove advanced section if it's empty (only has the network defaults)
  if (
    Object.keys(yamlData.advanced).length === 2 &&
    yamlData.advanced.totalClusterNetworkCIDR === "10.128.0.0/14" &&
    yamlData.advanced.clusterNetworkHostPrefix === 23 &&
    !formData.ntpServers.length &&
    !formData.additionalTrustedRootCAs.trim()
  ) {
    delete yamlData.advanced;
  }

  return yaml.dump(yamlData);
}
