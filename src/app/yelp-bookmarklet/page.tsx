"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function BookmarkletPage() {
    const [copied, setCopied] = useState(false);

    // The bookmarklet code (minified)
    const bookmarkletCode = `javascript:(function(){const t=document.title;const m=t.match(/^(.+?) - Updated .+ - ([\\d,]+) Photos & ([\\d,]+) Reviews - (.+?) - (.+?) -/);let data={};if(m){data.name=m[1].trim();data.photoCount=m[2].replace(/,/g,'');data.reviewCount=m[3].replace(/,/g,'');const a=m[4].split(',').map(s=>s.trim());if(a.length>=3){data.address=a[0];const l=a[a.length-1];const sm=l.match(/([A-Z]{2})\\s*(\\d{5})?/);if(sm){data.state=sm[1];data.zipCode=sm[2]||'';data.city=a.slice(1,-1).join(', ');}else{data.city=a[1];const sz=a[2].split(' ');data.state=sz[0];data.zipCode=sz[1]||'';}}data.categories=[m[5].trim()];}const og=document.querySelector('meta[property="og:title"]');if(og)data.name=data.name||og.content.replace(' - Yelp','');const desc=document.querySelector('meta[property="og:description"]');if(desc)data.description=desc.content;const img=document.querySelector('meta[property="og:image"]');data.photos=img?[img.content]:[];document.querySelectorAll('script[type="application/ld+json"]').forEach(s=>{try{const j=JSON.parse(s.textContent);if(j['@type']==='Restaurant'||j['@type']==='LocalBusiness'){data.name=data.name||j.name;data.phone=data.phone||j.telephone;data.website=data.website||j.url;if(j.address){data.address=data.address||j.address.streetAddress;data.city=data.city||j.address.addressLocality;data.state=data.state||j.address.addressRegion;data.zipCode=data.zipCode||j.address.postalCode;}if(j.aggregateRating){data.rating=j.aggregateRating.ratingValue;data.reviewCount=data.reviewCount||j.aggregateRating.reviewCount;}if(j.priceRange)data.priceRange=j.priceRange;}}catch(e){}});const json=JSON.stringify(data,null,2);navigator.clipboard.writeText(json).then(()=>{const d=document.createElement('div');d.innerHTML='<div style="position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:999999;font-family:system-ui;font-size:14px;font-weight:600;">✅ Yelp data copied to clipboard!</div>';document.body.appendChild(d);setTimeout(()=>d.remove(),3000);}).catch(()=>alert('Failed to copy. Data:\\n\\n'+json));})();`;

    const copyBookmarklet = () => {
        navigator.clipboard.writeText(bookmarkletCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <div className="pointer-events-none fixed left-4 bottom-1 translate-y-1 text-[clamp(1rem,4vw,3rem)] font-black tracking-[0.12em] text-white/35 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] opacity-50 z-[1]">
                Yelp Bookmarklet
            </div>
            <DashboardLayout title="">
                <div className="relative w-full h-full z-10">
                    <div className="relative z-10 w-full h-full" style={{ transform: "scale(0.9)", transformOrigin: "top center" }}>
                        <div className="h-full overflow-y-auto pr-4" style={{ paddingTop: "5%" }}>
                            <div className="mx-auto max-w-[900px] relative z-20">
                                <div className="mb-6">
                                    <h1 className="text-3xl font-bold mb-2">Yelp Data Extractor Bookmarklet</h1>
                                    <p className="text-muted-foreground">
                                        One-click tool to extract restaurant data from any Yelp page
                                    </p>
                                </div>

                                {/* Installation Instructions */}
                                <Card className="mb-6">
                                    <CardHeader>
                                        <CardTitle>📌 How to Install</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <p className="font-semibold">Step 1: Copy the Bookmarklet Code</p>
                                            <div className="flex gap-2">
                                                <Button onClick={copyBookmarklet} className="flex items-center gap-2">
                                                    {copied ? (
                                                        <>
                                                            <CheckCircle className="h-4 w-4" />
                                                            Copied!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="h-4 w-4" />
                                                            Copy Bookmarklet Code
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-semibold">Step 2: Create a New Bookmark</p>
                                            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                                                <li>Right-click your bookmarks bar</li>
                                                <li>Click "Add page" or "Add bookmark"</li>
                                                <li>Name it: <code className="bg-muted px-2 py-1 rounded">Extract Yelp Data</code></li>
                                                <li>Paste the copied code into the URL/Address field</li>
                                                <li>Save!</li>
                                            </ul>
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <p className="text-sm font-semibold mb-2">💡 Quick Tip:</p>
                                            <p className="text-sm">
                                                You can also drag the button below directly to your bookmarks bar!
                                            </p>
                                            <div className="mt-3">
                                                <a
                                                    href={bookmarkletCode}
                                                    className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 cursor-move"
                                                    onClick={(e) => e.preventDefault()}
                                                >
                                                    🔖 Extract Yelp Data
                                                </a>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    ☝️ Drag this button to your bookmarks bar
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Usage Instructions */}
                                <Card className="mb-6">
                                    <CardHeader>
                                        <CardTitle>🚀 How to Use</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="space-y-2">
                                            <p className="font-semibold">Step 1: Visit a Yelp Restaurant Page</p>
                                            <p className="text-sm text-muted-foreground">
                                                Example: https://www.yelp.com/biz/katzs-delicatessen-new-york
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-semibold">Step 2: Click the Bookmarklet</p>
                                            <p className="text-sm text-muted-foreground">
                                                Click the "Extract Yelp Data" bookmark you just created
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-semibold">Step 3: Data is Copied!</p>
                                            <p className="text-sm text-muted-foreground">
                                                You'll see a green notification. The JSON data is now in your clipboard!
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-semibold">Step 4: Paste into Your App</p>
                                            <p className="text-sm text-muted-foreground">
                                                Go to your restaurant onboarding form and paste the data
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* What Gets Extracted */}
                                <Card className="mb-6">
                                    <CardHeader>
                                        <CardTitle>📊 What Gets Extracted</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-1">
                                                <p className="font-semibold">✅ Restaurant Name</p>
                                                <p className="font-semibold">✅ Rating</p>
                                                <p className="font-semibold">✅ Review Count</p>
                                                <p className="font-semibold">✅ Full Address</p>
                                                <p className="font-semibold">✅ City, State, Zip</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-semibold">✅ Phone Number</p>
                                                <p className="font-semibold">✅ Website</p>
                                                <p className="font-semibold">✅ Price Range</p>
                                                <p className="font-semibold">✅ Categories</p>
                                                <p className="font-semibold">✅ Photos</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Example Output */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>📋 Example Output</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                                            {`{
  "name": "KATZ'S DELICATESSEN",
  "address": "205 E Houston St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10002",
  "phone": "+1-212-254-2246",
  "rating": "4.1",
  "reviewCount": "16733",
  "priceRange": "$$",
  "categories": ["Delis"],
  "photos": ["https://..."],
  "description": "..."
}`}
                                        </pre>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
