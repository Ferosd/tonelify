import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = SITE_URL;

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
