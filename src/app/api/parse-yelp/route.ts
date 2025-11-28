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
            categories: [],
            photos: [],
            hours: [],
        };

        // 1. Extract from page title
        const title = $('title').text();
        const titleMatch = title.match(/^(.+?) - Updated .+ - ([\d,]+) Photos & ([\d,]+) Reviews - (.+?) - (.+?) -/);
        if (titleMatch) {
            data.name = titleMatch[1].trim();
            data.photoCount = titleMatch[2].replace(/,/g, '');
            data.reviewCount = titleMatch[3].replace(/,/g, '');

            // Parse address - handle multi-word cities like "New York"
            const addressParts = titleMatch[4].split(',').map(s => s.trim());
            if (addressParts.length >= 3) {
                data.address = addressParts[0];

                // Last part should be "STATE ZIP" (e.g., "NY 10002") or "STATE" (e.g., "NY")
                const lastPart = addressParts[addressParts.length - 1];
                const stateZipMatch = lastPart.match(/([A-Z]{2})\s*(\d{5})?/);

                if (stateZipMatch) {
                    data.state = stateZipMatch[1]; // e.g., "NY"
                    data.zipCode = stateZipMatch[2] || ''; // e.g., "10002"

                    // Everything between address and state is the city
                    data.city = addressParts.slice(1, -1).join(', ');
                } else {
                    // Fallback: assume simple format
                    data.city = addressParts[1];
                    const stateZip = addressParts[2].split(' ');
                    data.state = stateZip[0];
                    data.zipCode = stateZip[1] || '';
                }
            }

            data.categories = [titleMatch[5].trim()];
        }

        // 2. Extract from Open Graph meta tags
        data.name = data.name || $('meta[property="og:title"]').attr('content')?.replace(' - Yelp', '');
        data.description = $('meta[property="og:description"]').attr('content');
        const ogImage = $('meta[property="og:image"]').attr('content');
        if (ogImage) data.photos.push(ogImage);

        // 3. Extract from JSON-LD structured data
        $('script[type="application/ld+json"]').each((i, elem) => {
            try {
                const jsonData = JSON.parse($(elem).html() || '{}');

                if (jsonData['@type'] === 'Restaurant' || jsonData['@type'] === 'LocalBusiness') {
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

                    // Extract hours from openingHoursSpecification
                    if (jsonData.openingHoursSpecification) {
                        const hoursSpec = Array.isArray(jsonData.openingHoursSpecification)
                            ? jsonData.openingHoursSpecification
                            : [jsonData.openingHoursSpecification];

                        hoursSpec.forEach((spec: any) => {
                            const dayOfWeek = spec.dayOfWeek?.replace('http://schema.org/', '').replace('https://schema.org/', '');
                            if (dayOfWeek && spec.opens && spec.closes) {
                                data.hours.push({
                                    day: dayOfWeek,
                                    opens: spec.opens,
                                    closes: spec.closes
                                });
                            }
                        });
                    }
                }
            } catch (e) {
                // Skip invalid JSON
            }
        });

        // 4. Extract from HTML elements
        if (!data.name) {
            data.name = $('h1').first().text().trim();
        }

        if (!data.rating) {
            const ratingText = $('[role="img"][aria-label*="star rating"]').attr('aria-label');
            data.rating = ratingText?.match(/[\d.]+/)?.[0];
        }

        if (!data.phone) {
            const phoneLink = $('a[href^="tel:"]').attr('href');
            data.phone = phoneLink?.replace('tel:', '');
        }

        // Extract categories
        $('a[href*="/c/"]').each((i, elem) => {
            const category = $(elem).text().trim();
            if (category && !data.categories.includes(category)) {
                data.categories.push(category);
            }
        });

        // Extract photos
        $('img[src*="bphoto"]').each((i, elem) => {
            const src = $(elem).attr('src');
            if (src && !data.photos.includes(src)) {
                data.photos.push(src);
            }
        });

        // Extract map image
        $('img[src*="maps.googleapis.com"], img[src*="staticmap"]').each((i, elem) => {
            const src = $(elem).attr('src');
            if (src) {
                data.mapImage = src;
                return false; // Stop after first map
            }
        });

        // Limit photos to first 10
        data.photos = data.photos.slice(0, 10);

        // Extract hours from HTML if not found in JSON-LD
        if (data.hours.length === 0) {
            // Look for hours table/list
            $('table tr, [class*="hours"] p, [class*="hours"] div').each((i, elem) => {
                const text = $(elem).text().trim();

                // Match patterns like "Mon 4:30 PM - 9:30 PM" or "Monday: 4:30 PM - 9:30 PM"
                const hourMatch = text.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*:?\s*(.+)/i);
                if (hourMatch) {
                    const day = hourMatch[1];
                    const timeRange = hourMatch[2].trim();

                    // Check if closed
                    if (timeRange.toLowerCase().includes('closed')) {
                        data.hours.push({
                            day: day,
                            opens: null,
                            closes: null,
                            closed: true
                        });
                    } else {
                        // Parse time range like "4:30 PM - 9:30 PM"
                        const timeMatch = timeRange.match(/(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)/i);
                        if (timeMatch) {
                            data.hours.push({
                                day: day,
                                opens: timeMatch[1],
                                closes: timeMatch[2]
                            });
                        }
                    }
                }
            });
        }

        // Clean up data
        Object.keys(data).forEach(key => {
            if (data[key] === '' || (Array.isArray(data[key]) && data[key].length === 0)) {
                delete data[key];
            }
        });

        return NextResponse.json({
            success: true,
            data,
            extractedAt: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Error parsing Yelp HTML:', error);
        return NextResponse.json(
            { error: 'Failed to parse Yelp HTML', details: String(error) },
            { status: 500 }
        );
    }
}
