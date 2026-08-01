import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@neotrace/shared"],
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;

