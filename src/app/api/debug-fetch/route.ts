import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const yelpUrl = searchParams.get('url');

        if (!yelpUrl) {
            return NextResponse.json(
                { error: 'URL parameter is required' },
                { status: 400 }
            );
        }

        console.log('Fetching:', yelpUrl);

        // Fetch with realistic browser headers
        const response = await fetch(yelpUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'max-age=0',
            },
        });

        const html = await response.text();

        // Return debug info
        return NextResponse.json({
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            htmlLength: html.length,
            htmlPreview: html.substring(0, 1000), // First 1000 chars
            htmlFull: html, // Full HTML for inspection
            containsYelpContent: html.includes('yelp'),
            containsCloudflare: html.includes('cloudflare') || html.includes('cf-ray'),
            containsJavaScriptChallenge: html.includes('challenge') || html.includes('captcha'),
        });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch', details: String(error) },
            { status: 500 }
        );
    }
}
