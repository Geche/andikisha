import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@andikisha/ui"],
  output: "standalone",
};

export default nextConfig;
