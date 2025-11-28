"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function EzCaterDesignExtractorPage() {
    const [copied, setCopied] = useState(false);

    // Bookmarklet to extract design layout from ezCater search results
    const bookmarkletCode = `javascript:(function(){const restaurants=[];document.querySelectorAll('[data-testid="search-result-card"], .search-result, [class*="SearchResult"]').forEach((card,index)=>{const data={index:index+1,name:'',cuisine:'',rating:'',reviewCount:'',priceRange:'',deliveryFee:'',minimumOrder:'',image:'',link:''};const nameEl=card.querySelector('h2, h3, [class*="name"], [data-testid*="name"]');if(nameEl)data.name=nameEl.textContent.trim();const cuisineEl=card.querySelector('[class*="cuisine"], [class*="category"]');if(cuisineEl)data.cuisine=cuisineEl.textContent.trim();const ratingEl=card.querySelector('[class*="rating"], [aria-label*="star"]');if(ratingEl)data.rating=ratingEl.textContent.trim()||ratingEl.getAttribute('aria-label');const reviewEl=card.querySelector('[class*="review"]');if(reviewEl)data.reviewCount=reviewEl.textContent.trim();const priceEl=card.querySelector('[class*="price-range"], [class*="pricing"]');if(priceEl)data.priceRange=priceEl.textContent.trim();const deliveryEl=card.querySelector('[class*="delivery"], [class*="fee"]');if(deliveryEl)data.deliveryFee=deliveryEl.textContent.trim();const minEl=card.querySelector('[class*="minimum"]');if(minEl)data.minimumOrder=minEl.textContent.trim();const imgEl=card.querySelector('img');if(imgEl)data.image=imgEl.src;const linkEl=card.querySelector('a[href*="/catering/"]');if(linkEl)data.link=linkEl.href;restaurants.push(data);});const layout={totalResults:restaurants.length,pageNumber:new URLSearchParams(window.location.search).get('page')||'1',searchUrl:window.location.href,restaurants:restaurants};const json=JSON.stringify(layout,null,2);navigator.clipboard.writeText(json).then(()=>{const d=document.createElement('div');d.innerHTML='<div style="position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:999999;font-family:system-ui;font-size:14px;font-weight:600;">✅ Extracted '+restaurants.length+' restaurants!</div>';document.body.appendChild(d);setTimeout(()=>d.remove(),3000);}).catch(()=>alert('Extracted '+restaurants.length+' restaurants!\\n\\nData copied to clipboard'));})();`;

    const copyBookmarklet = () => {
        navigator.clipboard.writeText(bookmarkletCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <div className={"pointer-events-none fixed left-4 bottom-1 translate-y-1 text-[clamp(1rem,4vw,3rem)] font-black tracking-[0.12em] text-white/35 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] opacity-50 z-[1]"}>
                ezCater Design Extractor
            </div>
            <DashboardLayout title="">
                <div className={"relative w-full h-full z-10"}>
                    <div className={"relative z-10 w-full h-full"} style={{ transform: "scale(0.9)", transformOrigin: "top center" }}>
                        <div className={"h-full overflow-y-auto pr-4"} style={{ paddingTop: "5%" }}>
                            <div className={"mx-auto max-w-[900px] relative z-20"}>
                                <div className={"mb-6"}>
                                    <h1 className={"text-3xl font-bold mb-2"}>ezCater Search Results Extractor</h1>
                                    <p className={"text-muted-foreground"}>
                                        Extract restaurant cards from ezCater search results pages
                                    </p>
                                </div>

                                {/* What it extracts */}
                                <Card className={"mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"}>
                                    <CardHeader>
                                        <CardTitle className={"text-blue-700 dark:text-blue-400"}>📊 What This Extracts</CardTitle>
                                    </CardHeader>
                                    <CardContent className={"text-sm space-y-2"}>
                                        <p>✅ Restaurant names</p>
                                        <p>✅ Cuisine types</p>
                                        <p>✅ Ratings & review counts</p>
                                        <p>✅ Price ranges</p>
                                        <p>✅ Delivery fees</p>
                                        <p>✅ Minimum orders</p>
                                        <p>✅ Restaurant images</p>
                                        <p>✅ Links to restaurant pages</p>
                                        <p className={"text-blue-700 dark:text-blue-400 font-semibold mt-2"}>Perfect for batch processing! 🚀</p>
                                    </CardContent>
                                </Card>

                                {/* Installation */}
                                <Card className={"mb-6"}>
                                    <CardHeader>
                                        <CardTitle>📌 Installation</CardTitle>
                                    </CardHeader>
                                    <CardContent className={"space-y-4"}>
                                        <div className={"flex gap-2"}>
                                            <Button onClick={copyBookmarklet} className={"flex items-center gap-2"}>
                                                {copied ? (
                                                    <>
                                                        <CheckCircle className={"h-4 w-4"} />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className={"h-4 w-4"} />
                                                        Copy Bookmarklet
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        <div className={"bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800"}>
                                            <p className={"text-sm mb-2"}>
                                                <strong>Quick Install:</strong> Drag to bookmarks bar
                                            </p>
                                            <a
                                                href={bookmarkletCode}
                                                className={"inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 cursor-move"}
                                                onClick={(e) => e.preventDefault()}
                                            >
                                                🔖 Extract ezCater Search Results
                                            </a>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Usage */}
                                <Card className={"mb-6"}>
                                    <CardHeader>
                                        <CardTitle>🚀 How to Use</CardTitle>
                                    </CardHeader>
                                    <CardContent className={"space-y-3"}>
                                        <ol className={"list-decimal list-inside space-y-2 text-sm"}>
                                            <li>Go to ezCater search results page (like the URL you shared)</li>
                                            <li>Click the bookmarklet</li>
                                            <li>See notification with restaurant count</li>
                                            <li>Paste JSON data - all restaurants extracted!</li>
                                        </ol>

                                        <div className={"bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 mt-4"}>
                                            <p className={"text-sm font-semibold"}>💡 Batch Processing!</p>
                                            <p className={"text-sm"}>Extract 10-20 restaurants per page, then move to next page and repeat!</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Example */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>📋 Expected Output</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <pre className={"bg-muted p-4 rounded-lg overflow-auto max-h-96 text-xs"}>
                                            {`{
  "totalResults": 15,
  "pageNumber": "2",
  "searchUrl": "https://www.ezcater.com/catering/search/...",
  "restaurants": [
    {
      "index": 1,
      "name": "La Madeleine Bakery & Cafe",
      "cuisine": "Breakfast, Sandwiches, Bakery",
      "rating": "4.8",
      "reviewCount": "198 reviews",
      "priceRange": "$$",
      "deliveryFee": "$9.99",
      "minimumOrder": "$50",
      "image": "https://...",
      "link": "https://www.ezcater.com/catering/..."
    },
    {
      "index": 2,
      "name": "Another Restaurant",
      "cuisine": "Italian",
      "rating": "4.5",
      "reviewCount": "120 reviews",
      "priceRange": "$$$",
      "deliveryFee": "$12.99",
      "minimumOrder": "$75",
      "image": "https://...",
      "link": "https://www.ezcater.com/catering/..."
    }
    // ... all restaurants on the page
  ]
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
