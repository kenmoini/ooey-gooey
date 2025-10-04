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

### Local Build
```bash
npm run build
```

The static site will be generated in the `out/` directory.

### Deploying to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

#### Setup Steps:

1. **Enable GitHub Pages in your repository:**
   - Go to Settings → Pages
   - Under "Build and deployment"
   - Set Source to "GitHub Actions"

2. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Configure for GitHub Pages deployment"
   git push origin main
   ```

3. **GitHub Actions will automatically:**
   - Build the static site
   - Deploy to GitHub Pages
   - Site will be available at `https://<username>.github.io/abi-gui/`

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

- The site is configured with basePath `/abi-gui` for repository hosting
- For custom domain or root deployment, modify `basePath` in `next.config.ts`
- All processing is client-side, perfect for static hosting
