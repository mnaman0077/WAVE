"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { db } from "@/lib/firebase";
import { ref, set, push } from "firebase/database";

// Mock Data (In real app, fetch from DB)
const PRODUCTS: Record<string, any> = {
    "nike-air-max": { name: "Nike Air Max 90", price: 129.99, image: "👟", desc: "The original runner." },
    "adidas-ultraboost": { name: "Adidas Ultraboost", price: 180.00, image: "🏃", desc: "Energy return." },
    "jordan-1-retro": { name: "Air Jordan 1 Retro", price: 170.00, image: "🏀", desc: "The classic." },
    "yeezy-boost": { name: "Yeezy Boost 350", price: 220.00, image: "🔥", desc: "Iconic style." },
};

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const product = PRODUCTS[id];

    useEffect(() => {
        // TRACKING: Notify Admin that user is viewing this product
        // In a real implementation, we would use a unique session ID stored in localStorage
        // const sessionId = localStorage.getItem("wave_session_id");
        // if (sessionId) {
        //   update(ref(db, `sessions/${sessionId}`), { currentLocation: `/shop/product/${id}` });
        // }
        console.log(`Tracking: User viewing ${id}`);
    }, [id]);

    if (!product) return <div>Product not found</div>;

    const handleBuy = () => {
        // Redirect to the simulated checkout
        router.push(`/live-demo/checkout?product=${id}`);
    };

    return (
        <div className="min-h-screen bg-white text-black">
            <header className="p-6">
                <button onClick={() => router.back()} className="flex items-center gap-2 hover:text-gray-600">
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="aspect-square bg-gray-100 rounded-3xl flex items-center justify-center text-9xl shadow-inner">
                    {product.image}
                </div>

                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-black mb-2">{product.name}</h1>
                        <p className="text-2xl text-blue-600 font-bold">${product.price.toFixed(2)}</p>
                    </div>

                    <p className="text-gray-600 text-lg leading-relaxed">
                        {product.desc} Experience ultimate comfort and style with the {product.name}.
                        Designed for performance and built for the streets.
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={handleBuy}
                            className="flex-1 bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Buy Now
                        </button>
                    </div>

                    <div className="text-xs text-gray-400 text-center">
                        Free shipping worldwide • 30-day return policy
                    </div>
                </div>
            </main>
        </div>
    );
}
