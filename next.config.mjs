/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
    // Opsional: atur format gambar yang dioptimasi
    formats: ["image/avif", "image/webp"],
    // Opsional: atur device sizes untuk responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Opsional: atur image sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  reactCompiler: true,
};

export default nextConfig;
