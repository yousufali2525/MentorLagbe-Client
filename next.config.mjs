
const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://mentorlagbe-server-s98a.onrender.com";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
