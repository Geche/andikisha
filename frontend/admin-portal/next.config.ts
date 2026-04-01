import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    transpilePackages: [
        "@andikisha/ui",
        "@andikisha/api-client",
        "@andikisha/shared-types",
    ],
    output: "standalone",
    experimental: {
        optimizePackageImports: ["lucide-react", "recharts", "@radix-ui/react-dialog"],
    },
};

export default nextConfig;