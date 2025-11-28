import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const yelpUrl = searchParams.get('url');

        if (!yelpUrl) {
            return NextResponse.json(
                { error: 'Yelp URL parameter is required' },
                { status: 400 }
            );
        }

        // Validate it's a Yelp URL
        if (!yelpUrl.includes('yelp.com')) {
            return NextResponse.json(
                { error: 'Please provide a valid Yelp URL' },
                { status: 400 }
            );
        }

        // Note: Yelp blocks most scraping attempts
        // This is a demo - for production, use Yelp Fusion API instead
        return NextResponse.json({
            error: 'Yelp blocks automated scraping',
            suggestion: 'Use the official Yelp Fusion API for production',
            demo: {
                message: 'This demo shows what data COULD be extracted if Yelp allowed scraping',
                extractableData: [
                    'Business name',
                    'Rating & review count',
                    'Price range',
                    'Categories/cuisine',
                    'Phone number',
                    'Website URL',
                    'Address',
                    'Hours of operation',
                    'Photos'
                ],
                recommendation: 'Get a free Yelp Fusion API key at https://www.yelp.com/developers'
            }
        }, { status: 403 });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'An error occurred', details: String(error) },
            { status: 500 }
        );
    }
}
