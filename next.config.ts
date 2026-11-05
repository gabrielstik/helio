import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Envoi de photos depuis le studio.
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
