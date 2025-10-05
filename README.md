# OpenShift Agent-Based Installer Configuration Wizard

A Next.js-based web application for generating OpenShift Agent-Based Installer (ABI) configuration files through an intuitive multi-step wizard interface. All data processing is handled client-side, with YAML output generated dynamically based on user input.

## Features

- **Multi-step Wizard**: Navigate through 7 comprehensive configuration pages:
  - **General**: Cluster name, domain, type (Single Node/Compact/Multi HA), platform (Bare Metal/vSphere/None), and FIPS mode
  - **Networking**: Load balancer type, API/Ingress VIPs, DNS servers, search domains, and cluster networking (CIDR, host prefix, service network)
  - **Hosts**: Dynamic node management with role assignment (Control Plane/Application) and installation device configuration
  - **Host Networking**: Advanced per-host network configuration including interfaces, bonds, bridges, VLANs, IPv4/IPv6 settings
  - **Disconnected**: Disconnected registry configuration with custom registry mappings and mirror settings
  - **Advanced**: Proxy configuration, NTP servers, SSH public keys, and additional trusted root CAs
  - **Preview**: Interactive summary and YAML output with copy-to-clipboard functionality

- **Comprehensive Configuration**: Generate complete `install-config.yaml` and `agent-config.yaml` files
- **Client-side Processing**: All data is processed in the browser - no data leaves your machine
- **Advanced Networking**: Support for bonding (Active/Backup, LACP), VLANs, bridges, and complex network topologies
- **Modern UI**: Built with Next.js 15, TypeScript, Tailwind CSS, and Ark UI components
- **Development Helper**: Built-in "god mode" (type `godmode` on any page) to populate test data for development

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

- **Framework**: Next.js 15.5.4 with App Router and Turbopack
- **Language**: TypeScript 5
- **Runtime**: React 19
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Ark UI 5.25 (headless component library)
- **YAML Processing**: js-yaml 4.1

## Project Structure

```
app/
├── components/
│   ├── wizard/
│   │   ├── GeneralStep.tsx          # Cluster name, domain, type, platform
│   │   ├── NetworkingStep.tsx       # VIPs, DNS, cluster networking
│   │   ├── HostConfigurationStep.tsx # Node management and roles
│   │   ├── HostNetworkingStep.tsx   # Per-host network configuration
│   │   ├── DisconnectedStep.tsx     # Disconnected registry settings
│   │   ├── AdvancedStep.tsx         # Proxy, NTP, SSH keys, CAs
│   │   └── PreviewStep.tsx          # YAML preview and export
│   └── Wizard.tsx                   # Main wizard orchestrator
├── context/
│   └── FormContext.tsx              # Global form state management
├── types/
│   └── index.ts                     # TypeScript type definitions
├── utils/
│   └── generateYaml.ts              # install-config & agent-config YAML generation
├── page.tsx                         # Main application entry point
└── layout.tsx                       # Root layout with metadata
prompts.md                           # Prompts used with Claude code
```

## Building for Production

### Local Build
```bash
npm run build
```

The static site will be generated in the `out/` directory.

### Static Export

This project uses Next.js static export (`output: 'export'`) which generates a fully static site that can be deployed anywhere:

```bash
npm run export
```

### Deploying to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

#### Setup Steps:

1. **Enable GitHub Pages in your repository:**
   - Go to Settings → Pages
   - Under "Build and deployment"
   - Set Source to "GitHub Actions"

2. **Update basePath in `next.config.ts`:**
   - The current configuration uses `/ooey-gooey/abi-gui` as the base path
   - Update this to match your repository structure

3. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Configure for GitHub Pages deployment"
   git push origin main
   ```

4. **GitHub Actions will automatically:**
   - Build the static site
   - Deploy to GitHub Pages
   - Site will be available at your configured URL

#### Manual Deployment:

You can also trigger deployment manually:
- Go to Actions tab in GitHub
- Select "Deploy to GitHub Pages" workflow
- Click "Run workflow"

#### Local Testing of Production Build:

```bash
npm run build
npx serve out
```

Then open http://localhost:3000 to test the static build locally.

#### Configuration Notes:

- The site is configured with `basePath` and `assetPrefix` in [next.config.ts](next.config.ts) for repository hosting
- For custom domain or root deployment, modify these values in the config
- All processing is client-side with no backend dependencies - perfect for static hosting
- Images are set to `unoptimized: true` for compatibility with static export

## What This Application Generates

This wizard generates two YAML configuration files required for OpenShift Agent-Based Installation:

### 1. install-config.yaml
The main installation configuration file containing:
- Cluster metadata (name, base domain)
- Platform configuration (Bare Metal, vSphere, or None)
- Networking configuration (cluster network CIDR, service network, network type)
- Node replica counts (control plane and worker nodes)
- Optional: Proxy settings, additional trust bundles, disconnected registry mirrors
- Optional: SSH keys and FIPS mode settings

### 2. agent-config.yaml
The agent-specific configuration file containing:
- Rendezvous IP for bootstrap communication
- Per-host configuration including:
  - Hostname and role (master/worker)
  - Network interface definitions (Ethernet, Bond, Bridge, VLAN)
  - Static IP addressing or DHCP configuration
  - DNS and routing configuration
  - MAC address mappings
  - Root device hints for installation
- Optional: Additional NTP sources

## Use Cases

This application is designed for:
- OpenShift 4.x deployments using the Agent-Based Installer method
- Bare metal, vSphere, and platform-agnostic installations
- Disconnected/air-gapped environments with custom registry mirrors
- Complex networking scenarios requiring bonds, VLANs, or bridges
- Single Node OpenShift (SNO), Compact (3-node), and Multi-HA cluster deployments

## Development

### God Mode
For development and testing, type `godmode` (case-sensitive) on any wizard page to populate the form with sample data including:
- 3 control plane nodes
- 2 worker nodes with complex networking (bonded interfaces with VLAN tags)
- Disconnected registry configuration
- Proxy settings
- All advanced options populated

This feature is useful for testing the YAML generation without manually filling out all fields.

### Adding New Features
- Form state is managed in [app/context/FormContext.tsx](app/context/FormContext.tsx)
- Type definitions are in [app/types/index.ts](app/types/index.ts)
- YAML generation logic is in [app/utils/generateYaml.ts](app/utils/generateYaml.ts)
- Individual wizard steps are in [app/components/wizard/](app/components/wizard/)
