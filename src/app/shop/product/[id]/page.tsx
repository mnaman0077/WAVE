"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { db } from "@/lib/firebase";
import { ref, update } from "firebase/database";

import { PRODUCTS } from "@/lib/products";

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const product = PRODUCTS.find(p => p.id === id);

    useEffect(() => {
        const sessionId = localStorage.getItem("wave_session_id");
        if (sessionId) {
            // Update presence to 'demo' project
            update(ref(db, `projects/demo/sessions/${sessionId}`), {
                id: sessionId,
                status: "active",
                currentLocation: `/shop/product/${id}`,
                lastActive: Date.now()
            });
        }
    }, [id]);

    if (!product) return <div>Product not found</div>;

    const handleBuy = () => {
        // Redirect to the simulated checkout with 'demo' project ID
        router.push(`/demo/checkout?product=${id}`);
    };

    return (
        <div className="min-h-screen bg-white text-black">
            <header className="p-6">
                <Link href="/shop" className="flex items-center gap-2 hover:text-gray-600">
                    <ArrowLeft className="w-5 h-5" /> Back to Shop
                </Link>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden shadow-2xl">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>

                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-black mb-2 leading-tight">{product.name}</h1>
                        <div className="flex items-center gap-4">
                            <p className="text-3xl text-red-600 font-black">${product.price.toFixed(2)}</p>
                            <div className="flex flex-col">
                                <p className="text-gray-400 line-through text-lg font-medium">${product.originalPrice.toFixed(2)}</p>
                                <p className="text-xs text-red-500 font-bold uppercase tracking-wide">40% Off Limited Time</p>
                            </div>
                        </div>
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
        </div >
    );
}
