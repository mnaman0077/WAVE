"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { ref, set, update } from "firebase/database";
import { db } from "@/lib/firebase";

import { PRODUCTS } from "@/lib/products";

export default function ShopHome() {
    useEffect(() => {
        // Session Management
        let sessionId = localStorage.getItem("wave_session_id");
        if (!sessionId) {
            sessionId = Math.random().toString(36).substring(7);
            localStorage.setItem("wave_session_id", sessionId);
        }

        // Initial Tracking
        const updatePresence = async () => {
            // Get IP/Data (Mocking for now, real IP requires an API call or Next.js headers)
            // We'll trust the Admin Panel to read the "Real" IP if it was connected to a real backend, 
            // but for Firebase Client SDK we usually just send metadata.

            update(ref(db, `projects/demo/sessions/${sessionId}`), {
                id: sessionId,
                status: "active",
                currentLocation: "/shop",
                lastActive: Date.now(),
                ua: navigator.userAgent,
                device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? "Mobile" : "Desktop"
            });
        };

        updatePresence();
    }, []);

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
            <main className="max-w-7xl mx-auto px-6 py-16">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold">Trending Now</h2>
                        <p className="text-gray-500 mt-2">Highly sought after items at market-beating prices.</p>
                    </div>
                    <div className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse">
                        FLASHSALE: EXTRA 40% OFF
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {PRODUCTS.map((product) => (
                        <Link
                            key={product.id}
                            href={`/shop/product/${product.id}`}
                            className="group"
                        >
                            <div className="aspect-square bg-gray-100 rounded-2xl mb-4 overflow-hidden relative group-hover:shadow-xl transition-all duration-300">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded shadow-sm">
                                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                </div>
                            </div>
                            <h3 className="font-bold text-sm leading-tight mb-1 truncate">{product.name}</h3>
                            <div className="flex items-center gap-2">
                                <p className="text-red-500 font-bold">${product.price.toFixed(2)}</p>
                                <p className="text-gray-400 text-xs line-through">${product.originalPrice.toFixed(2)}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
