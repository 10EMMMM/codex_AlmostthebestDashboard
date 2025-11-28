"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";

export default function CheerioVisualizerPage() {
    const [url, setUrl] = useState("https://www.yelp.com/biz/katzs-delicatessen-new-york");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleFetch = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch(`/api/debug-fetch?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            setResult(data);
        } catch (err) {
            setResult({ error: String(err) });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="pointer-events-none fixed left-4 bottom-1 translate-y-1 text-[clamp(1rem,4vw,3rem)] font-black tracking-[0.12em] text-white/35 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] opacity-50 z-[1]">
                Cheerio Visualizer
            </div>
            <DashboardLayout title="">
                <div className="relative w-full h-full z-10">
                    <div className="relative z-10 w-full h-full" style={{ transform: "scale(0.9)", transformOrigin: "top center" }}>
                        <div className="h-full overflow-y-auto pr-4" style={{ paddingTop: "5%" }}>
                            <div className="mx-auto max-w-[1400px] relative z-20">
                                <div className="mb-6">
                                    <h1 className="text-3xl font-bold mb-2">Cheerio Visualizer - See What Cheerio Sees</h1>
                                    <p className="text-muted-foreground">
                                        This shows you the exact HTML that Cheerio receives and tries to parse
                                    </p>
                                </div>

                                {/* Input */}
                                <Card className="mb-6">
                                    <CardHeader>
                                        <CardTitle>Enter URL to Fetch</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="https://www.yelp.com/biz/..."
                                                value={url}
                                                onChange={(e) => setUrl(e.target.value)}
                                                onKeyPress={(e) => e.key === "Enter" && handleFetch()}
                                            />
                                            <Button onClick={handleFetch} disabled={loading}>
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Fetching...
                                                    </>
                                                ) : (
                                                    "Fetch & Visualize"
                                                )}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Try: Yelp URL (will be blocked) vs Restaurant website (will work)
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Results */}
                                {result && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Left: Analysis */}
                                        <div className="space-y-4">
                                            {/* Status Card */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Response Analysis</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <strong>Status:</strong>
                                                        <span className={result.status === 200 ? 'text-green-500' : 'text-red-500'}>
                                                            {result.status} {result.statusText}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <strong>HTML Size:</strong>
                                                        <span>{result.htmlLength?.toLocaleString()} chars</span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {result.containsYelpContent ? (
                                                            <>
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                                <span className="text-green-500">Contains Yelp content</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                                                <span className="text-yellow-500">No Yelp content found</span>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {result.containsCloudflare ? (
                                                            <>
                                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                                                <span className="text-red-500">Cloudflare detected (BLOCKED)</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                                <span className="text-green-500">No Cloudflare blocking</span>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {result.containsJavaScriptChallenge ? (
                                                            <>
                                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                                                <span className="text-red-500">Bot challenge detected</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                                <span className="text-green-500">No bot challenge</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Explanation Card */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>What This Means</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-2 text-sm">
                                                    {result.containsCloudflare || result.containsJavaScriptChallenge ? (
                                                        <>
                                                            <p className="text-red-500 font-semibold">❌ Cheerio CANNOT scrape this page</p>
                                                            <p>The page is protected by Cloudflare or bot detection. Cheerio only sees a challenge page, not the actual content.</p>
                                                            <p className="mt-2"><strong>What Cheerio sees:</strong> A JavaScript challenge or CAPTCHA page</p>
                                                            <p><strong>What you see in browser:</strong> The actual restaurant page (after JavaScript executes)</p>
                                                        </>
                                                    ) : result.containsYelpContent ? (
                                                        <>
                                                            <p className="text-green-500 font-semibold">✅ Cheerio CAN scrape this page</p>
                                                            <p>The page returned actual HTML content that Cheerio can parse.</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="text-yellow-500 font-semibold">⚠️ Unexpected response</p>
                                                            <p>The page didn't return expected content. Check the HTML preview.</p>
                                                        </>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Right: Visual Render */}
                                        <div className="space-y-4">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>What Cheerio Sees (Rendered)</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900 min-h-[400px] max-h-[600px] overflow-auto">
                                                        {result.htmlFull ? (
                                                            <iframe
                                                                srcDoc={result.htmlFull}
                                                                className="w-full h-[550px] border-0"
                                                                sandbox="allow-same-origin"
                                                                title="Cheerio View"
                                                            />
                                                        ) : (
                                                            <p className="text-muted-foreground">No HTML to display</p>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        ☝️ This is the EXACT page Cheerio tries to parse
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Full HTML Source */}
                                        <Card className="lg:col-span-2">
                                            <CardHeader>
                                                <CardTitle>Raw HTML Source (What Cheerio Parses)</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-xs whitespace-pre-wrap">
                                                    {result.htmlFull || 'No HTML available'}
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
