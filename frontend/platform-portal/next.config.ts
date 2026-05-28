import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@andikisha/ui"],
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
