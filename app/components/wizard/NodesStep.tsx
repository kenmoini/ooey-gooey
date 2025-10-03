"use client";

import { useFormContext } from "@/app/context/FormContext";
import { Node, NodeRole } from "@/app/types";
import { useState, useEffect } from "react";

const nodeRoles: NodeRole[] = ["Control Plane", "Application"];

export default function NodesStep() {
  const { formData, updateFormData } = useFormContext();
  const [nodeName, setNodeName] = useState("");
  const [nodeRole, setNodeRole] = useState<NodeRole>("Control Plane");
  const [error, setError] = useState("");
  const [nodeToRemove, setNodeToRemove] = useState<Node | null>(null);
  const isMultiHA = formData.clusterType === "Multi HA Cluster";

  const controlPlaneCount = formData.nodes.filter(
    (node) => node.role === "Control Plane"
  ).length;
  const isControlPlaneFull = controlPlaneCount >= 5;

  const getMaxNodes = () => {
    switch (formData.clusterType) {
      case "Single Node":
        return 1;
      case "Compact":
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Nodes Configuration</h2>

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

        {formData.nodes.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Nodes:</h3>
            <ul className="space-y-2">
              {formData.nodes.map((node) => (
                <li
                  key={node.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div>
                    <span className="font-medium">{node.name}</span>
                    {node.role && (
                      <span className="ml-2 text-sm text-gray-600">
                        ({node.role})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setNodeToRemove(node)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {nodeToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
    </div>
  );
}
