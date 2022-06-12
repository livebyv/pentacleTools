const withPlugins = require("next-compose-plugins");
const withPreact = require('next-plugin-preact');

/** eslint-disable @typescript-eslint/no-var-requires */
const withTM = require("next-transpile-modules")([
  "@solana/wallet-adapter-base",
  // Uncomment wallets you want to use
  // "@solana/wallet-adapter-bitpie",
  // "@solana/wallet-adapter-coin98",
  "@solana/wallet-adapter-ledger",
  // "@solana/wallet-adapter-mathwallet",
  "@solana/wallet-adapter-phantom",
  "@solana/wallet-adapter-react",
  "@solana/wallet-adapter-solflare",
  "@solana/wallet-adapter-sollet",
  // "@solana/wallet-adapter-solong",
  // "@solana/wallet-adapter-torus",
  "@solana/wallet-adapter-wallets",
  // "@project-serum/sol-wallet-adapter",
  // "@solana/wallet-adapter-ant-design",
]);
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const config = {
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: ["arweave.net", "www.arweave.net", "raw.githubusercontent.com", "ipfs.io", "shdw-drive.genesysgo.net"],
  },
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: "/get-mints",
        destination: "/nft-mints",
        permanent: false,
      },
      {
        source: "/get-nft-mints",
        destination: "/nft-mints",
        permanent: false,
      },
      {
        source: "/",
        destination: "/nft-mints",
        permanent: false,
      },
      {
        source: "/get-meta",
        destination: "/token-metadata",
        permanent: true,
      },
      {
        source: "/get-ar-links",
        destination: "/arweave-upload",
        permanent: true,
      },
      {
        source: "/get-minters",
        destination: "/nft-minters",
        permanent: true,
      },
      {
        source: "/get-holders",
        destination: "/holder-snapshot",
        permanent: true,
      },
    ];
  },
};


module.exports = withPlugins(
  [withTM, withPreact, withBundleAnalyzer],
  config
)