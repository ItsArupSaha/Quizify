import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  webpack(config) {
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      punycode: require.resolve("punycode/"),
    };
    return config;
  },
  devIndicators: {
    buildActivity: false, // hides the build spinner
  },
};

export default nextConfig;
