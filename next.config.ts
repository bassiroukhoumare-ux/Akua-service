import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // autorise l'accès au serveur de dev depuis un téléphone du même réseau Wi-Fi
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
};

export default nextConfig;
