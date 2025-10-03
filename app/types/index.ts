export type ClusterType = "Single Node" | "Compact" | "Multi HA Cluster";
export type LoadBalancerType = "Internal" | "External";
export type NodeRole = "Control Plane" | "Application";
export type PlatformType = "Bare Metal" | "vSphere" | "None";

export interface Node {
  id: string;
  name: string;
  role?: NodeRole;
}

export interface FormData {
  clusterName: string;
  clusterDomain: string;
  clusterType: ClusterType;
  platformType: PlatformType;
  nodes: Node[];
  loadBalancerType: LoadBalancerType;
  apiVIP: string;
  ingressVIP: string;
  dnsServers: string[];
  dnsSearchDomains: string[];
  configureDisconnectedRegistries: boolean;
  releaseImageRegistry: string;
  platformImagesRegistry: string;
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
  nodes: [],
  loadBalancerType: "Internal",
  apiVIP: "",
  ingressVIP: "",
  dnsServers: [],
  dnsSearchDomains: [],
  configureDisconnectedRegistries: false,
  releaseImageRegistry: "quay.io/openshift-release-dev/ocp-release",
  platformImagesRegistry: "quay.io/openshift-release-dev/ocp-v4.0-art-dev",
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
