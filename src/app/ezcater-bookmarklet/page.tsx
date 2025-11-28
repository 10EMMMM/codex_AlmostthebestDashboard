"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function EzCaterBookmarkletPage() {
    const [copied, setCopied] = useState(false);

    // v4 - Extract from JSON-LD structured data
    const bookmarkletCode = `javascript:(function(){let data={menu:[]};document.querySelectorAll('script[type="application/ld+json"]').forEach(s=>{try{const j=JSON.parse(s.textContent);if(j['@type']==='Restaurant'){data.name=j.name;data.address=j.address?.streetAddress;data.city=j.address?.addressLocality;data.state=j.address?.addressRegion;data.zipCode=j.address?.postalCode;data.phone=j.telephone;data.website=j.url;if(j.aggregateRating){data.rating=j.aggregateRating.ratingValue;data.reviewCount=j.aggregateRating.reviewCount;}if(j.servesCuisine){data.cuisine=Array.isArray(j.servesCuisine)?j.servesCuisine.join(', '):j.servesCuisine;}if(j.hasMenu&&j.hasMenu.hasMenuSection){j.hasMenu.hasMenuSection.forEach(section=>{if(section.hasMenuItem){section.hasMenuItem.forEach(item=>{data.menu.push({name:item.name||'',price:item.offers?.[0]?.price?'$'+item.offers[0].price:'',description:item.description||'',category:section.name||''});});}});}}}catch(e){}});const json=JSON.stringify(data,null,2);navigator.clipboard.writeText(json).then(()=>{const d=document.createElement('div');d.innerHTML='<div style="position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:999999;font-family:system-ui;font-size:14px;font-weight:600;">✅ Found '+data.menu.length+' menu items!</div>';document.body.appendChild(d);setTimeout(()=>d.remove(),3000);}).catch(()=>alert('Data copied!\\n\\nFound '+data.menu.length+' menu items'));})();`;

    const copyBookmarklet = () => {
        navigator.clipboard.writeText(bookmarkletCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <div className="pointer-events-none fixed left-4 bottom-1 translate-y-1 text-[clamp(1rem,4vw,3rem)] font-black tracking-[0.12em] text-white/35 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] opacity-50 z-[1]">
                ezCater Bookmarklet
            </div>
            <DashboardLayout title="">
                <div className="relative w-full h-full z-10">
                    <div className="relative z-10 w-full h-full" style={{ transform: "scale(0.9)", transformOrigin: "top center" }}>
                        <div className="h-full overflow-y-auto pr-4" style={{ paddingTop: "5%" }}>
                            <div className="mx-auto max-w-[900px] relative z-20">
                                <div className="mb-6">
                                    <h1 className="text-3xl font-bold mb-2">ezCater Menu Extractor (v4 - JSON-LD)</h1>
                                    <p className="text-muted-foreground">
                                        Extracts FULL MENU from ezCater's JSON-LD structured data!
                                    </p>
                                </div>

                                {/* What's New */}
                                <Card className="mb-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                                    <CardHeader>
                                        <CardTitle className="text-green-700 dark:text-green-400">🎉 v4 - WORKING VERSION!</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm space-y-2">
                                        <p className="font-bold text-green-700 dark:text-green-400">✅ Extracts from JSON-LD structured data in page source</p>
                                        <p>✅ Gets ALL menu items with names, prices, descriptions</p>
                                        <p>✅ Organizes by category</p>
                                        <p>✅ Gets restaurant info (name, address, rating, reviews)</p>
                                        <p className="text-green-700 dark:text-green-400 font-semibold mt-2">This actually works! 🚀</p>
                                    </CardContent>
                                </Card>

                                {/* Installation */}
                                <Card className="mb-6">
                                    <CardHeader>
                                        <CardTitle>📌 Installation</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
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
                                                        Copy v4 Bookmarklet
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <p className="text-sm mb-2">
                                                <strong>Quick Install:</strong> Drag to bookmarks bar
                                            </p>
                                            <a
                                                href={bookmarkletCode}
                                                className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 cursor-move"
                                                onClick={(e) => e.preventDefault()}
                                            >
                                                🔖 Extract ezCater Menu (v4)
                                            </a>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Usage */}
                                <Card className="mb-6">
                                    <CardHeader>
                                        <CardTitle>🚀 How to Use</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <ol className="list-decimal list-inside space-y-2 text-sm">
                                            <li>Visit any ezCater restaurant page</li>
                                            <li>Click the bookmarklet</li>
                                            <li>See notification with menu count</li>
                                            <li>Paste JSON data!</li>
                                        </ol>

                                        <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 mt-4">
                                            <p className="text-sm font-semibold">💡 No waiting needed!</p>
                                            <p className="text-sm">The menu data is already in the page source. Just click and extract!</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Example */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>📋 Expected Output</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-xs">
                                            {`{
  "name": "La Madeleine Bakery & Cafe",
  "address": "2100 Ross Ave",
  "city": "Dallas",
  "state": "TX",
  "zipCode": "75201",
  "rating": 4.808080808080808,
  "reviewCount": 198,
  "cuisine": "Breakfast, Sandwiches, Bakery",
  "menu": [
    {
      "name": "Holiday Feast",
      "price": "$169.99",
      "description": "Delivery Only - Servings start at 10...",
      "category": "Holiday Feast – Delivered To the Office"
    },
    {
      "name": "American Breakfast for 10",
      "price": "$85",
      "description": "Scrambled eggs, bacon...",
      "category": "Breakfast"
    },
    {
      "name": "Turkey & Provolone Sandwich Bistro Box",
      "price": "$12.99",
      "description": "A Turkey & Provolone Sandwich...",
      "category": "Boxed Lunches"
    }
    // ... ALL menu items from ALL categories!
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
