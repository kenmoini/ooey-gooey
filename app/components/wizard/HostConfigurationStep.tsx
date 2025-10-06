"use client";

import { useFormContext } from "@/app/context/FormContext";
import { Node, NodeRole, NetworkInterface } from "@/app/types";
import { useState, useEffect } from "react";

const nodeRoles: NodeRole[] = ["Control Plane", "Application"];

export default function HostConfigurationStep() {
  const { formData, updateFormData } = useFormContext();
  const [nodeName, setNodeName] = useState("");
  const [nodeRole, setNodeRole] = useState<NodeRole>("Control Plane");
  const [nodeToRemove, setNodeToRemove] = useState<Node | null>(null);
  const isMultiHA = formData.clusterType === "Multi HA Cluster";
  const [error, setError] = useState("");

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [deviceNames, setDeviceNames] = useState<{ [nodeId: string]: string }>({});
  const [macAddresses, setMacAddresses] = useState<{ [nodeId: string]: string }>({});
  const [errors, setErrors] = useState<{ [nodeId: string]: string }>({});
  const [interfaceToRemove, setInterfaceToRemove] = useState<{ nodeId: string; interfaceId: string; interfaceName: string } | null>(null);



  const controlPlaneCount = formData.nodes.filter(
    (node) => node.role === "Control Plane"
  ).length;
  const isControlPlaneFull = controlPlaneCount >= 5;

  const getMaxNodes = () => {
    switch (formData.clusterType) {
      case "Single Node":
        return 1;
      case "3-Node":
        return 3;
      case "Multi HA Cluster":
        return Infinity;
      default:
        return Infinity;
    }
  };

  const maxNodes = getMaxNodes();
  const isNodeLimitReached = formData.nodes.length >= maxNodes;

  useEffect(() => {
    if (isControlPlaneFull && nodeRole === "Control Plane") {
      setNodeRole("Application");
    }
  }, [isControlPlaneFull, nodeRole]);

  useEffect(() => {
    // Set default to "Application" after 3 Control Plane nodes
    if (controlPlaneCount >= 3 && nodeRole === "Control Plane" && !isControlPlaneFull) {
      setNodeRole("Application");
    }
  }, [controlPlaneCount]);

  const isNodeNameUnique = (name: string) => {
    return !formData.nodes.some(
      (node) => node.name.toLowerCase() === name.toLowerCase()
    );
  };

  const addNode = () => {
    if (!nodeName.trim()) {
      setError("Node name cannot be empty");
      return;
    }

    if (isNodeLimitReached) {
      setError(`Maximum of ${maxNodes} node${maxNodes === 1 ? '' : 's'} allowed for ${formData.clusterType}`);
      return;
    }

    if (!isNodeNameUnique(nodeName.trim())) {
      setError("Node name already exists");
      return;
    }

    const newNode: Node = {
      id: Date.now().toString(),
      name: nodeName.trim(),
      ...(isMultiHA && { role: nodeRole }),
    };
    updateFormData({ nodes: [...formData.nodes, newNode] });
    setNodeName("");

    // Reset to appropriate default based on Control Plane count after adding this node
    const newControlPlaneCount = nodeRole === "Control Plane" ? controlPlaneCount + 1 : controlPlaneCount;
    setNodeRole(newControlPlaneCount >= 3 ? "Application" : "Control Plane");
    setError("");

    // Expand the newly added node
    setExpandedNodes(new Set(expandedNodes).add(newNode.id));
  };

  const confirmRemoveNode = () => {
    if (nodeToRemove) {
      updateFormData({
        nodes: formData.nodes.filter((node) => node.id !== nodeToRemove.id),
      });
      setNodeToRemove(null);
    }
  };

  const cancelRemoveNode = () => {
    setNodeToRemove(null);
  };

  // ================= Network Interfaces Management =================

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
      <h2 className="text-2xl font-bold">Hosts</h2>
<div className="space-y-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={nodeName}
              onChange={(e) => {
                setNodeName(e.target.value);
                setError("");
              }}
              onKeyPress={(e) => e.key === "Enter" && addNode()}
              disabled={isNodeLimitReached}
              className={`flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              } ${isNodeLimitReached ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder={isNodeLimitReached ? `Maximum ${maxNodes} node${maxNodes === 1 ? '' : 's'} reached` : "Enter node name"}
            />
          {isMultiHA && (
            <select
              value={nodeRole}
              onChange={(e) => setNodeRole(e.target.value as NodeRole)}
              disabled={isNodeLimitReached}
              className={`px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isNodeLimitReached ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            >
              {nodeRoles.map((role) => (
                <option
                  key={role}
                  value={role}
                  disabled={role === "Control Plane" && isControlPlaneFull}
                >
                  {role}
                  {role === "Control Plane" && isControlPlaneFull && " (Max reached)"}
                </option>
              ))}
            </select>
          )}
            <button
              onClick={addNode}
              disabled={isNodeLimitReached}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Node
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

      </div>

      {/* Confirmation Modal */}
      {nodeToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ marginTop: 0, marginBottom: 0 }}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Remove Node</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove node <span className="font-semibold">{nodeToRemove.name}</span>
              {nodeToRemove.role && <span> ({nodeToRemove.role})</span>}?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelRemoveNode}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveNode}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

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
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => toggleNode(node.id)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50"
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
                <div className="flex items-center">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setNodeToRemove(node)}
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
                </div>
                </div>

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
