# Cluster Configuration Wizard

A NextJS-based web application for configuring cluster deployments through a multi-step wizard interface. All data processing is handled client-side, with YAML output generated dynamically based on user input.

## Features

- **Multi-step Wizard**: Navigate through 6 configuration pages:
  - General: Cluster Name and Domain
  - Architecture: Cluster Type selection
  - Nodes: Dynamic node management
  - Networking: Load Balancer configuration
  - Advanced: Additional Trusted Root CAs
  - Preview: Summary and YAML output

- **Client-side Processing**: All data is processed in the browser
- **YAML Generation**: Automatically generates YAML configuration based on inputs
- **Modern UI**: Built with NextJS, TypeScript, and Tailwind CSS

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Ark UI (Park UI foundation)
- **YAML Processing**: js-yaml

## Project Structure

```
app/
├── components/
│   ├── wizard/          # Wizard step components
│   └── Wizard.tsx       # Main wizard orchestrator
├── context/
│   └── FormContext.tsx  # Form state management
├── types/
│   └── index.ts         # TypeScript definitions
├── utils/
│   └── generateYaml.ts  # YAML generation logic
└── page.tsx             # Main application page
```

## Building for Production

```bash
npm run build
npm start
```
