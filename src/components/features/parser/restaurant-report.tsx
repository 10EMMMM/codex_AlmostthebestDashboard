"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

interface RestaurantReportProps {
    data: any;
    source: "yelp" | "ezcater";
}

export function RestaurantReport({ data, source }: RestaurantReportProps) {
    const handlePrint = () => {
        window.print();
    };

    const handleDownloadJSON = () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.name?.replace(/\s+/g, '_')}_${source}_data.json`;
        a.click();
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Action Buttons - Hidden when printing */}
            <div className="flex gap-2 mb-4 print:hidden">
                <Button onClick={handlePrint} variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Report
                </Button>
                <Button onClick={handleDownloadJSON} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download JSON
                </Button>
            </div>

            {/* Report Card */}
            <Card className="print:shadow-none print:border-0">
                <CardContent className="p-8">
                    {/* Header with Logo Placeholder and Location */}
                    <div className="flex justify-between items-start mb-8">
                        {/* Logo/Name Section */}
                        <div className="flex-1">
                            <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-4xl font-bold text-primary">
                                    {data.name?.charAt(0) || "R"}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold">{data.name}</h1>
                        </div>

                        {/* Location Section */}
                        <div className="text-right">
                            <h2 className="text-xl font-semibold mb-2">
                                {data.city}, {data.state}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {data.address}
                                {data.city && data.state && data.zipCode && (
                                    <><br />{data.city}, {data.state} {data.zipCode}</>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column - Details */}
                        <div className="space-y-3">
                            {data.phone && (
                                <div className="flex items-start">
                                    <input type="checkbox" className="mt-1 mr-3" />
                                    <span className="text-sm">Phone: {data.phone}</span>
                                </div>
                            )}

                            {data.website && (
                                <div className="flex items-start">
                                    <input type="checkbox" className="mt-1 mr-3" />
                                    <span className="text-sm">Website: {data.website}</span>
                                </div>
                            )}

                            {data.rating && (
                                <div className="flex items-start">
                                    <input type="checkbox" className="mt-1 mr-3" />
                                    <span className="text-sm">
                                        Rating: {data.rating} ⭐ ({data.reviewCount} Reviews)
                                    </span>
                                </div>
                            )}

                            {data.cuisine && (
                                <div className="flex items-start">
                                    <input type="checkbox" className="mt-1 mr-3" />
                                    <span className="text-sm">Cuisine: {data.cuisine}</span>
                                </div>
                            )}

                            {data.priceRange && (
                                <div className="flex items-start">
                                    <input type="checkbox" className="mt-1 mr-3" />
                                    <span className="text-sm">Price Range: {data.priceRange}</span>
                                </div>
                            )}

                            {/* Hours */}
                            {data.hours && data.hours.length > 0 && (
                                <>
                                    <div className="pt-4 border-t">
                                        <h3 className="font-semibold mb-2">Business Hours</h3>
                                    </div>
                                    {data.hours.map((hour: any, i: number) => (
                                        <div key={i} className="flex items-start">
                                            <input type="checkbox" className="mt-1 mr-3" />
                                            <span className="text-sm">
                                                {hour.day}: {hour.closed ? "Closed" : `${hour.opens} - ${hour.closes}`}
                                            </span>
                                        </div>
                                    ))}
                                </>
                            )}

                            {/* Menu Count (ezCater) */}
                            {data.menu && data.menu.length > 0 && (
                                <div className="flex items-start">
                                    <input type="checkbox" className="mt-1 mr-3" />
                                    <span className="text-sm">Menu Items: {data.menu.length}</span>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Map */}
                        <div>
                            {data.mapImage ? (
                                <img
                                    src={data.mapImage}
                                    alt="Location Map"
                                    className="w-full rounded-lg border"
                                />
                            ) : (
                                <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                                    <span className="text-muted-foreground">Map not available</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Menu Items Section (ezCater only) */}
                    {data.menu && data.menu.length > 0 && (
                        <div className="mt-8 pt-8 border-t">
                            <h3 className="text-lg font-semibold mb-4">Menu Items ({data.menu.length})</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.menu.slice(0, 20).map((item: any, i: number) => (
                                    <div key={i} className="text-sm border-b pb-2">
                                        <div className="flex justify-between">
                                            <span className="font-medium">{item.name}</span>
                                            <span className="text-primary">{item.price}</span>
                                        </div>
                                        {item.category && (
                                            <div className="text-xs text-muted-foreground">{item.category}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {data.menu.length > 20 && (
                                <p className="text-sm text-muted-foreground mt-4">
                                    + {data.menu.length - 20} more items (see JSON export)
                                </p>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 pt-4 border-t text-xs text-muted-foreground">
                        <p>Extracted from {source === "yelp" ? "Yelp" : "ezCater"} on {new Date().toLocaleDateString()}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
