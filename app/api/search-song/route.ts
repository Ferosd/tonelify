import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json([]);
    }

    try {
        const response = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=5`
        );
        const data = await response.json();

        const results = data.results.map((item: any) => ({
            trackName: item.trackName,
            artistName: item.artistName,
            albumName: item.collectionName,
            artworkUrl: item.artworkUrl60,
        }));

        return NextResponse.json(results);
    } catch (error) {
        console.error("iTunes Search Error:", error);
        return NextResponse.json({ error: "Failed to fetch songs" }, { status: 500 });
    }
}
