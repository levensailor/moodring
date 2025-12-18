import { NextRequest, NextResponse } from "next/server";
import { LinkPreview } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: { url: string } = await request.json();
    const { url } = body;

    if (!url || !url.startsWith("http")) {
      return NextResponse.json(
        { error: "Invalid URL" },
        { status: 400 }
      );
    }

    // Fetch the URL to get metadata
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch URL");
    }

    const html = await response.text();

    // Extract Open Graph and meta tags
    const preview: LinkPreview = { url };

    // Extract title
    const titleMatch =
      html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      preview.title = titleMatch[1];
    }

    // Extract description
    const descMatch =
      html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (descMatch) {
      preview.description = descMatch[1];
    }

    // Extract image
    const imageMatch = html.match(
      /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i
    );
    if (imageMatch) {
      preview.image = imageMatch[1];
    }

    // Extract site name
    const siteMatch = html.match(
      /<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i
    );
    if (siteMatch) {
      preview.siteName = siteMatch[1];
    }

    return NextResponse.json(preview);
  } catch (error) {
    console.error("Error fetching link preview:", error);
    return NextResponse.json(
      { error: "Failed to fetch link preview" },
      { status: 500 }
    );
  }
}

