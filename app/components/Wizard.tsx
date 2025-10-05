"use client";

import { useFormContext } from "@/app/context/FormContext";
import { useState, useEffect, useRef } from "react";
import GeneralStep from "./wizard/GeneralStep";
import HostConfigurationStep from "./wizard/HostConfigurationStep";
import HostNetworkingStep from "./wizard/HostNetworkingStep";
//import NodesStep from "./wizard/NodesStep";
import NetworkingStep from "./wizard/NetworkingStep";
import DisconnectedStep from "./wizard/DisconnectedStep";
import AdvancedStep from "./wizard/AdvancedStep";
import PreviewStep from "./wizard/PreviewStep";
import { Node, NetworkInterface } from "@/app/types";

const steps = [
  { title: "General", component: GeneralStep },
  { title: "Networking", component: NetworkingStep },
  { title: "Hosts", component: HostConfigurationStep },
  { title: "Host Networking", component: HostNetworkingStep },
  { title: "Disconnected", component: DisconnectedStep },
  { title: "Advanced", component: AdvancedStep },
  { title: "Preview", component: PreviewStep },
];

export default function Wizard() {
  const { formData, updateFormData, currentStep, setCurrentStep } = useFormContext();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const keySequence = useRef<string>("");
  const keyTimeout = useRef<NodeJS.Timeout | null>(null);
  const CurrentStepComponent = steps[currentStep].component;

  const activateGodMode = () => {
    console.log("🔥 God Mode Activated!");

    // Create test nodes with interfaces
    const testNodes: Node[] = [
      {
        id: "control-1",
        name: "cp-1",
        role: "Control Plane",
        installationDeviceAuto: true,
        interfaces: [
          {
            id: "iface-1-1",
            deviceName: "eth0",
            macAddress: "00:1A:2B:3C:4D:01",
            type: "Ethernet",
            state: "Up",
            enableIPv4: true,
            enableIPv4DHCP: false,
            ipv4Address: "192.168.1.101/24",
            gatewayIPv4: "192.168.1.1",
            mtu: 1500,
            defaultRoute: true,
          } as NetworkInterface,
        ],
      },
      {
        id: "node-2",
        name: "cp-2",
        role: "Control Plane",
        installationDeviceAuto: true,
        interfaces: [
          {
            id: "iface-2-1",
            deviceName: "eth0",
            macAddress: "00:1A:2B:3C:4D:03",
            type: "Ethernet",
            state: "Up",
            enableIPv4: true,
            enableIPv4DHCP: false,
            ipv4Address: "192.168.1.102/24",
            gatewayIPv4: "192.168.1.1",
            mtu: 1500,
            defaultRoute: true,
          } as NetworkInterface,
        ],
      },
      {
        id: "node-3",
        name: "cp-3",
        role: "Control Plane",
        installationDeviceAuto: true,
        interfaces: [
          {
            id: "iface-3-1",
            deviceName: "eth0",
            macAddress: "00:1A:2B:3C:4D:04",
            type: "Ethernet",
            state: "Up",
            enableIPv4: true,
            enableIPv4DHCP: false,
            ipv4Address: "192.168.1.103/24",
            gatewayIPv4: "192.168.1.1",
            mtu: 1500,
            defaultRoute: true,
          } as NetworkInterface,
        ],
      },
      {
        id: "node-4",
        name: "worker-1",
        role: "Application",
        installationDeviceAuto: false,
        installationDevicePath: "/dev/nvme0n1",
        interfaces: [
          {
            id: "iface-4-1",
            deviceName: "eth0",
            macAddress: "00:1A:2B:3C:4D:05",
            type: "Ethernet",
            state: "Up",
            mtu: 9000,
          } as NetworkInterface,
          {
            id: "iface-4-2",
            deviceName: "eth1",
            macAddress: "00:1A:2B:3C:4D:06",
            type: "Ethernet",
            state: "Up",
            mtu: 9000,
          } as NetworkInterface,
          {
            id: "iface-4-3",
            deviceName: "bond0",
            type: "Bond",
            state: "Up",
            mtu: 9000,
            defaultRoute: false,
            bondPorts: ["eth0", "eth1"],
            bondingMode: "LACP",
          } as NetworkInterface,
          {
            id: "iface-4-4",
            deviceName: "bond0.123",
            type: "VLAN",
            vlanBaseInterface: "bond0",
            vlanId: 123,
            state: "Up",
            mtu: 9000,
            defaultRoute: true,
            enableIPv4: true,
            enableIPv4DHCP: false,
            ipv4Address: "192.168.1.104/24",
            gatewayIPv4: "192.168.1.1",
          } as NetworkInterface,
        ],
      },
      {
        id: "node-5",
        name: "worker-2",
        role: "Application",
        installationDeviceAuto: false,
        installationDevicePath: "/dev/nvme0n1",
        interfaces: [
          {
            id: "iface-5-1",
            deviceName: "eth0",
            macAddress: "00:1A:2B:3C:4D:07",
            type: "Ethernet",
            state: "Up",
            mtu: 9000,
          } as NetworkInterface,
          {
            id: "iface-5-2",
            deviceName: "eth1",
            macAddress: "00:1A:2B:3C:4D:08",
            type: "Ethernet",
            state: "Up",
            mtu: 9000,
          } as NetworkInterface,
          {
            id: "iface-5-3",
            deviceName: "bond0",
            type: "Bond",
            state: "Up",
            mtu: 9000,
            defaultRoute: false,
            bondPorts: ["eth0", "eth1"],
            bondingMode: "LACP",
          } as NetworkInterface,
          {
            id: "iface-5-4",
            deviceName: "bond0.123",
            type: "VLAN",
            vlanBaseInterface: "bond0",
            vlanId: 123,
            state: "Up",
            mtu: 9000,
            defaultRoute: true,
            enableIPv4: true,
            enableIPv4DHCP: false,
            ipv4Address: "192.168.1.105/24",
            gatewayIPv4: "192.168.1.1",
          } as NetworkInterface,
        ],
      },
    ];

    updateFormData({
      clusterName: "my-pretty-cluster",
      clusterDomain: "acme.org",
      clusterType: "Multi HA Cluster",
      platformType: "Bare Metal",
      nodes: testNodes,
      apiVIP: "192.168.1.100",
      ingressVIP: "192.168.1.101",
      dnsServers: ["8.8.8.8", "8.8.4.4"],
      dnsSearchDomains: ["acme.org"],
      ntpServers: ["time.google.com"],
      sshPublicKeys: ["ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC... demo@acme.org"],
    });
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Clear previous timeout
      if (keyTimeout.current) {
        clearTimeout(keyTimeout.current);
      }

      // Add the key to the sequence
      keySequence.current += event.key.toLowerCase();

      // Check if the sequence matches "godmode"
      if (keySequence.current === "godmode") {
        activateGodMode();
        keySequence.current = "";
        return;
      }

      // Reset sequence after 3 seconds
      keyTimeout.current = setTimeout(() => {
        keySequence.current = "";
      }, 3000);
    };

    window.addEventListener("keypress", handleKeyPress);

    return () => {
      window.removeEventListener("keypress", handleKeyPress);
      if (keyTimeout.current) {
        clearTimeout(keyTimeout.current);
      }
    };
  }, [updateFormData]);

  const validateHostNetworking = (): string[] => {
    const errors: string[] = [];
    const ipAddresses = new Set<string>();

    formData.nodes.forEach((node) => {
      node.interfaces?.forEach((iface) => {
        // Check if IPv4 is enabled with DHCP disabled but no IP address
        if (iface.enableIPv4 && iface.enableIPv4DHCP === false && !iface.ipv4Address) {
          errors.push(`${node.name} - ${iface.deviceName}: IPv4 DHCP is disabled but no IP address is defined`);
        }

        // Check for duplicate IP addresses
        if (iface.ipv4Address) {
          if (ipAddresses.has(iface.ipv4Address)) {
            errors.push(`Duplicate IP address ${iface.ipv4Address} found on ${node.name} - ${iface.deviceName}`);
          } else {
            ipAddresses.add(iface.ipv4Address);
          }
        }
      });
    });

    return errors;
  };

  const handleNext = () => {
    // Validate Host Networking step before proceeding
    if (currentStep === 4) { // Host Networking is step index 4
      const errors = validateHostNetworking();
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }
    }

    setValidationErrors([]);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setValidationErrors([]);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClearWizard = () => {
    if (window.confirm("Are you sure you want to clear all wizard data? This cannot be undone.")) {
      updateFormData({
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
      });
      setCurrentStep(0);
      setValidationErrors([]);
    }
  };

  return (
    <div className="max-w-8xl mx-auto p-8">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.title} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index === currentStep
                    ? "border-blue-500 bg-blue-500 text-white"
                    : index < currentStep
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-300 text-gray-500"
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`ml-2 text-sm ${
                  index === currentStep ? "font-semibold" : ""
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    index < currentStep ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <CurrentStepComponent />
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-8">
          <h3 className="text-red-800 font-semibold mb-2">Validation Errors:</h3>
          <ul className="list-disc list-inside text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStep === steps.length - 1 ? "Finish" : "Next"}
        </button>
      </div>

      {/* Clear Wizard Link */}
      <div className="mt-6 text-center">
        <button
          onClick={handleClearWizard}
          className="text-sm text-red-600 hover:text-red-800 hover:underline"
        >
          Clear Wizard
        </button>
      </div>
    </div>
  );
}
