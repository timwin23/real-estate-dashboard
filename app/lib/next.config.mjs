/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.resolve.fallback = {
            "net": false,
            "tls": false,
            "fs": false,
            "http": false,
            "https": false
        };
        return config;
    },
};

export default nextConfig;