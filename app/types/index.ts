export type ClusterType = "Single Node" | "Compact" | "Multi HA Cluster";
export type LoadBalancerType = "Internal" | "External";
export type NodeRole = "Control Plane" | "Application";
export type PlatformType = "Bare Metal" | "vSphere" | "None";

export type InterfaceState = "Up" | "Down";
export type InterfaceType = "Ethernet" | "Bond" | "Bridge" | "VLAN";
export type BondingMode = "Active/Backup" | "LACP";

export interface NetworkInterface {
  id: string;
  deviceName: string;
  macAddress?: string;
  state?: InterfaceState;
  type?: InterfaceType;
  mtu?: number;
  enableIPv4?: boolean;
  enableIPv4DHCP?: boolean;
  ipv4Address?: string;
  gatewayIPv4?: string;
  enableIPv6?: boolean;
  bondPorts?: string[];
  bondingMode?: BondingMode;
  bridgePorts?: string[];
  vlanBaseInterface?: string;
  vlanId?: number;
  defaultRoute?: boolean;
}

export interface Node {
  id: string;
  name: string;
  role?: NodeRole;
  interfaces?: NetworkInterface[];
  installationDeviceAuto?: boolean;
  installationDevicePath?: string;
}

export interface RegistryMapping {
  id: string;
  sourceRegistry: string;
  mirrorRegistry: string;
}

export interface FormData {
  clusterName: string;
  clusterDomain: string;
  clusterType: ClusterType;
  platformType: PlatformType;
  fipsMode: boolean;
  nodes: Node[];
  loadBalancerType: LoadBalancerType;
  apiVIP: string;
  ingressVIP: string;
  dnsServers: string[];
  dnsSearchDomains: string[];
  configureDisconnectedRegistries: boolean;
  releaseImageRegistry: string;
  platformImagesRegistry: string;
  registryMappings: RegistryMapping[];
  ntpServers: string[];
  totalClusterNetworkCIDR: string;
  clusterNetworkHostPrefix: number;
  serviceNetworkCIDR: string;
  httpProxy: string;
  httpsProxy: string;
  noProxy: string;
  sshPublicKeys: string[];
  additionalTrustedRootCAs: string;
}

export const initialFormData: FormData = {
  clusterName: "",
  clusterDomain: "",
  clusterType: "Multi HA Cluster",
  platformType: "Bare Metal",
  fipsMode: false,
  nodes: [],
  loadBalancerType: "Internal",
  apiVIP: "",
  ingressVIP: "",
  dnsServers: [],
  dnsSearchDomains: [],
  configureDisconnectedRegistries: false,
  releaseImageRegistry: "quay.io/openshift-release-dev/ocp-release",
  platformImagesRegistry: "quay.io/openshift-release-dev/ocp-v4.0-art-dev",
  registryMappings: [],
  ntpServers: [],
  totalClusterNetworkCIDR: "10.128.0.0/14",
  clusterNetworkHostPrefix: 23,
  serviceNetworkCIDR: "172.30.0.0/16",
  httpProxy: "",
  httpsProxy: "",
  noProxy: "",
  sshPublicKeys: [],
  additionalTrustedRootCAs: "",
};

export interface AgentConfig {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
  };
  rendezvousIP: string;
  additionalNTPSources?: string[];
  hosts: Array<{
    hostname: string;
    role?: NodeRole;
    interfaces?: Array<{
      name: string;
      macAddress?: string;
    }>;
    rootDeviceHints?: {
      deviceName?: string;
    };
    networkConfig: {
      "dns-resolver"?: {
        config: {
          server: string[];
          search?: string[];
        };
      };
      "mac-address"?: string;
      routes: {
        config: Array<{
          destination: string;
          "next-hop-address": string;
          "next-hop-interface": string;
          "table-id": number;
        }>;
      };
      interfaces: Array<{
        name: string;
        type: InterfaceType;
        state: InterfaceState;
        mtu?: number;
        ipv4?: {
          enabled: boolean;
          dhcp: boolean;
          address?: Array<{
            address: string;
            "prefix-length": number;
          }>;
        };
        ipv6?: {
          enabled: boolean;
        };

        "link-aggregation"?: {
          mode: string;
          port: string[];
        };
        vlan: {
          "base-iface": string;
          id: number;
        };
        bridge?: {
          port: string[];
          options?: {
            stp?: {
              enabled?: boolean;
              priority?: number;
              "max-age"?: number;
              "hello-time"?: number;
              "forward-delay"?: number;
            };
          };
        };
      }>;
    };


  }>;

}


export interface InstallConfig {
  apiVersion: "v1";
  metadata: {
    name: string;
  }
  baseDomain: string;
  compute?: Array<{
    name: string;
    replicas: number;
  }>;
  controlPlane: {
    name: string;
    replicas: number;
  };
  networking: {
    networkType?: string;
    clusterNetwork?: Array<{
      cidr: string;
      hostPrefix: number;
    }>;
    serviceNetwork: string[];
    machineNetwork?: Array<{
      cidr: string;
    }>;
  };
  platform: {
    none?: {};
    baremetal?: {
      apiVIPs: string[];
      ingressVIPs: string[];
    };
    vsphere?: {
      apiVIPs: string[];
      ingressVIPs: string[];
      vCenter: {
        host: string;
        username: string;
        password: string;
        datacenters: string[];
        defaultDatastore: string;
        cluster?: string;
      };
    };
  };
  pullSecret?: string;
  sshKey?: string;
  fips: boolean;
  proxy?: {
    httpProxy?: string;
    httpsProxy?: string;
    noProxy?: string;
  };
  additionalTrustBundle?: string;
  additionalTrustBundlePolicy?: string;
  imageContentSources?: Array<{
    source: string;
    mirrors: string[];
  }>;
}