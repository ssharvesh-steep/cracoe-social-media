import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // output: 'export', // Disabled for dynamic routes
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
