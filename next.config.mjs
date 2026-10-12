/** @type {import('next').NextConfig} */
const nextConfig = {
  /*
   * Cache Components: pages render per request, and data opt into caching with
   * "use cache" + cacheLife/cacheTag. The content layer (src/lib/content.ts)
   * uses this so the home page reads MongoDB through a cached data layer, and
   * admin writes revalidate the matching tags on demand — no rebuild needed.
   */
  cacheComponents: true,
};

export default nextConfig;
