const pkg = require('../package.json')

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@nibin-org/tokens'],
  output: 'export',
  trailingSlash: true,
  basePath: '/tokens',
  assetPrefix: '/tokens',
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_PACKAGE_VERSION: pkg.version,
  }
}

module.exports = nextConfig