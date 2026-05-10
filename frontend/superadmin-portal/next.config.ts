import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@andikisha/ui"],
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
