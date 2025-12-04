"use client";

import { useMemo } from "react";

interface CardVisualProps {
    cardNumber: string;
    cardHolder: string;
    expiry: string;
    cvv: string;
    focusedField?: string;
}

export default function CardVisual({ cardNumber, cardHolder, expiry, cvv, focusedField }: CardVisualProps) {
    // Determine card type based on number
    const cardType = useMemo(() => {
        if (cardNumber.startsWith("4")) return "visa";
        if (cardNumber.startsWith("5")) return "mastercard";
        return "default";
    }, [cardNumber]);

    const bgGradient = cardType === "visa"
        ? "from-blue-700 to-blue-900"
        : cardType === "mastercard"
            ? "from-orange-700 to-red-900"
            : "from-gray-700 to-gray-900";

    return (
        <div className="perspective-1000 w-full max-w-[400px] mx-auto h-[250px] relative transition-transform duration-700">
            <div className={`relative w-full h-full rounded-2xl shadow-2xl bg-gradient-to-br ${bgGradient} text-white p-8 overflow-hidden transition-all duration-500 transform ${focusedField === 'cvv' ? 'rotate-y-180' : ''}`}>

                {/* Chip */}
                <div className="w-12 h-9 bg-yellow-400/80 rounded-md mb-8 relative overflow-hidden">
                    <div className="absolute inset-0 border border-yellow-600/50 rounded-md"></div>
                    <div className="absolute top-1/2 left-0 w-full h-px bg-yellow-600/50"></div>
                    <div className="absolute left-1/2 top-0 h-full w-px bg-yellow-600/50"></div>
                </div>

                {/* Number */}
                <div className="mb-6">
                    <div className="text-2xl font-mono tracking-widest drop-shadow-md h-8">
                        {cardNumber || "#### #### #### ####"}
                    </div>
                </div>

                {/* Bottom Info */}
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-xs text-white/70 uppercase mb-1">Card Holder</div>
                        <div className="font-medium tracking-wider uppercase truncate max-w-[200px]">
                            {cardHolder || "FULL NAME"}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-white/70 uppercase mb-1">Expires</div>
                        <div className="font-mono tracking-wider">
                            {expiry || "MM/YY"}
                        </div>
                    </div>
                </div>

                {/* Logo Overlay */}
                <div className="absolute top-6 right-8 text-2xl font-bold italic opacity-80">
                    {cardType === "visa" && "VISA"}
                    {cardType === "mastercard" && "Mastercard"}
                    {cardType === "default" && "BANK"}
                </div>
            </div>
        </div>
    );
}
