"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ExternalLink, MapPin, Phone, Star, DollarSign, Clock } from "lucide-react";

export default function YelpScraperDemo() {
    const [yelpUrl, setYelpUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    const handleScrape = async () => {
        if (!yelpUrl) {
            setError("Please enter a Yelp URL");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await fetch(`/api/scrape-yelp?url=${encodeURIComponent(yelpUrl)}`);
            const data = await response.json();

            if (data.success) {
                setResult(data.data);
            } else {
                setError(data.error || "Failed to scrape Yelp");
            }
        } catch (err) {
            setError("An error occurred while scraping");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="pointer-events-none fixed left-4 bottom-1 translate-y-1 text-[clamp(1rem,4vw,3rem)] font-black tracking-[0.12em] text-white/35 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] opacity-50 z-[1]">
                Yelp Scraper Demo
            </div>
            <DashboardLayout title="">
                <div className="relative w-full h-full z-10">
                    <div className="relative z-10 w-full h-full" style={{ transform: "scale(0.9)", transformOrigin: "top center" }}>
                        <div className="h-full overflow-y-auto pr-4" style={{ paddingTop: "5%" }}>
                            <div className="mx-auto max-w-[1200px] relative z-20">
                                <div className="mb-6">
                                    <h1 className="text-3xl font-bold mb-2">Yelp Business Scraper Demo</h1>
                                    <p className="text-muted-foreground">
                                        Enter a Yelp business URL to extract all available information
                                    </p>
                                </div>

                                {/* Input Section */}
                                <Card className="mb-6">
                                    <CardHeader>
                                        <CardTitle>Enter Yelp URL</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="https://www.yelp.com/biz/restaurant-name-city"
                                                value={yelpUrl}
                                                onChange={(e) => setYelpUrl(e.target.value)}
                                                onKeyPress={(e) => e.key === "Enter" && handleScrape()}
                                            />
                                            <Button onClick={handleScrape} disabled={loading}>
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Scraping...
                                                    </>
                                                ) : (
                                                    "Scrape"
                                                )}
                                            </Button>
                                        </div>
                                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Example: https://www.yelp.com/biz/katzs-delicatessen-new-york
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Results Section */}
                                {result && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Basic Info */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Basic Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div>
                                                    <h3 className="text-2xl font-bold">{result.name}</h3>
                                                    {result.categories.length > 0 && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {result.categories.join(", ")}
                                                        </p>
                                                    )}
                                                </div>

                                                {result.rating && (
                                                    <div className="flex items-center gap-2">
                                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                        <span className="font-semibold">{result.rating}</span>
                                                        {result.reviewCount && (
                                                            <span className="text-sm text-muted-foreground">
                                                                ({result.reviewCount} reviews)
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {result.priceRange && (
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4" />
                                                        <span>{result.priceRange}</span>
                                                    </div>
                                                )}

                                                {result.description && (
                                                    <p className="text-sm text-muted-foreground">{result.description}</p>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Contact Info */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Contact Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {result.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4" />
                                                        <a href={`tel:${result.phone}`} className="hover:underline">
                                                            {result.phone}
                                                        </a>
                                                    </div>
                                                )}

                                                {result.address && (
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 mt-1" />
                                                        <div>
                                                            <p>{result.address}</p>
                                                            {result.city && (
                                                                <p>
                                                                    {result.city}
                                                                    {result.state && `, ${result.state}`}
                                                                    {result.zipCode && ` ${result.zipCode}`}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {result.website && (
                                                    <div className="flex items-center gap-2">
                                                        <ExternalLink className="h-4 w-4" />
                                                        <a
                                                            href={result.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:underline text-primary"
                                                        >
                                                            Visit Website
                                                        </a>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Hours */}
                                        {result.hours.length > 0 && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Clock className="h-5 w-5" />
                                                        Hours of Operation
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-1">
                                                        {result.hours.map((hour: string, i: number) => (
                                                            <p key={i} className="text-sm">{hour}</p>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Photos */}
                                        {result.photos.length > 0 && (
                                            <Card className="md:col-span-2">
                                                <CardHeader>
                                                    <CardTitle>Photos ({result.photos.length})</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                        {result.photos.map((photo: string, i: number) => (
                                                            <img
                                                                key={i}
                                                                src={photo}
                                                                alt={`${result.name} photo ${i + 1}`}
                                                                className="w-full h-32 object-cover rounded-lg"
                                                            />
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Raw JSON */}
                                        <Card className="md:col-span-2">
                                            <CardHeader>
                                                <CardTitle>Raw Data (JSON)</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-xs">
                                                    {JSON.stringify(result, null, 2)}
                                                </pre>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
