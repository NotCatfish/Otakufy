export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://otakufy.app';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/dictionary', '/leaderboard', '/login'],
        disallow: [
          '/profile/',       // individual profile pages - privacy
          '/settings',       // personal settings
          '/friends',        // social data
          '/practice/',      // dynamic practice sessions
          '/api/',           // server routes
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
