"use client";

import { useFormContext } from "@/app/context/FormContext";
import { BondingMode, InterfaceState, InterfaceType } from "@/app/types";
import { useState } from "react";

export default function HostNetworkingStep() {
  const { formData, updateFormData } = useFormContext();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [expandedInterfaces, setExpandedInterfaces] = useState<Set<string>>(new Set());
  const [showAddInterfaceMenu, setShowAddInterfaceMenu] = useState<{ [nodeId: string]: boolean }>({});
  const [bondPortInput, setBondPortInput] = useState<{ [interfaceId: string]: string }>({});
  const [showBondPortSuggestions, setShowBondPortSuggestions] = useState<{ [interfaceId: string]: boolean }>({});
  const [bridgePortInput, setBridgePortInput] = useState<{ [interfaceId: string]: string }>({});
  const [showBridgePortSuggestions, setShowBridgePortSuggestions] = useState<{ [interfaceId: string]: boolean }>({});
  const [interfaceToRemove, setInterfaceToRemove] = useState<{ nodeId: string; interfaceId: string; interfaceName: string } | null>(null);
  const [showCopyDropdown, setShowCopyDropdown] = useState<{ [interfaceId: string]: boolean }>({});

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const toggleInterface = (interfaceId: string) => {
    const newExpanded = new Set(expandedInterfaces);
    if (newExpanded.has(interfaceId)) {
      newExpanded.delete(interfaceId);
    } else {
      newExpanded.add(interfaceId);
    }
    setExpandedInterfaces(newExpanded);
  };

  const updateInterface = (
    nodeId: string,
    interfaceId: string,
    field: "state" | "type" | "enableIPv4" | "enableIPv4DHCP" | "ipv4Address" | "gatewayIPv4" | "enableIPv6" | "mtu" | "bondPorts" | "bondingMode" | "bridgePorts" | "vlanBaseInterface" | "vlanId",
    value: InterfaceState | InterfaceType | BondingMode | boolean | number | string | string[]
  ) => {
    const updatedNodes = formData.nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          interfaces: node.interfaces?.map((iface) => {
            if (iface.id === interfaceId) {
              const updatedIface = { ...iface, [field]: value };

              // Auto-update VLAN interface name when base interface or VLAN ID changes
              if (updatedIface.type === "VLAN") {
                const baseInterface = field === "vlanBaseInterface" ? value as string : updatedIface.vlanBaseInterface;
                const vlanId = field === "vlanId" ? value as number : updatedIface.vlanId;

                if (baseInterface && vlanId) {
                  updatedIface.deviceName = `${baseInterface}.${vlanId}`;
                }
              }

              return updatedIface;
            }
            return iface;
          }),
        };
      }
      return node;
    });

    updateFormData({ nodes: updatedNodes });
  };

  const addInterface = (nodeId: string, type: InterfaceType) => {
    const typePrefix = type.toLowerCase();
    const existingCount = formData.nodes
      .find((n) => n.id === nodeId)
      ?.interfaces?.filter((i) => i.deviceName.startsWith(typePrefix))
      .length || 0;

    const newInterface = {
      id: Date.now().toString(),
      deviceName: `${typePrefix}${existingCount}`,
      macAddress: "",
      type,
      state: "Up" as InterfaceState,
      mtu: 1500,
    };

    const updatedNodes = formData.nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          interfaces: [...(node.interfaces || []), newInterface],
        };
      }
      return node;
    });

    updateFormData({ nodes: updatedNodes });
    setShowAddInterfaceMenu({ ...showAddInterfaceMenu, [nodeId]: false });
  };

  const confirmRemoveInterface = () => {
    if (interfaceToRemove) {
      const updatedNodes = formData.nodes.map((node) => {
        if (node.id === interfaceToRemove.nodeId) {
          return {
            ...node,
            interfaces: node.interfaces?.filter((iface) => iface.id !== interfaceToRemove.interfaceId),
          };
        }
        return node;
      });

      updateFormData({ nodes: updatedNodes });
      setExpandedInterfaces((prev) => {
        const newExpanded = new Set(prev);
        newExpanded.delete(interfaceToRemove.interfaceId);
        return newExpanded;
      });
      setInterfaceToRemove(null);
    }
  };

  const cancelRemoveInterface = () => {
    setInterfaceToRemove(null);
  };

  const toggleDefaultRoute = (nodeId: string, interfaceId: string) => {
    const updatedNodes = formData.nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          interfaces: node.interfaces?.map((iface) => ({
            ...iface,
            defaultRoute: iface.id === interfaceId ? !iface.defaultRoute : false,
          })),
        };
      }
      return node;
    });
    updateFormData({ nodes: updatedNodes });
  };

  const getEligibleNodesForCopy = (sourceNodeId: string, iface: any) => {
    return formData.nodes.filter((node) => {
      // Don't include the source node
      if (node.id === sourceNodeId) return false;

      // Exclude nodes that already have an interface with the same name
      if (node.interfaces?.some(i => i.deviceName === iface.deviceName)) return false;

      // For VLAN interfaces, check if target node has matching base interface
      if (iface.type === "VLAN") {
        if (!iface.vlanBaseInterface) return false;
        return node.interfaces?.some(i => i.deviceName === iface.vlanBaseInterface);
      }

      // For Bond interfaces, check if target node has all required ports
      if (iface.type === "Bond") {
        if (!iface.bondPorts || iface.bondPorts.length === 0) return false;
        return iface.bondPorts.every((portName: string) =>
          node.interfaces?.some(i => i.deviceName === portName)
        );
      }

      // For Bridge interfaces, check if target node has all required ports
      if (iface.type === "Bridge") {
        if (!iface.bridgePorts || iface.bridgePorts.length === 0) return false;
        return iface.bridgePorts.every((portName: string) =>
          node.interfaces?.some(i => i.deviceName === portName)
        );
      }

      return false;
    });
  };

  const copyInterfaceToNode = (sourceNodeId: string, interfaceId: string, targetNodeId: string) => {
    const sourceNode = formData.nodes.find(n => n.id === sourceNodeId);
    const sourceInterface = sourceNode?.interfaces?.find(i => i.id === interfaceId);
    const targetNode = formData.nodes.find(n => n.id === targetNodeId);

    if (!sourceInterface || !targetNode) return;

    // Create a copy of the interface with a new ID and without the IPv4 address
    const newInterface = {
      ...sourceInterface,
      id: Date.now().toString(),
    };

    // For VLAN interfaces, map the base interface to the matching named interface on the target host
    if (sourceInterface.type === "VLAN" && sourceInterface.vlanBaseInterface) {
      const matchingBaseInterface = targetNode.interfaces?.find(
        i => i.deviceName === sourceInterface.vlanBaseInterface
      );
      if (matchingBaseInterface) {
        newInterface.vlanBaseInterface = matchingBaseInterface.deviceName;
      }
    }

    // For Bond interfaces, map the ports to the matching named interfaces on the target host
    if (sourceInterface.type === "Bond" && sourceInterface.bondPorts) {
      newInterface.bondPorts = sourceInterface.bondPorts
        .map(portName => {
          const matchingPort = targetNode.interfaces?.find(i => i.deviceName === portName);
          return matchingPort ? matchingPort.deviceName : null;
        })
        .filter((port): port is string => port !== null);
    }

    // For Bridge interfaces, map the ports to the matching named interfaces on the target host
    if (sourceInterface.type === "Bridge" && sourceInterface.bridgePorts) {
      newInterface.bridgePorts = sourceInterface.bridgePorts
        .map(portName => {
          const matchingPort = targetNode.interfaces?.find(i => i.deviceName === portName);
          return matchingPort ? matchingPort.deviceName : null;
        })
        .filter((port): port is string => port !== null);
    }

    const updatedNodes = formData.nodes.map((node) => {
      if (node.id === targetNodeId) {
        return {
          ...node,
          interfaces: [...(node.interfaces || []), newInterface],
        };
      }
      return node;
    });

    updateFormData({ nodes: updatedNodes });
    setShowCopyDropdown({ ...showCopyDropdown, [interfaceId]: false });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Host Networking</h2>

      {formData.nodes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No nodes configured. Please add nodes in the Nodes page.
        </div>
      ) : (
        <div className="space-y-3">
          {formData.nodes.map((node) => {
            const isNodeExpanded = expandedNodes.has(node.id);
            return (
              <div key={node.id} className="border border-gray-300 rounded-md">
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => toggleNode(node.id)}
                    className="flex-1 flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-lg">{node.name}</span>
                      {node.role && (
                        <>
                          {node.role === "Control Plane" && (
                          <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded">
                            {node.role}
                          </span>
                        )}
                        {node.role === "Application" && (
                          <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded">
                            {node.role}
                          </span>
                          
                        )}
                        </>
                      )}
                      {node.interfaces && node.interfaces.length > 0 && (
                        <span className="text-sm text-gray-500">
                          ({node.interfaces.length} interface{node.interfaces.length !== 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                    <svg
                      className={`w-6 h-6 transition-transform ${isNodeExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {node.interfaces && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddInterfaceMenu({ ...showAddInterfaceMenu, [node.id]: !showAddInterfaceMenu[node.id] });
                      }}
                      className="px-4 py-4 text-green-600 hover:bg-green-50 hover:text-green-700"
                      title="Add interface"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    {showAddInterfaceMenu[node.id] && (
                      <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-20">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b">
                          Add interface:
                        </div>
                        <button
                          type="button"
                          onClick={() => addInterface(node.id, "Bond")}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Bond
                        </button>
                        <button
                          type="button"
                          onClick={() => addInterface(node.id, "VLAN")}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          VLAN
                        </button>
                        <button
                          type="button"
                          onClick={() => addInterface(node.id, "Bridge")}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Bridge
                        </button>
                      </div>
                    )}
                  </div>
                  )}
                </div>

                {isNodeExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-300 bg-gray-50">

                    {!node.interfaces || node.interfaces.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        No interfaces configured for this node. Please add interfaces in the Host Configuration page.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {node.interfaces.map((iface) => {
                          const isInterfaceExpanded = expandedInterfaces.has(iface.id);

                          // Check if this ethernet interface is used as a base interface for VLAN or as a port in Bond/Bridge
                          const isUsedAsBaseOrPort = (!iface.type || iface.type === "Ethernet") && node.interfaces?.some(
                            otherIface =>
                              (otherIface.type === "VLAN" && otherIface.vlanBaseInterface === iface.deviceName) ||
                              (otherIface.type === "Bond" && otherIface.bondPorts?.includes(iface.deviceName)) ||
                              (otherIface.type === "Bridge" && otherIface.bridgePorts?.includes(iface.deviceName))
                          );

                          return (
                            <div key={iface.id} className="border border-gray-200 rounded-md bg-white">
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  onClick={() => toggleInterface(iface.id)}
                                  className="flex-1 flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
                                >
                                  <div className="flex items-center gap-4">
                                    <div>
                                      <span className="font-mono font-semibold">{iface.deviceName}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {iface.macAddress}
                                    </div>
                                    <div>
                                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                        {iface.type || "Ethernet"}
                                      </span>
                                    </div>
                                    {!isUsedAsBaseOrPort && (
                                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        <input
                                          type="radio"
                                          id={`default-route-${node.id}-${iface.id}`}
                                          checked={iface.defaultRoute ?? false}
                                          onChange={() => toggleDefaultRoute(node.id, iface.id)}
                                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <label htmlFor={`default-route-${node.id}-${iface.id}`} className="text-sm text-gray-700">
                                          Default Route
                                        </label>
                                      </div>
                                    )}
                                  </div>
                                  <svg
                                    className={`w-5 h-5 transition-transform ${isInterfaceExpanded ? "rotate-180" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                                {(!iface.type || iface.type !== "Ethernet") && (
                                  <div className="flex items-center">
                                    <div className="relative">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setShowCopyDropdown({ ...showCopyDropdown, [iface.id]: !showCopyDropdown[iface.id] });
                                        }}
                                        className="px-4 py-3 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                        title="Copy interface to another host"
                                      >
                                        <svg
                                          className="w-5 h-5"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                      </button>
                                      {showCopyDropdown[iface.id] && (
                                        <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-20">
                                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b">
                                            Copy to host:
                                          </div>
                                          {getEligibleNodesForCopy(node.id, iface).length === 0 ? (
                                            <div className="px-4 py-3 text-sm text-gray-500">
                                              No eligible hosts found
                                            </div>
                                          ) : (
                                            getEligibleNodesForCopy(node.id, iface).map((targetNode) => (
                                              <button
                                                key={targetNode.id}
                                                type="button"
                                                onClick={() => copyInterfaceToNode(node.id, iface.id, targetNode.id)}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                              >
                                                <div className="font-medium text-sm">{targetNode.name}</div>
                                                {targetNode.role && (
                                                  <div className="text-xs text-gray-500">{targetNode.role}</div>
                                                )}
                                              </button>
                                            ))
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setInterfaceToRemove({ nodeId: node.id, interfaceId: iface.id, interfaceName: iface.deviceName })}
                                      className="px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                                      title="Remove interface"
                                    >
                                      <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>

                              {isInterfaceExpanded && (
                                <div className="px-4 pb-4 pt-2 border-t border-gray-200">
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium mb-1">
                                        State
                                      </label>
                                      <select
                                        value={iface.state || "Up"}
                                        onChange={(e) =>
                                          updateInterface(node.id, iface.id, "state", e.target.value as InterfaceState)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      >
                                        <option value="Up">Up</option>
                                        <option value="Down">Down</option>
                                      </select>
                                    </div>

                                    {(iface.state !== "Down") && (
                                      <>

                                        {(iface.type === "Bond") && (
                                          <>

                                            <div>
                                              <label className="block text-sm font-medium mb-1">
                                                Bonding Mode
                                              </label>
                                              <select
                                                value={iface.bondingMode || "Active/Backup"}
                                                onChange={(e) =>
                                                  updateInterface(node.id, iface.id, "bondingMode", e.target.value as BondingMode)
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                              >
                                                <option value="Active/Backup">Active/Backup</option>
                                                <option value="LACP">LACP</option>
                                              </select>
                                            </div>
                                            <div className="relative">
                                              <label className="block text-sm font-medium mb-1">
                                                Ports
                                              </label>
                                              <div className="mb-2">
                                                {iface.bondPorts && iface.bondPorts.length > 0 && (
                                                  <div className="flex flex-wrap gap-2 mb-2">
                                                    {iface.bondPorts.map((port) => (
                                                      <span
                                                        key={port}
                                                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                                                      >
                                                        {port}
                                                        <button
                                                          type="button"
                                                          onClick={() => {
                                                            const newPorts = iface.bondPorts?.filter(p => p !== port) || [];
                                                            updateInterface(node.id, iface.id, "bondPorts", newPorts);
                                                          }}
                                                          className="hover:bg-blue-200 rounded"
                                                        >
                                                          ×
                                                        </button>
                                                      </span>
                                                    ))}
                                                  </div>
                                                )}
                                                <input
                                                  type="text"
                                                  value={bondPortInput[iface.id] || ""}
                                                  onChange={(e) => setBondPortInput({ ...bondPortInput, [iface.id]: e.target.value })}
                                                  onFocus={() => setShowBondPortSuggestions({ ...showBondPortSuggestions, [iface.id]: true })}
                                                  onBlur={() => {
                                                    setTimeout(() => {
                                                      setShowBondPortSuggestions({ ...showBondPortSuggestions, [iface.id]: false });
                                                    }, 200);
                                                  }}
                                                  placeholder="Type to search and add ports..."
                                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                              </div>
                                              {showBondPortSuggestions[iface.id] && (
                                                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                  {node.interfaces
                                                    ?.filter(i => !i.type || i.type === "Ethernet")
                                                    .filter(ethernetIface => {
                                                      const searchTerm = (bondPortInput[iface.id] || "").toLowerCase();
                                                      const deviceMatch = ethernetIface.deviceName.toLowerCase().includes(searchTerm);
                                                      const notAlreadySelected = !(iface.bondPorts || []).includes(ethernetIface.deviceName);

                                                      // Exclude if used in other Bond interfaces
                                                      const usedInOtherBond = node.interfaces?.some(
                                                        otherIface => otherIface.id !== iface.id && otherIface.type === "Bond" && otherIface.bondPorts?.includes(ethernetIface.deviceName)
                                                      );
                                                      if (ethernetIface.macAddress) {
                                                        const macMatch = ethernetIface.macAddress.toLowerCase().includes(searchTerm);
                                                        return (deviceMatch || macMatch) && notAlreadySelected && !usedInOtherBond;
                                                      }

                                                      return (deviceMatch) && notAlreadySelected && !usedInOtherBond;
                                                    })
                                                    .map(ethernetIface => (
                                                      <button
                                                        key={ethernetIface.id}
                                                        type="button"
                                                        onClick={() => {
                                                          const newPorts = [...(iface.bondPorts || []), ethernetIface.deviceName];
                                                          updateInterface(node.id, iface.id, "bondPorts", newPorts);
                                                          setBondPortInput({ ...bondPortInput, [iface.id]: "" });
                                                        }}
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                                      >
                                                        <div className="font-mono text-sm">{ethernetIface.deviceName}</div>
                                                        <div className="text-xs text-gray-500">{ethernetIface.macAddress}</div>
                                                      </button>
                                                    ))}
                                                  {node.interfaces
                                                    ?.filter(i => !i.type || i.type === "Ethernet")
                                                    .filter(ethernetIface => {
                                                      const searchTerm = (bondPortInput[iface.id] || "").toLowerCase();
                                                      const deviceMatch = ethernetIface.deviceName.toLowerCase().includes(searchTerm);
                                                      const notAlreadySelected = !(iface.bondPorts || []).includes(ethernetIface.deviceName);

                                                      // Exclude if used in other Bond interfaces
                                                      const usedInOtherBond = node.interfaces?.some(
                                                        otherIface => otherIface.id !== iface.id && otherIface.type === "Bond" && otherIface.bondPorts?.includes(ethernetIface.deviceName)
                                                      );

                                                      if (ethernetIface.macAddress) {
                                                        const macMatch = ethernetIface.macAddress.toLowerCase().includes(searchTerm);
                                                        return (deviceMatch || macMatch) && notAlreadySelected && !usedInOtherBond;
                                                      }
                                                      return (deviceMatch) && notAlreadySelected && !usedInOtherBond;
                                                    }).length === 0 && (
                                                    <div className="px-4 py-2 text-sm text-gray-500">
                                                      No matching interfaces found
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          </>
                                        )}

                                        {(iface.type === "Bridge") && (
                                          <>
                                            <div className="relative">
                                              <label className="block text-sm font-medium mb-1">
                                                Ports
                                              </label>
                                              <div className="mb-2">
                                                {iface.bridgePorts && iface.bridgePorts.length > 0 && (
                                                  <div className="flex flex-wrap gap-2 mb-2">
                                                    {iface.bridgePorts.map((port) => (
                                                      <span
                                                        key={port}
                                                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                                                      >
                                                        {port}
                                                        <button
                                                          type="button"
                                                          onClick={() => {
                                                            const newPorts = iface.bridgePorts?.filter(p => p !== port) || [];
                                                            updateInterface(node.id, iface.id, "bridgePorts", newPorts);
                                                          }}
                                                          className="hover:bg-blue-200 rounded"
                                                        >
                                                          ×
                                                        </button>
                                                      </span>
                                                    ))}
                                                  </div>
                                                )}
                                                <input
                                                  type="text"
                                                  value={bridgePortInput[iface.id] || ""}
                                                  onChange={(e) => setBridgePortInput({ ...bridgePortInput, [iface.id]: e.target.value })}
                                                  onFocus={() => setShowBridgePortSuggestions({ ...showBridgePortSuggestions, [iface.id]: true })}
                                                  onBlur={() => {
                                                    setTimeout(() => {
                                                      setShowBridgePortSuggestions({ ...showBridgePortSuggestions, [iface.id]: false });
                                                    }, 200);
                                                  }}
                                                  placeholder="Type to search and add ports..."
                                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                              </div>
                                              {showBridgePortSuggestions[iface.id] && (
                                                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                  {node.interfaces
                                                    ?.filter(i => !i.type || i.type === "Ethernet" || i.type === "Bond" || i.type === "VLAN")
                                                    .filter(candidateIface => {
                                                      const searchTerm = (bridgePortInput[iface.id] || "").toLowerCase();
                                                      const deviceMatch = candidateIface.deviceName.toLowerCase().includes(searchTerm);
                                                      const notAlreadySelected = !(iface.bridgePorts || []).includes(candidateIface.deviceName);

                                                      // For Ethernet: exclude if used in other Bonds or Bridges
                                                      // For Bond: exclude only if used in other Bridges
                                                      const usedInOtherInterface = node.interfaces?.some(
                                                        otherIface => otherIface.id !== iface.id && (
                                                          ((!candidateIface.type || candidateIface.type === "Ethernet") && otherIface.bondPorts?.includes(candidateIface.deviceName)) ||
                                                          otherIface.bridgePorts?.includes(candidateIface.deviceName)
                                                        )
                                                      );
                                                      if (candidateIface.macAddress) {
                                                        const macMatch = candidateIface.macAddress.toLowerCase().includes(searchTerm);
                                                        return (deviceMatch || macMatch) && notAlreadySelected && !usedInOtherInterface;
                                                      }
                                                      return (deviceMatch) && notAlreadySelected && !usedInOtherInterface;
                                                    })
                                                    .map(candidateIface => (
                                                      <button
                                                        key={candidateIface.id}
                                                        type="button"
                                                        onClick={() => {
                                                          const newPorts = [...(iface.bridgePorts || []), candidateIface.deviceName];
                                                          updateInterface(node.id, iface.id, "bridgePorts", newPorts);
                                                          setBridgePortInput({ ...bridgePortInput, [iface.id]: "" });
                                                        }}
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                                      >
                                                        <div className="font-mono text-sm">
                                                          {candidateIface.deviceName}
                                                          {candidateIface.type === "Bond" && (
                                                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">Bond</span>
                                                          )}
                                                          {candidateIface.type === "VLAN" && (
                                                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">VLAN</span>
                                                          )}
                                                        </div>
                                                        <div className="text-xs text-gray-500">{candidateIface.macAddress}</div>
                                                      </button>
                                                    ))}
                                                  {node.interfaces
                                                    ?.filter(i => !i.type || i.type === "Ethernet" || i.type === "Bond" || i.type === "VLAN")
                                                    .filter(candidateIface => {
                                                      const searchTerm = (bridgePortInput[iface.id] || "").toLowerCase();
                                                      const deviceMatch = candidateIface.deviceName.toLowerCase().includes(searchTerm);
                                                      const notAlreadySelected = !(iface.bridgePorts || []).includes(candidateIface.deviceName);

                                                      // For Ethernet: exclude if used in other Bonds or Bridges
                                                      // For Bond: exclude only if used in other Bridges
                                                      const usedInOtherInterface = node.interfaces?.some(
                                                        otherIface => otherIface.id !== iface.id && (
                                                          ((!candidateIface.type || candidateIface.type === "Ethernet") && otherIface.bondPorts?.includes(candidateIface.deviceName)) ||
                                                          otherIface.bridgePorts?.includes(candidateIface.deviceName)
                                                        )
                                                      );
                                                      if (candidateIface.macAddress) {
                                                        const macMatch = candidateIface.macAddress.toLowerCase().includes(searchTerm);
                                                        return (deviceMatch || macMatch) && notAlreadySelected && !usedInOtherInterface;
                                                      }
                                                      return (deviceMatch) && notAlreadySelected && !usedInOtherInterface;
                                                    }).length === 0 && (
                                                    <div className="px-4 py-2 text-sm text-gray-500">
                                                      No matching interfaces found
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          </>
                                        )}

                                    {(iface.type === "VLAN") && (
                                      <>
                                        <div>
                                          <label className="block text-sm font-medium mb-1">
                                            Base Interface
                                          </label>
                                          <select
                                            value={iface.vlanBaseInterface || ""}
                                            onChange={(e) =>
                                              updateInterface(node.id, iface.id, "vlanBaseInterface", e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          >
                                            <option value="">Select a base interface...</option>
                                            {node.interfaces
                                              ?.filter(i => {
                                                // Exclude the current VLAN interface itself
                                                if (i.id === iface.id) return false;
                                                // Exclude other VLAN interfaces
                                                if (i.type === "VLAN") return false;
                                                // Exclude interfaces that are used as bond or bridge ports
                                                const usedAsPort = node.interfaces?.some(
                                                  otherIface => (otherIface.type === "Bond" && otherIface.bondPorts?.includes(i.deviceName))
                                                );
                                                return !usedAsPort;
                                              })
                                              .map(baseIface => (
                                                <option key={baseIface.id} value={baseIface.deviceName}>
                                                  {baseIface.deviceName} ({baseIface.type || "Ethernet"})
                                                </option>
                                              ))}
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium mb-1">
                                            VLAN ID
                                          </label>
                                          <input
                                            type="number"
                                            value={iface.vlanId ?? ""}
                                            onChange={(e) =>
                                              updateInterface(node.id, iface.id, "vlanId", parseInt(e.target.value))
                                            }
                                            min="1"
                                            max="4094"
                                            placeholder="e.g., 100"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                        </div>
                                      </>
                                    )}
                                        <div>
                                          <label className="block text-sm font-medium mb-1">
                                            MTU
                                          </label>
                                          <input
                                            type="number"
                                            value={iface.mtu ?? 1500}
                                            onChange={(e) =>
                                              updateInterface(node.id, iface.id, "mtu", parseInt(e.target.value))
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                        </div>

                                    <div className="space-y-3">
                                      <div className="flex items-center">
                                        <input
                                          type="checkbox"
                                          id={`ipv4-${iface.id}`}
                                          checked={iface.enableIPv4 ?? false}
                                          onChange={(e) =>
                                            updateInterface(node.id, iface.id, "enableIPv4", e.target.checked)
                                          }
                                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <label htmlFor={`ipv4-${iface.id}`} className="ml-2 text-sm font-medium">
                                          Enable IPv4
                                        </label>
                                      </div>

                                      {iface.enableIPv4 && (
                                        <div className="ml-6 space-y-3">
                                          <div className="flex items-center">
                                            <input
                                              type="checkbox"
                                              id={`ipv4-dhcp-${iface.id}`}
                                              checked={iface.enableIPv4DHCP ?? true}
                                              onChange={(e) =>
                                                updateInterface(node.id, iface.id, "enableIPv4DHCP", e.target.checked)
                                              }
                                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                            <label htmlFor={`ipv4-dhcp-${iface.id}`} className="ml-2 text-sm font-medium">
                                              Enable IPv4 DHCP
                                            </label>
                                          </div>

                                          {!iface.enableIPv4DHCP && iface.enableIPv4DHCP !== undefined && (
                                            <>
                                            <div>
                                              <label className="block text-sm font-medium mb-1">
                                                IP Address
                                              </label>
                                              <input
                                                type="text"
                                                value={iface.ipv4Address || ""}
                                                onChange={(e) =>
                                                  updateInterface(node.id, iface.id, "ipv4Address", e.target.value)
                                                }
                                                placeholder="e.g., 192.168.1.100/24"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                              />
                                            </div>

                                            <div>
                                              <label className="block text-sm font-medium mb-1">
                                                Gateway
                                              </label>
                                              <input
                                                type="text"
                                                value={iface.gatewayIPv4 || ""}
                                                onChange={(e) =>
                                                  updateInterface(node.id, iface.id, "gatewayIPv4", e.target.value)
                                                }
                                                placeholder="e.g., 192.168.1.1"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                              />
                                            </div>

                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center">
                                      <input
                                        type="checkbox"
                                        id={`ipv6-${iface.id}`}
                                        checked={iface.enableIPv6 ?? false}
                                        onChange={(e) =>
                                          updateInterface(node.id, iface.id, "enableIPv6", e.target.checked)
                                        }
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                      />
                                      <label htmlFor={`ipv6-${iface.id}`} className="ml-2 text-sm font-medium">
                                        Enable IPv6
                                      </label>
                                    </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {interfaceToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ marginTop: 0, marginBottom: 0 }}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Remove Interface</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove interface <span className="font-semibold">{interfaceToRemove.interfaceName}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelRemoveInterface}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveInterface}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
