"use client";

import { useFormContext } from "@/app/context/FormContext";

export default function HostConfigurationStep() {
  const { formData, updateFormData } = useFormContext();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Host Configuration</h2>

      <div className="space-y-4">
      </div>
    </div>
  );
}
