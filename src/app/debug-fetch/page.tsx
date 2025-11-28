"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function DebugFetchPage() {
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
                Debug Fetch
            </div>
            <DashboardLayout title="">
                <div className="relative w-full h-full z-10">
                    <div className="relative z-10 w-full h-full" style={{ transform: "scale(0.9)", transformOrigin: "top center" }}>
                        <div className="h-full overflow-y-auto pr-4" style={{ paddingTop: "5%" }}>
                            <div className="mx-auto max-w-[1200px] relative z-20">
                                <div className="mb-6">
                                    <h1 className="text-3xl font-bold mb-2">Debug Fetch - See What Yelp Returns</h1>
                                    <p className="text-muted-foreground">
                                        This shows you the raw HTML response and helps identify blocking mechanisms
                                    </p>
                                </div>

                                {/* Input */}
                                <Card className="mb-6">
                                    <CardHeader>
                                        <CardTitle>Enter URL</CardTitle>
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
                                                    "Fetch"
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Results */}
                                {result && (
                                    <div className="space-y-4">
                                        {/* Status */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Response Status</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    <p><strong>Status:</strong> {result.status} {result.statusText}</p>
                                                    <p><strong>HTML Length:</strong> {result.htmlLength?.toLocaleString()} characters</p>
                                                    <p><strong>Contains "yelp":</strong> {result.containsYelpContent ? '✅ Yes' : '❌ No'}</p>
                                                    <p><strong>Contains Cloudflare:</strong> {result.containsCloudflare ? '⚠️ Yes (Blocked)' : '✅ No'}</p>
                                                    <p><strong>Contains Challenge:</strong> {result.containsJavaScriptChallenge ? '⚠️ Yes (Bot Detection)' : '✅ No'}</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Headers */}
                                        {result.headers && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Response Headers</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-64 text-xs">
                                                        {JSON.stringify(result.headers, null, 2)}
                                                    </pre>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* HTML Preview */}
                                        {result.htmlPreview && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>HTML Preview (First 1000 chars)</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-64 text-xs whitespace-pre-wrap">
                                                        {result.htmlPreview}
                                                    </pre>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Full HTML */}
                                        {result.htmlFull && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Full HTML Response</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-xs whitespace-pre-wrap">
                                                        {result.htmlFull}
                                                    </pre>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Error */}
                                        {result.error && (
                                            <Card className="border-red-500">
                                                <CardHeader>
                                                    <CardTitle className="text-red-500">Error</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-red-500">{result.error}</p>
                                                    {result.details && (
                                                        <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-64 text-xs mt-2">
                                                            {result.details}
                                                        </pre>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )}
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
