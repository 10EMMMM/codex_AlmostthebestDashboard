"use client";

import { useState } from "react";
import { Search, MapPin, Calendar, Users, Star, DollarSign, Truck, Heart } from "lucide-react";
import { motion } from "framer-motion";

// Mock restaurant data
const MOCK_RESTAURANTS = [
    {
        id: 1,
        name: "Salad Station",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
        cuisine: "Healthy, Salads",
        rating: 4.9,
        reviews: 232,
        distance: 13.6,
        deliveryFee: 20,
        minimumOrder: 75,
        priceRange: 2,
        isRockstar: false,
        badges: ["New"],
    },
    {
        id: 2,
        name: "La Madeleine Bakery & Cafe",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
        cuisine: "French, Bakery",
        rating: 4.8,
        reviews: 198,
        distance: 0.7,
        deliveryFee: 5,
        minimumOrder: 50,
        priceRange: 2,
        isRockstar: false,
        badges: [],
    },
    {
        id: 3,
        name: "Taco Joint",
        image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop",
        cuisine: "Mexican, Tacos",
        rating: 4.9,
        reviews: 1151,
        distance: 1.8,
        deliveryFee: 30,
        minimumOrder: 50,
        priceRange: 2,
        isRockstar: true,
        badges: ["Reliability Rockstar"],
    },
    {
        id: 4,
        name: "Corner Bakery Cafe",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
        cuisine: "American, Breakfast",
        rating: 4.9,
        reviews: 802,
        distance: 0.7,
        deliveryFee: 25,
        minimumOrder: 75,
        priceRange: 2,
        isRockstar: false,
        badges: [],
    },
    {
        id: 5,
        name: "Flower Child",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
        cuisine: "Healthy, Vegan Options",
        rating: 4.9,
        reviews: 167,
        distance: 1.3,
        deliveryFee: 30,
        minimumOrder: 100,
        priceRange: 3,
        isRockstar: true,
        badges: ["Reliability Rockstar"],
    },
    {
        id: 6,
        name: "Jason's Deli",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
        cuisine: "Deli, Sandwiches",
        rating: 4.8,
        reviews: 419,
        distance: 0.3,
        deliveryFee: 35,
        minimumOrder: 50,
        priceRange: 2,
        isRockstar: false,
        badges: [],
    },
];

const CUISINES = [
    { name: "Asian", icon: "🍜" },
    { name: "BBQ", icon: "🍖" },
    { name: "Breakfast", icon: "🥐" },
    { name: "Healthy", icon: "🥗" },
    { name: "Italian", icon: "🍝" },
    { name: "Mediterranean", icon: "🫒" },
    { name: "Mexican", icon: "🌮" },
    { name: "Pizza", icon: "🍕" },
    { name: "Sandwiches", icon: "🥪" },
    { name: "Desserts", icon: "🍰" },
];

const SEASONAL_SPECIALS = [
    {
        id: 1,
        name: "Twisted Root Burger Co",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=200&fit=crop",
        rating: 4.8,
        distance: 0.8,
        deliveryFee: 30,
    },
    {
        id: 2,
        name: "Longhorn Catering",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=200&fit=crop",
        rating: 4.9,
        distance: 2,
        deliveryFee: 35,
    },
    {
        id: 3,
        name: "Taco Cabana",
        image: "https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=400&h=200&fit=crop",
        rating: 4.8,
        distance: 3,
        deliveryFee: 30,
    },
    {
        id: 4,
        name: "Edible Arrangements",
        image: "https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=400&h=200&fit=crop",
        rating: 4.7,
        distance: 0.6,
        deliveryFee: 15,
    },
];

export default function RestaurantSearchPrototype() {
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
    const [favorites, setFavorites] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState("");



    const toggleCuisine = (cuisine: string) => {
        setSelectedCuisines((prev) =>
            prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]
        );
    };

    const toggleFavorite = (id: number) => {
        setFavorites((prev) =>
            prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
        );
    };

    const filteredRestaurants = MOCK_RESTAURANTS.filter((restaurant) => {
        const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCuisine = selectedCuisines.length === 0 ||
            selectedCuisines.some((cuisine) => restaurant.cuisine.includes(cuisine));
        return matchesSearch && matchesCuisine;
    });

    return (
        <div className="min-h-screen bg-[#f4f7f8] dark:from-slate-900 dark:to-slate-800">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <h1 className="text-[32px] font-normal bg-gradient-to-r from-[#3e90d6] to-[#1e70bf] bg-clip-text text-transparent">
                                RestaurantHub
                            </h1>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-2xl mx-8">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search restaurants & cuisines"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-full border border-[#ced4d9] dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3e90d6] focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <button className="px-4 py-2 text-[14px] font-normal text-slate-700 dark:text-slate-300 hover:text-[#3e90d6] dark:hover:text-[#3e90d6] transition-colors">
                                Sign In
                            </button>
                            <button className="px-6 py-2 text-[14px] font-bold text-white bg-[#3e90d6] hover:bg-[#316da1] active:bg-[#2b608e] rounded-[4px] shadow-sm hover:shadow-md transition-all">
                                Sign Up
                            </button>
                        </div>
                    </div>

                    {/* Event Details Bar */}
                    <div className="flex items-center gap-4 pb-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-[14px]">
                            <MapPin className="h-4 w-4 text-[#3e90d6]" />
                            <span className="font-medium">Dallas, TX</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-[14px]">
                            <Calendar className="h-4 w-4 text-[#3e90d6]" />
                            <span className="font-medium">Anytime</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-[14px]">
                            <Users className="h-4 w-4 text-[#3e90d6]" />
                            <span className="font-medium">Event details</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Cuisine Filter */}
            <div className="sticky top-20 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {CUISINES.map((cuisine) => (
                            <motion.button
                                key={cuisine.name}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleCuisine(cuisine.name)}
                                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-[6px] border-2 transition-all min-w-[80px] ${selectedCuisines.includes(cuisine.name)
                                    ? "border-[#3e90d6] bg-[#ebf7ff] dark:bg-[#3e90d6]/20"
                                    : "border-[#ced4d9] dark:border-slate-700 hover:border-[#c1def4] dark:hover:border-[#3e90d6]"
                                    }`}
                            >
                                <span className="text-2xl">{cuisine.icon}</span>
                                <span className="text-xs font-medium whitespace-nowrap">{cuisine.name}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Seasonal Specials Carousel */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div>
                        <h2 className="text-[20px] font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                            Seasonal Specials
                        </h2>
                        <p className="text-[16px] text-slate-600 dark:text-slate-400 mt-1">
                            A taste of the holidays for year-end events
                        </p>
                    </div>

                    {/* Carousel - Responsive Grid */}
                    <div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(368px, 100%), 1fr))' }}
                    >
                        {SEASONAL_SPECIALS.map((special, index) => (
                            <motion.div
                                key={special.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group cursor-pointer"
                            >
                                <div className="relative h-[130px] rounded-[6px] overflow-hidden">
                                    <img
                                        src={special.image}
                                        alt={special.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                    {/* Content Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                        <h3 className="text-[18px] font-bold mb-2">{special.name}</h3>
                                        <div className="flex items-center gap-4 text-[14px]">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-semibold">{special.rating}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{special.distance} mi</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Truck className="h-4 w-4" />
                                                <span>${special.deliveryFee} fee</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-8 py-8">
                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-[14px] text-slate-600 dark:text-slate-400">
                        Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{filteredRestaurants.length}</span> restaurants
                        {selectedCuisines.length > 0 && (
                            <span> in <span className="font-semibold text-[#3e90d6]">{selectedCuisines.join(", ")}</span></span>
                        )}
                    </p>
                </div>

                {/* Restaurant Grid - ezCater Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(368px, 100%), 1fr))" }}>
                    {filteredRestaurants.map((restaurant, index) => (
                        <motion.div
                            key={restaurant.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative bg-transparent dark:bg-transparent rounded-[6px] overflow-hidden hover:shadow-md transition-all duration-300"
                        >
                            {/* Image - Landscape */}
                            <div className="relative h-[200px] overflow-hidden">
                                <img
                                    src={restaurant.image}
                                    alt={restaurant.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />

                                {/* Favorite Button - Top Right */}
                                <button
                                    onClick={() => toggleFavorite(restaurant.id)}
                                    className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-800/90 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-all"
                                >
                                    <Heart
                                        className={`h-5 w-5 ${favorites.includes(restaurant.id)
                                            ? "fill-red-500 text-red-500"
                                            : "text-slate-600 dark:text-slate-400"
                                            }`}
                                    />
                                </button>

                                {/* Badges - Top Left */}
                                {restaurant.badges.length > 0 && (
                                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                                        {restaurant.badges.map((badge) => (
                                            <span
                                                key={badge}
                                                className="px-3 py-1 text-xs font-semibold bg-purple-700 text-white rounded-full flex items-center gap-1"
                                            >
                                                <span className="text-white">★</span>
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Content - Below Image */}
                            <div className="p-4">
                                {/* Restaurant Name */}
                                <h3 className="text-[16px] font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-[#3e90d6] dark:group-hover:text-[#3e90d6] transition-colors">
                                    {restaurant.name}
                                </h3>

                                {/* Single Line: Rating + Distance + Delivery Fee */}
                                <div className="flex items-center gap-1 text-[14px] text-slate-600 dark:text-slate-400 mb-2">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-slate-900 text-slate-900 dark:fill-slate-100 dark:text-slate-100" />
                                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                                            {restaurant.rating}
                                        </span>
                                    </div>
                                    <span className="mx-1">·</span>
                                    <span>{restaurant.distance} mi</span>
                                    <span className="mx-1">·</span>
                                    <span>${restaurant.deliveryFee} Delivery fee</span>
                                </div>

                                {/* Rewards Badge - Below Metadata */}
                                {restaurant.isRockstar && (
                                    <div className="inline-block">
                                        <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                                            5x Rewards
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
