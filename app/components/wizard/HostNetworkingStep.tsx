"use client";

import { useFormContext } from "@/app/context/FormContext";
import { InterfaceState, InterfaceType } from "@/app/types";
import { useState } from "react";

export default function HostNetworkingStep() {
  const { formData, updateFormData } = useFormContext();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [expandedInterfaces, setExpandedInterfaces] = useState<Set<string>>(new Set());
  const [showAddInterfaceMenu, setShowAddInterfaceMenu] = useState<{ [nodeId: string]: boolean }>({});

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
    field: "state" | "type" | "enableIPv4" | "enableIPv4DHCP" | "ipv4Address" | "enableIPv6" | "mtu",
    value: InterfaceState | InterfaceType | boolean | number | string
  ) => {
    const updatedNodes = formData.nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          interfaces: node.interfaces?.map((iface) => {
            if (iface.id === interfaceId) {
              return { ...iface, [field]: value };
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
                <button
                  type="button"
                  onClick={() => toggleNode(node.id)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg">{node.name}</span>
                    {node.role && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {node.role}
                      </span>
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

                {isNodeExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-300 bg-gray-50">
                    <div className="mb-4 relative">
                      <button
                        type="button"
                        onClick={() => setShowAddInterfaceMenu({ ...showAddInterfaceMenu, [node.id]: !showAddInterfaceMenu[node.id] })}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        Add Interface ▼
                      </button>
                      {showAddInterfaceMenu[node.id] && (
                        <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
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

                    {!node.interfaces || node.interfaces.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        No interfaces configured for this node. Please add interfaces in the Host Configuration page.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {node.interfaces.map((iface) => {
                          const isInterfaceExpanded = expandedInterfaces.has(iface.id);
                          return (
                            <div key={iface.id} className="border border-gray-200 rounded-md bg-white">
                              <button
                                type="button"
                                onClick={() => toggleInterface(iface.id)}
                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
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
    </div>
  );
}
