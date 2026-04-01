import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    transpilePackages: [
        "@andikisha/ui",
        "@andikisha/api-client",
        "@andikisha/shared-types",
    ],
    output: "standalone",
    experimental: {
        optimizePackageImports: ["lucide-react", "@radix-ui/react-dialog", "@radix-ui/react-tabs"],
    },
};

export default nextConfig;
