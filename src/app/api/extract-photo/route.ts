import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url) {
            return NextResponse.json(
                { error: 'URL parameter is required' },
                { status: 400 }
            );
        }

        // Validate URL
        let websiteUrl: URL;
        try {
            websiteUrl = new URL(url);
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        // Fetch the website
        const response = await fetch(websiteUrl.toString(), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch website' },
                { status: response.status }
            );
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Strategy 1: Try Open Graph image (best quality, usually featured image)
        let photoUrl = $('meta[property="og:image"]').attr('content');

        // Strategy 2: Try Twitter card image
        if (!photoUrl) {
            photoUrl = $('meta[name="twitter:image"]').attr('content');
        }

        // Strategy 3: Try schema.org structured data
        if (!photoUrl) {
            const jsonLd = $('script[type="application/ld+json"]').html();
            if (jsonLd) {
                try {
                    const data = JSON.parse(jsonLd);
                    if (data.image) {
                        photoUrl = Array.isArray(data.image) ? data.image[0] : data.image;
                    }
                } catch {
                    // Invalid JSON, skip
                }
            }
        }

        // Strategy 4: Find largest image on page
        if (!photoUrl) {
            const images: { src: string; score: number }[] = [];

            $('img').each((_, elem) => {
                const src = $(elem).attr('src');
                const alt = $(elem).attr('alt') || '';
                const width = parseInt($(elem).attr('width') || '0');
                const height = parseInt($(elem).attr('height') || '0');

                if (!src) return;

                // Skip small images, icons, logos
                if (width > 0 && width < 200) return;
                if (height > 0 && height < 200) return;
                if (src.includes('logo') || src.includes('icon')) return;
                if (alt.toLowerCase().includes('logo') || alt.toLowerCase().includes('icon')) return;

                // Calculate score based on size and relevance
                let score = (width * height) || 1000; // Default score if no dimensions

                // Boost score for food-related keywords
                const foodKeywords = ['food', 'dish', 'meal', 'restaurant', 'menu', 'plate'];
                if (foodKeywords.some(keyword => alt.toLowerCase().includes(keyword))) {
                    score *= 2;
                }

                images.push({ src, score });
            });

            // Sort by score and get the best one
            if (images.length > 0) {
                images.sort((a, b) => b.score - a.score);
                photoUrl = images[0].src;
            }
        }

        // Make URL absolute if it's relative
        if (photoUrl && !photoUrl.startsWith('http')) {
            photoUrl = new URL(photoUrl, websiteUrl).toString();
        }

        if (!photoUrl) {
            return NextResponse.json(
                { error: 'No suitable image found on the website' },
                { status: 404 }
            );
        }

        // Return the photo URL and additional metadata
        return NextResponse.json({
            photoUrl,
            title: $('meta[property="og:title"]').attr('content') || $('title').text(),
            description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
            siteName: $('meta[property="og:site_name"]').attr('content'),
        });

    } catch (error) {
        console.error('Error extracting photo:', error);
        return NextResponse.json(
            { error: 'Failed to extract photo from website' },
            { status: 500 }
        );
    }
}
