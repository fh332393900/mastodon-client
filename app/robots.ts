import type { MetadataRoute } from "next"

/** 站点根目录的 robots.txt：允许抓取公开内容，屏蔽个性化/交互类页面与接口。 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/*/settings/",
          "/*/compose/",
          "/*/notifications/",
          "/*/favorites/",
          "/*/dashboard/",
        ],
      },
    ],
  }
}
