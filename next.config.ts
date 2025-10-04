import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/ooey-gooey/abi-gui' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/ooey-gooey/abi-gui' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
