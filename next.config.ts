import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // --- TAMBAHKAN BARIS INI ---
  // Memberi tahu Next.js bahwa folder 'app', 'pages', dll. ada di dalam 'src/'
  srcDir: "src",
  // -------------------------

  reactStrictMode: true,
};

export default nextConfig;