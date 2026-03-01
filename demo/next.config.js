const pkg = require('../package.json')
const isProd = process.env.NODE_ENV === 'production'
const isVercel = Boolean(process.env.VERCEL)
const basePath = '/tokvista'

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['tokvista'],
  output: 'export',
  trailingSlash: true,
  ...(isProd && !isVercel ? { basePath, assetPrefix: basePath } : {}),
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_PACKAGE_VERSION: pkg.version,
  }
}

module.exports = nextConfig
