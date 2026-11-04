import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — this app is entirely client-rendered (no API routes, no
  // middleware, localStorage-token auth calling the real backend directly),
  // so it doesn't need a Node server at all. Render deploys the `out/`
  // directory as a Static Site rather than running `next start`.
  output: "export",
};

export default nextConfig;
