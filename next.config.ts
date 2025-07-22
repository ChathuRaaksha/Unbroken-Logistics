import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  rewrites() {
    return [
      {
        source: '/api/couchbase/:path*',
        destination: 'https://lyy7hcxorv51baby.apps.cloud.couchbase.com:4984/:path*',
      },
    ]
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
