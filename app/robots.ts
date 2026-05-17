import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tonelify.com";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/", "/dashboard/", "/settings/", "/sign-in/", "/sign-up/"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
