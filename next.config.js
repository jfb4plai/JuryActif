// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // pdfjs-dist requires canvas — exclude in Node environments
    config.resolve.alias.canvas = false
    return config
  },
}
module.exports = nextConfig
