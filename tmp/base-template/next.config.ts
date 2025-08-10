import type { NextConfig } from 'next';
// import { v4 as uuidv4 } from "uuid";
// import * as path from "path";
// import * as fs from "fs";

// const BUILD_ID_PATH = path.resolve(__dirname, ".next", "BUILD_ID");

const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // generateBuildId: async () => {
  //   const buildId = uuidv4();

  //   fs.writeFileSync(BUILD_ID_PATH, buildId);

  //   return buildId;
  // },
};

export default nextConfig;
