import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Playwright (and some browsers) hit the dev server via 127.0.0.1; allow HMR without cross-origin noise.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
