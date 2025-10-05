import { FormData } from "@/app/types";
import yaml from "js-yaml";

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
      networkType: "OVNKubernetes",
      clusterNetwork: [
        {
          cidr: formData.totalClusterNetworkCIDR,
          hostPrefix: formData.clusterNetworkHostPrefix,
        },
      ],
      serviceNetwork: [formData.serviceNetworkCIDR],
      machineNetwork: formData.machineNetworkCIDRs.length > 0
        ? formData.machineNetworkCIDRs.map(cidr => ({ cidr }))
        : undefined,
    },
    sshKey: formData.sshPublicKeys ? formData.sshPublicKeys.join("\n") : undefined,
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


  installConfig.fips = formData.fipsMode || false,
  installConfig.proxy = formData.httpProxy || formData.httpsProxy || formData.noProxy ? {
    httpProxy: formData.httpProxy || undefined,
    httpsProxy: formData.httpsProxy || undefined,
    noProxy: formData.noProxy || undefined,
  } : undefined,
  installConfig.additionalTrustBundlePolicy = formData.additionalTrustedRootCAs ? "Always" : undefined;
  installConfig.additionalTrustBundle = formData.additionalTrustedRootCAs || undefined;

  const outputY = yaml.dump(installConfig).replace(/: \|-/g, ': |');
  // Replace any '|-' with '|'
  return outputY;
}

export function generateAgentConfigYAML(formData: FormData): string {
  const agentConfig: any = {
    apiVersion: "v1alpha1",
    kind: "AgentConfig",
    metadata: {
      name: formData.clusterName,
    },
  };

  // Get the IP address of the default route interface of the first defined node
  const firstNode = formData.nodes[0];
  if (firstNode) {
    if (firstNode.interfaces && firstNode.interfaces.length > 0) {
      const defaultRouteInterface = firstNode.interfaces.find((iface) => iface.defaultRoute);
      if (defaultRouteInterface && defaultRouteInterface.ipv4Address) {
        agentConfig.rendezvousIP = defaultRouteInterface.ipv4Address.split('/')[0]; // Remove CIDR suffix
      }
    }
  }
  if (formData.ntpServers.length > 0) {
    agentConfig.additionalNTPSources = formData.ntpServers;
  }

  
  // Loop through the defined hosts and add them to the agentConfig
  agentConfig.hosts = formData.nodes.map((node) => {
    let defaultRouteInterfaceName: string | undefined;
    let defaultRouteInterfaceIPv4: string | undefined;
    const host: any = {
      hostname: node.name,
    };
    if (node.role) {
      if (node.role === "Control Plane") {
        host.role = "master";
      } else if (node.role === "Application") {
        host.role = "worker";
      }
    }
    if (!node.installationDeviceAuto) {
      host.rootDeviceHints = { deviceName: node.installationDevicePath };
    }
    
    if (node.interfaces && node.interfaces.length > 0) {
      const defaultRouteInterface = node.interfaces.find((iface) => iface.defaultRoute);
      if (defaultRouteInterface && defaultRouteInterface.gatewayIPv4) {
        defaultRouteInterfaceIPv4 = defaultRouteInterface.gatewayIPv4;
        defaultRouteInterfaceName = defaultRouteInterface.deviceName;
      }
      host.interfaces = node.interfaces.map((iface) => {
        // Only include Ethernet interfaces
        if (iface.type === "Ethernet") {
          const interfaceData: any = {
            name: iface.deviceName,
            macAddress: iface.macAddress,
          };
          return interfaceData;
        }
      });
      // Remove any undefined entries (non-Ethernet interfaces)
      host.interfaces = host.interfaces.filter((iface: any) => iface !== undefined);

    }

    // Network configuration
    if (node.interfaces && node.interfaces.length > 0) {
    host.networkConfig = {
      routes: {
        config: [
          {
            destination: "0.0.0.0/0",
            "next-hop-address": defaultRouteInterfaceIPv4,
            "next-hop-interface": defaultRouteInterfaceName,
            "table-id": 254,
          }
        ],
      },
      "dns-resolver": { config: { server: [...formData.dnsServers], search: [...formData.dnsSearchDomains] } },
      
    };
    if (node.interfaces && node.interfaces.length > 0) {
      host.networkConfig.interfaces = node.interfaces.map((iface) => {
        const interfaceData: any = {
          name: iface.deviceName,
        };
        if (iface.state) {
          interfaceData.state = iface.state.toLowerCase();
        }
        if (iface.macAddress) {
          interfaceData["mac-address"] = iface.macAddress.toLowerCase();
        }
        if (iface.mtu) {
          interfaceData.mtu = iface.mtu;
        }
        if (iface.type) {
          if (iface.type === "Bridge") {
            interfaceData.type = "linux-bridge";
          } else {
            interfaceData.type = iface.type.toLowerCase();
          }
        }

        if (iface.type === "Bond") {
          interfaceData["link-aggregation"] = {
            mode: iface.bondingMode || "active-backup",
            port: iface.bondPorts ? iface.bondPorts.map((port) => port) : [],
          };
          if (iface.bondingMode) {
            if (iface.bondingMode === "LACP") {
              interfaceData["link-aggregation"].mode = "802.3ad";
            } else if (iface.bondingMode === "Active/Backup") {
              interfaceData["link-aggregation"].mode = "active-backup";
            } else {
              interfaceData["link-aggregation"].mode = iface.bondingMode;
            }
          }
        }

        if (iface.type === "VLAN" && iface.vlanId && iface.vlanBaseInterface) {
          interfaceData.vlan = {
            id: iface.vlanId,
            "base-iface": iface.vlanBaseInterface,
          };
        }

        if (iface.type === "Bridge" && iface.bridgePorts && iface.bridgePorts.length > 0) {
          interfaceData.bridge = {
            port: iface.bridgePorts.map((port) => port),
          };
          
          interfaceData.bridge.options = {
            //stp: {enabled: false, priority: 32768, "max-age": 20, "hello-time": 2, "forward-delay": 15 },
            stp: {enabled: false },
          };
        }

        if (iface.enableIPv4) {
          interfaceData.ipv4 = {
            enabled: true,
            dhcp: iface.enableIPv4DHCP,
          };
          if (!iface.enableIPv4DHCP && iface.ipv4Address) {
            interfaceData.ipv4.address = [
              {
                address: iface.ipv4Address,
                "prefix-length": parseInt(iface.ipv4Address.split('/')[1], 10),
              },
            ];
          }
        } else {
          interfaceData.ipv4 = { enabled: false, dhcp: false };
        }
        // IPv6 Stub
        if (iface.enableIPv6) {
          interfaceData.ipv6 = { enabled: iface.enableIPv6 };
        } else {
          interfaceData.ipv6 = { enabled: false };
        }
        return interfaceData;
      });
    }
  }

    // 
    return host;
  });

  return yaml.dump(agentConfig);
}
