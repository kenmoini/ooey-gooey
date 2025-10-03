import { FormProvider } from "@/app/context/FormContext";
import Wizard from "@/app/components/Wizard";

export default function Home() {
  return (
    <FormProvider>
      <main className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            Cluster Configuration Wizard
          </h1>
          <Wizard />
        </div>
      </main>
    </FormProvider>
  );
}
