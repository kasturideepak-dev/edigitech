// URL prefixes owned by the app itself. Neither a CMS page nor a content type may use them.
// ("blog" is no longer here: it is now just the default prefix of the Blog Post content type.)
export const STATIC_RESERVED = [
  "admin",
  "uploads",
  "preview",
  "api",
  "sitemap.xml",
  "robots.txt",
  "_next",
  "assets",
  "css",
  "images",
];

export const isStaticReserved = (firstSegment: string) => STATIC_RESERVED.includes(firstSegment);
