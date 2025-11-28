"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Copy, CheckCircle, FileText, Grid3x3 } from "lucide-react";
import { RestaurantReport } from "@/components/features/parser/restaurant-report";

export default function YelpParserPage() {
    const [activeTab, setActiveTab] = useState<"yelp" | "ezcater">("yelp");
    const [html, setHtml] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [viewMode, setViewMode] = useState<"details" | "report">("details");

    const handleParse = async () => {
        if (!html.trim()) {
            alert("Please paste HTML content first");
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const apiEndpoint = activeTab === "yelp" ? '/api/parse-yelp' : '/api/parse-ezcater';
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html })
            });

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setResult({ error: String(err) });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <>
            <div className="pointer-events-none fixed left-4 bottom-1 translate-y-1 text-[clamp(1rem,4vw,3rem)] font-black tracking-[0.12em] text-white/35 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] opacity-50 z-[1]">
                Restaurant Parser
            </div>
            <DashboardLayout title="">
                <div className="relative w-full h-full z-10">
                    <div className="relative z-10 w-full h-full" style={{ transform: "scale(0.9)", transformOrigin: "top center" }}>
                        <div className="h-full overflow-y-auto pr-4" style={{ paddingTop: "5%" }}>
                            <div className="mx-auto max-w-[1400px] relative z-20">
                                <div className="mb-6">
                                    <h1 className="text-3xl font-bold mb-2">Restaurant HTML Parser</h1>
                                    <p className="text-muted-foreground mb-4">
                                        Parse Yelp or ezCater page HTML to extract restaurant data
                                    </p>

                                    {/* Tabs */}
                                    <div className="flex gap-2 mb-4">
                                        <Button
                                            variant={activeTab === "yelp" ? "default" : "outline"}
                                            onClick={() => {
                                                setActiveTab("yelp");
                                                setResult(null);
                                            }}
                                        >
                                            Yelp Parser
                                        </Button>
                                        <Button
                                            variant={activeTab === "ezcater" ? "default" : "outline"}
                                            onClick={() => {
                                                setActiveTab("ezcater");
                                                setResult(null);
                                            }}
                                        >
                                            ezCater Parser
                                        </Button>
                                    </div>

                                    {/* Instructions */}
                                    <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                                        <CardHeader>
                                            <CardTitle className="text-sm">📋 How to Use:</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm space-y-2">
                                            {activeTab === "yelp" ? (
                                                <>
                                                    <p><strong>1.</strong> Go to any Yelp restaurant page in your browser</p>
                                                    <p><strong>2.</strong> Right-click → "View Page Source" (or Ctrl+U)</p>
                                                    <p><strong>3.</strong> Copy ALL the HTML (Ctrl+A, Ctrl+C)</p>
                                                    <p><strong>4.</strong> Paste it in the box below</p>
                                                    <p><strong>5.</strong> Click "Parse HTML"</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p><strong>1.</strong> Go to any ezCater restaurant page in your browser</p>
                                                    <p><strong>2.</strong> Right-click → "View Page Source" (or Ctrl+U)</p>
                                                    <p><strong>3.</strong> Copy ALL the HTML (Ctrl+A, Ctrl+C)</p>
                                                    <p><strong>4.</strong> Paste it in the box below</p>
                                                    <p><strong>5.</strong> Click "Parse HTML" - this will extract the FULL MENU!</p>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Input */}
                                <Card className="mb-6">
                                    <CardHeader>
                                        <CardTitle>
                                            Paste {activeTab === "yelp" ? "Yelp" : "ezCater"} HTML Here
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <textarea
                                            className="w-full h-64 p-4 border rounded-lg font-mono text-xs bg-muted"
                                            placeholder={`Paste the entire HTML source code from ${activeTab === "yelp" ? "Yelp" : "ezCater"} page here...`}
                                            value={html}
                                            onChange={(e) => setHtml(e.target.value)}
                                        />
                                        <div className="flex gap-2 mt-4">
                                            <Button onClick={handleParse} disabled={loading}>
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Parsing...
                                                    </>
                                                ) : (
                                                    "Parse HTML"
                                                )}
                                            </Button>
                                            <Button variant="outline" onClick={() => setHtml("")}>
                                                Clear
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Results */}
                                {result && result.success && (
                                    <>
                                        {/* View Mode Toggle */}
                                        <div className="flex gap-2 mb-4">
                                            <Button
                                                variant={viewMode === "details" ? "default" : "outline"}
                                                onClick={() => setViewMode("details")}
                                                size="sm"
                                            >
                                                <Grid3x3 className="mr-2 h-4 w-4" />
                                                Detailed View
                                            </Button>
                                            <Button
                                                variant={viewMode === "report" ? "default" : "outline"}
                                                onClick={() => setViewMode("report")}
                                                size="sm"
                                            >
                                                <FileText className="mr-2 h-4 w-4" />
                                                Report View
                                            </Button>
                                        </div>

                                        {/* Report View */}
                                        {viewMode === "report" ? (
                                            <RestaurantReport data={result.data} source={activeTab} />
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Basic Info */}
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                                            Extracted Data
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        {result.data.name && (
                                                            <div>
                                                                <strong>Name:</strong>
                                                                <div className="flex items-center gap-2">
                                                                    <span>{result.data.name}</span>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => copyToClipboard(result.data.name)}
                                                                    >
                                                                        <Copy className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {result.data.rating && (
                                                            <div>
                                                                <strong>Rating:</strong> {result.data.rating} ⭐
                                                            </div>
                                                        )}

                                                        {result.data.reviewCount && (
                                                            <div>
                                                                <strong>Reviews:</strong> {result.data.reviewCount}
                                                            </div>
                                                        )}

                                                        {result.data.priceRange && (
                                                            <div>
                                                                <strong>Price:</strong> {result.data.priceRange}
                                                            </div>
                                                        )}

                                                        {result.data.categories && result.data.categories.length > 0 && (
                                                            <div>
                                                                <strong>Categories:</strong>
                                                                <div className="flex flex-wrap gap-2 mt-1">
                                                                    {result.data.categories.map((cat: string, i: number) => (
                                                                        <span key={i} className="px-2 py-1 bg-primary/10 rounded text-xs">
                                                                            {cat}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>

                                                {/* Contact Info */}
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>Contact Information</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        {result.data.address && (
                                                            <div>
                                                                <strong>Address:</strong>
                                                                <p>{result.data.address}</p>
                                                                {result.data.city && (
                                                                    <p>
                                                                        {result.data.city}
                                                                        {result.data.state && `, ${result.data.state}`}
                                                                        {result.data.zipCode && ` ${result.data.zipCode}`}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}

                                                        {result.data.phone && (
                                                            <div>
                                                                <strong>Phone:</strong>
                                                                <div className="flex items-center gap-2">
                                                                    <span>{result.data.phone}</span>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => copyToClipboard(result.data.phone)}
                                                                    >
                                                                        <Copy className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {result.data.website && (
                                                            <div>
                                                                <strong>Website:</strong>
                                                                <a
                                                                    href={result.data.website}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-primary hover:underline block"
                                                                >
                                                                    {result.data.website}
                                                                </a>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>

                                                {/* Map */}
                                                {result.data.mapImage && (
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Location Map</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <img
                                                                src={result.data.mapImage}
                                                                alt="Location Map"
                                                                className="w-full rounded-lg border"
                                                            />
                                                        </CardContent>
                                                    </Card>
                                                )}

                                                {/* Hours */}
                                                {result.data.hours && result.data.hours.length > 0 && (
                                                    <Card className="md:col-span-2">
                                                        <CardHeader>
                                                            <CardTitle>Business Hours</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {result.data.hours.map((hour: any, i: number) => (
                                                                    <div key={i} className="flex justify-between items-center border-b pb-2">
                                                                        <span className="font-semibold capitalize">{hour.day}</span>
                                                                        <span className={hour.closed ? "text-red-500" : ""}>
                                                                            {hour.closed ? "Closed" : `${hour.opens} - ${hour.closes}`}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}

                                                {/* Photos */}
                                                {result.data.photos && result.data.photos.length > 0 && (
                                                    <Card className="md:col-span-2">
                                                        <CardHeader>
                                                            <CardTitle>Photos ({result.data.photos.length})</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                                {result.data.photos.map((photo: string, i: number) => (
                                                                    <div key={i} className="relative group">
                                                                        <img
                                                                            src={photo}
                                                                            alt={`Photo ${i + 1}`}
                                                                            className="w-full h-32 object-cover rounded-lg"
                                                                        />
                                                                        <Button
                                                                            size="sm"
                                                                            variant="secondary"
                                                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            onClick={() => copyToClipboard(photo)}
                                                                        >
                                                                            <Copy className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}

                                                {/* Menu Items (ezCater only) */}
                                                {activeTab === "ezcater" && result.data.menu && result.data.menu.length > 0 && (
                                                    <Card className="md:col-span-2">
                                                        <CardHeader>
                                                            <CardTitle>Menu Items ({result.data.menu.length})</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="space-y-4 max-h-96 overflow-auto">
                                                                {result.data.menu.map((item: any, i: number) => (
                                                                    <div key={i} className="border-b pb-3 last:border-b-0">
                                                                        <div className="flex justify-between items-start gap-2">
                                                                            <div className="flex-1">
                                                                                <div className="font-semibold">{item.name}</div>
                                                                                {item.category && (
                                                                                    <div className="text-xs text-muted-foreground mt-1">
                                                                                        {item.category}
                                                                                    </div>
                                                                                )}
                                                                                {item.description && (
                                                                                    <div className="text-sm text-muted-foreground mt-1">
                                                                                        {item.description}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            {item.price && (
                                                                                <div className="font-bold text-primary whitespace-nowrap">
                                                                                    {item.price}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}

                                                {/* Raw JSON */}
                                                <Card className="md:col-span-2">
                                                    <CardHeader>
                                                        <CardTitle>Raw JSON Data</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-xs">
                                                            {JSON.stringify(result.data, null, 2)}
                                                        </pre>
                                                        <Button
                                                            className="mt-2"
                                                            variant="outline"
                                                            onClick={() => copyToClipboard(JSON.stringify(result.data, null, 2))}
                                                        >
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            Copy JSON
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Error */}
                                {result && result.error && (
                                    <Card className="border-red-500">
                                        <CardHeader>
                                            <CardTitle className="text-red-500">Error</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-red-500">{result.error}</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
