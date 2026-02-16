const pkg = require('../package.json')

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['tokvista'],
  output: 'export',
  trailingSlash: true,
  basePath: '/tokvista',
  assetPrefix: '/tokvista',
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_PACKAGE_VERSION: pkg.version,
  }
}

module.exports = nextConfig
