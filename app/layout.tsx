import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenShift Agent Based Install Configuration Wizard",
  description: "Configure your OpenShift cluster deployment and generate the YAML and steps needed to deploy it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
