"use client";

import { useFormContext } from "@/app/context/FormContext";
import GeneralStep from "./wizard/GeneralStep";
import ArchitectureStep from "./wizard/ArchitectureStep";
import NodesStep from "./wizard/NodesStep";
import NetworkingStep from "./wizard/NetworkingStep";
import DisconnectedStep from "./wizard/DisconnectedStep";
import AdvancedStep from "./wizard/AdvancedStep";
import PreviewStep from "./wizard/PreviewStep";

const steps = [
  { title: "General", component: GeneralStep },
  { title: "Architecture", component: ArchitectureStep },
  { title: "Nodes", component: NodesStep },
  { title: "Networking", component: NetworkingStep },
  { title: "Disconnected", component: DisconnectedStep },
  { title: "Advanced", component: AdvancedStep },
  { title: "Preview", component: PreviewStep },
];

export default function Wizard() {
  const { currentStep, setCurrentStep } = useFormContext();
  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
    </div>
  );
}
