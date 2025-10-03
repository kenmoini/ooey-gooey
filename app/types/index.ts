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
  ntpServers: string[];
  totalClusterNetworkCIDR: string;
  clusterNetworkHostPrefix: number;
  httpProxy: string;
  httpsProxy: string;
  noProxy: string;
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
  ntpServers: [],
  totalClusterNetworkCIDR: "10.128.0.0/14",
  clusterNetworkHostPrefix: 22,
  httpProxy: "",
  httpsProxy: "",
  noProxy: "",
  additionalTrustedRootCAs: "",
};
