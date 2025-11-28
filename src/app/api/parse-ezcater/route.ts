import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
    try {
        const { html } = await request.json();

        if (!html) {
            return NextResponse.json(
                { error: 'HTML content is required' },
                { status: 400 }
            );
        }

        const $ = cheerio.load(html);

        // Extract data from multiple sources
        const data: any = {
            name: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            phone: '',
            website: '',
            rating: '',
            reviewCount: '',
            priceRange: '',
            cuisine: '',
            categories: [],
            photos: [],
            menu: [],
        };

        // Extract from JSON-LD structured data
        console.log('Looking for JSON-LD scripts...');
        const scripts = $('script[type="application/ld+json"]');
        console.log(`Found ${scripts.length} JSON-LD scripts`);

        scripts.each((i, elem) => {
            try {
                const jsonText = $(elem).html();
                if (!jsonText) return;

                const jsonData = JSON.parse(jsonText);
                console.log('Parsed JSON-LD type:', jsonData['@type']);

                if (jsonData['@type'] === 'Restaurant') {
                    console.log('Found Restaurant data!');
                    data.name = data.name || jsonData.name;
                    data.phone = data.phone || jsonData.telephone;
                    data.website = data.website || jsonData.url;

                    if (jsonData.address) {
                        data.address = data.address || jsonData.address.streetAddress;
                        data.city = data.city || jsonData.address.addressLocality;
                        data.state = data.state || jsonData.address.addressRegion;
                        data.zipCode = data.zipCode || jsonData.address.postalCode;
                    }

                    if (jsonData.aggregateRating) {
                        data.rating = jsonData.aggregateRating.ratingValue;
                        data.reviewCount = data.reviewCount || jsonData.aggregateRating.reviewCount;
                    }

                    if (jsonData.image) {
                        const images = Array.isArray(jsonData.image) ? jsonData.image : [jsonData.image];
                        data.photos = [...new Set([...data.photos, ...images])];
                    }

                    if (jsonData.priceRange) {
                        data.priceRange = jsonData.priceRange;
                    }

                    if (jsonData.servesCuisine) {
                        data.cuisine = Array.isArray(jsonData.servesCuisine)
                            ? jsonData.servesCuisine.join(', ')
                            : jsonData.servesCuisine;
                    }

                    // Extract menu items from hasMenu structure
                    if (jsonData.hasMenu && jsonData.hasMenu.hasMenuSection) {
                        console.log(`Found ${jsonData.hasMenu.hasMenuSection.length} menu sections`);
                        jsonData.hasMenu.hasMenuSection.forEach((section: any) => {
                            if (section.hasMenuItem) {
                                console.log(`Section "${section.name}" has ${section.hasMenuItem.length} items`);
                                section.hasMenuItem.forEach((item: any) => {
                                    data.menu.push({
                                        name: item.name || '',
                                        price: item.offers?.[0]?.price ? `$${item.offers[0].price}` : '',
                                        description: item.description || '',
                                        category: section.name || '',
                                    });
                                });
                            }
                        });
                    }
                }
            } catch (e) {
                console.error('Error parsing JSON-LD:', e);
            }
        });

        console.log(`Total menu items extracted: ${data.menu.length}`);

        // Extract from Open Graph meta tags
        data.name = data.name || $('meta[property="og:title"]').attr('content')?.replace(' - ezCater', '');
        data.description = $('meta[property="og:description"]').attr('content');
        const ogImage = $('meta[property="og:image"]').attr('content');
        if (ogImage) data.photos.push(ogImage);

        // Clean up data
        Object.keys(data).forEach(key => {
            if (data[key] === '' || (Array.isArray(data[key]) && data[key].length === 0)) {
                delete data[key];
            }
        });

        console.log('Final data:', JSON.stringify(data, null, 2));

        return NextResponse.json({
            success: true,
            data,
            extractedAt: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Error parsing ezCater HTML:', error);
        return NextResponse.json(
            { error: 'Failed to parse ezCater HTML', details: String(error) },
            { status: 500 }
        );
    }
}
