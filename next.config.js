/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/games/intercept',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
