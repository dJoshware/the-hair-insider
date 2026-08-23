import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    allowedDevOrigins: [
        '192.168.1.214', // Barn
        '172.20.10.11', // iPhone hotspot
        '192.168.99.39', // Parkey house
        '192.168.1.222', // Jackson house
    ],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'vbbazoujjawlegemwyrd.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
    async redirects() {
        return [
            {
                source: '/contact',
                destination: '/support',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
