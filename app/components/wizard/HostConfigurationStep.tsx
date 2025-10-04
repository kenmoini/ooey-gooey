"use client";

import { useFormContext } from "@/app/context/FormContext";
import { NetworkInterface } from "@/app/types";
import { useState } from "react";

export default function HostConfigurationStep() {
  const { formData, updateFormData } = useFormContext();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [deviceNames, setDeviceNames] = useState<{ [nodeId: string]: string }>({});
  const [macAddresses, setMacAddresses] = useState<{ [nodeId: string]: string }>({});
  const [errors, setErrors] = useState<{ [nodeId: string]: string }>({});
  const [interfaceToRemove, setInterfaceToRemove] = useState<{ nodeId: string; interfaceId: string; interfaceName: string } | null>(null);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const addInterface = (nodeId: string) => {
    const deviceName = deviceNames[nodeId]?.trim();
    const macAddress = macAddresses[nodeId]?.trim();
    const type = "Ethernet";

    if (deviceName && macAddress) {
      // Check if interface name already exists for this node
      const node = formData.nodes.find(n => n.id === nodeId);
      const isDuplicate = node?.interfaces?.some(
        iface => iface.deviceName.toLowerCase() === deviceName.toLowerCase()
      );

      if (isDuplicate) {
        setErrors({ ...errors, [nodeId]: `Interface "${deviceName}" already exists for this host.` });
        return;
      }

      const newInterface: NetworkInterface = {
        id: Date.now().toString(),
        deviceName,
        macAddress,
        type: type,
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
      setDeviceNames({ ...deviceNames, [nodeId]: "" });
      setMacAddresses({ ...macAddresses, [nodeId]: "" });
      setErrors({ ...errors, [nodeId]: "" });
    }
  };

  const confirmRemoveInterface = () => {
    if (interfaceToRemove) {
      const updatedNodes = formData.nodes.map((node) => {
        if (node.id === interfaceToRemove.nodeId) {
          return {
            ...node,
            interfaces: node.interfaces?.filter((iface) => iface.id !== interfaceToRemove.interfaceId) || [],
          };
        }
        return node;
      });

      updateFormData({ nodes: updatedNodes });
      setInterfaceToRemove(null);
    }
  };

  const cancelRemoveInterface = () => {
    setInterfaceToRemove(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Host Configuration</h2>

      {formData.nodes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No nodes configured. Please add nodes in the Nodes page.
        </div>
      ) : (
        <div className="space-y-3">
          {formData.nodes.map((node) => {
            const isExpanded = expandedNodes.has(node.id);
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
                  </div>
                  <svg
                    className={`w-6 h-6 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-300 bg-gray-50">
                    <div className="space-y-4">
                      <div className="grid grid-cols-9 gap-2 pt-4">
                      <div className="grid grid-cols-2 col-span-4 gap-2 pt-4">
                        <div className="col-span-1">
                          <label htmlFor={`auto-install-${node.id}`} className="block text-sm font-medium mb-2">
                            Installation Device
                          </label>
                        </div>
                        <div className="col-span-1 text-right items-right align-right space-y-2">
                          <div className="flex justify-end items-right gap-2">
                            <input
                              type="checkbox"
                              id={`auto-install-${node.id}`}
                              checked={node.installationDeviceAuto ?? true}
                              onChange={(e) => {
                                const updatedNodes = formData.nodes.map((n) => {
                                  if (n.id === node.id) {
                                    return {
                                      ...n,
                                      installationDeviceAuto: e.target.checked,
                                      installationDevicePath: e.target.checked ? undefined : n.installationDevicePath,
                                    };
                                  }
                                  return n;
                                });
                                updateFormData({ nodes: updatedNodes });
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`auto-install-${node.id}`} className="text-sm ml-2">
                              Auto
                            </label>
                          </div>
                        </div>
                      </div>
                          <div className="col-span-4 col-start-6">
                          {!(node.installationDeviceAuto ?? true) && (
                            <input
                              type="text"
                              value={node.installationDevicePath || ""}
                              onChange={(e) => {
                                const updatedNodes = formData.nodes.map((n) => {
                                  if (n.id === node.id) {
                                    return {
                                      ...n,
                                      installationDevicePath: e.target.value,
                                    };
                                  }
                                  return n;
                                });
                                updateFormData({ nodes: updatedNodes });
                              }}
                              className="px-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Installation device path (e.g., /dev/sda)"
                            />
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Network Interfaces
                        </label>
                        <div className="space-y-2">
                          <div className="grid grid-cols-9 gap-2">
                            <input
                              type="text"
                              value={deviceNames[node.id] || ""}
                              onChange={(e) =>
                                setDeviceNames({ ...deviceNames, [node.id]: e.target.value })
                              }
                              className="px-4 py-2 col-span-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Device Name (e.g., eth0)"
                            />
                            <input
                              type="text"
                              value={macAddresses[node.id] || ""}
                              onChange={(e) =>
                                setMacAddresses({ ...macAddresses, [node.id]: e.target.value })
                              }
                              className="px-4 py-2 col-span-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="MAC Address (e.g., 00:1A:2B:3C:4D:5E)"
                            />
                          <button
                            onClick={() => addInterface(node.id)}
                            className="col-span-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                            Add Interface
                          </button>
                            </div>
                          {errors[node.id] && (
                            <div className="mt-2 text-sm text-red-600">
                              {errors[node.id]}
                            </div>
                          )}
                        </div>

                        {node.interfaces && node.interfaces.filter(i => !i.type || i.type === "Ethernet").length > 0 && (
                          <div className="mt-4 space-y-2">
                            {node.interfaces.filter(i => !i.type || i.type === "Ethernet").map((iface) => (
                              <div
                                key={iface.id}
                                className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200"
                              >
                                <div className="flex-1 grid grid-cols-2 gap-4">
                                  <div>
                                    <span className="text-xs text-gray-500">Device:</span>
                                    <div className="font-mono text-sm">{iface.deviceName}</div>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">MAC:</span>
                                    <div className="font-mono text-sm">{iface.macAddress}</div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setInterfaceToRemove({ nodeId: node.id, interfaceId: iface.id, interfaceName: iface.deviceName })}
                                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded ml-4"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {interfaceToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ marginTop: 0, marginBottom: 0 }}>
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
