/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const repoName = process.env.NEXT_PUBLIC_REPO_NAME || '';

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // basePath only on GitHub Pages (not locally)
  basePath: isProd && repoName ? `/${repoName}` : '',
  assetPrefix: isProd && repoName ? `/${repoName}/` : '',
  images: {
    unoptimized: true,
  },
  // API routes are excluded automatically with output: 'export'
  // They still work in local dev (next dev)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
