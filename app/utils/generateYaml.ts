import { FormData } from "@/app/types";
import yaml from "js-yaml";
import { platform } from "os";

export function generateInstallConfigYAML(formData: FormData): string {
  const installConfig: any = {
    pullSecret: "PULL_SECRET_CHANGE_ME", // This would typically be filled with a valid pull secret
    apiVersion: "v1",
    baseDomain: formData.clusterDomain,
    metadata: {
      name: formData.clusterName,
    },
    compute: [
      {
        name: "worker",
        replicas: formData.nodes.filter((node) => node.role === "Application").length,
      },
    ],
    controlPlane: {
      name: "master",
      replicas: formData.nodes.filter((node) => node.role === "Control Plane").length,
    },
    networking: {
      networkType: "OVN-Kubernetes",
      clusterNetwork: [
        {
          cidr: formData.totalClusterNetworkCIDR,
          hostPrefix: formData.clusterNetworkHostPrefix,
        },
      ],
      serviceNetwork: [formData.serviceNetworkCIDR],
    },
    fips: formData.fipsMode || false,
    sshKey: formData.sshPublicKeys ? formData.sshPublicKeys.join("\n") : undefined,
    proxy: formData.httpProxy || formData.httpsProxy || formData.noProxy ? {
      httpProxy: formData.httpProxy || undefined,
      httpsProxy: formData.httpsProxy || undefined,
      noProxy: formData.noProxy || undefined,
    } : undefined,
    additionalTrustBundle: formData.additionalTrustedRootCAs || undefined,
    additionalTrustBundlePolicy: formData.additionalTrustedRootCAs ? "Always" : undefined,
  };

  if (formData.platformType === "Bare Metal") {
    installConfig.platform = {
      baremetal: {
        apiVIPs: formData.apiVIP ? [formData.apiVIP] : [],
        ingressVIPs: formData.ingressVIP ? [formData.ingressVIP] : [],
      },
    };
  } else if (formData.platformType === "vSphere") {
    installConfig.platform = {
      vsphere: {
        apiVIPs: formData.apiVIP ? [formData.apiVIP] : [],
        ingressVIPs: formData.ingressVIP ? [formData.ingressVIP] : [],
        vCenter: {
          host: "vcenter.example.com", // Placeholder, should be replaced with actual data
          username: "vcenter-username", // Placeholder, should be replaced with actual data
          password: "vcenter-password", // Placeholder, should be replaced with actual data
          datacenters: ["Datacenter"], // Placeholder, should be replaced with actual data
          defaultDatastore: "Datastore", // Placeholder, should be replaced with actual data
        },
      },
    };
  } else if (formData.platformType === "None") {
    installConfig.platform = {
      none: {},
    };
  }

  if (formData.configureDisconnectedRegistries) {
    installConfig.imageContentSources = [
        {
          source: "quay.io/openshift-release-dev/ocp-release",
          mirrors: [formData.releaseImageRegistry],
        },
        {
          source: "quay.io/openshift-release-dev/ocp-v4.0-art-dev",
          mirrors: [formData.platformImagesRegistry],
        },
    ];
    formData.registryMappings.forEach((mapping) => {
      installConfig.imageContentSources.push({
        source: mapping.sourceRegistry,
        mirrors: [mapping.mirrorRegistry],
      });
    });
  }

  return yaml.dump(installConfig);
}

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

    if (formData.registryMappings.length > 0) {
      yamlData.disconnected.registryMappings = formData.registryMappings.map((mapping) => ({
        source: mapping.sourceRegistry,
        mirror: mapping.mirrorRegistry,
      }));
    }
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
