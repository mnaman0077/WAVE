"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

const PRODUCTS = [
    { id: "nike-air-max", name: "Nike Air Max 90", price: 129.99, image: "👟" },
    { id: "adidas-ultraboost", name: "Adidas Ultraboost", price: 180.00, image: "🏃" },
    { id: "jordan-1-retro", name: "Air Jordan 1 Retro", price: 170.00, image: "🏀" },
    { id: "yeezy-boost", name: "Yeezy Boost 350", price: 220.00, image: "🔥" },
];

export default function ShopHome() {
    return (
        <div className="min-h-screen bg-white text-black">
            {/* Header */}
            <header className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/shop" className="text-2xl font-bold tracking-tighter">SNEAKER<span className="text-blue-600">HEAD</span></Link>
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                            <ShoppingBag className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <div className="bg-gray-50 py-20 px-6 text-center">
                <h1 className="text-5xl font-extrabold mb-4">New Season Arrivals</h1>
                <p className="text-gray-500 mb-8 text-lg">Exclusive drops. Limited edition. Get them before they're gone.</p>
                <button className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">
                    Shop Now
                </button>
            </div>

            {/* Grid */}
            <main className="max-w-6xl mx-auto px-6 py-16">
                <h2 className="text-2xl font-bold mb-8">Trending Now</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {PRODUCTS.map((product) => (
                        <Link
                            key={product.id}
                            href={`/shop/product/${product.id}`}
                            className="group"
                        >
                            <div className="aspect-square bg-gray-100 rounded-2xl mb-4 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300">
                                {product.image}
                            </div>
                            <h3 className="font-bold text-lg">{product.name}</h3>
                            <p className="text-gray-500">${product.price.toFixed(2)}</p>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
