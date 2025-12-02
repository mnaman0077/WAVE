"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Server, Activity } from "lucide-react";

export default function Dashboard() {
    const router = useRouter();
    const [projects] = useState([
        { id: "site-alpha", name: "Alpha Store", status: "active", visitors: 12 },
        { id: "site-beta", name: "Beta Services", status: "idle", visitors: 0 },
    ]);

    return (
        <div className="min-h-screen bg-background p-8">
            <header className="mb-12 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground">Manage your active gateways</p>
                </div>
                <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                    <Plus className="w-4 h-4" /> New Project
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        onClick={() => router.push(`/admin/live/${project.id}`)}
                        className="group cursor-pointer bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-secondary rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <Server className="w-6 h-6" />
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                }`}>
                                {project.status.toUpperCase()}
                            </span>
                        </div>

                        <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                        <div className="flex items-center text-muted-foreground text-sm">
                            <Activity className="w-4 h-4 mr-2" />
                            {project.visitors} Active Sessions
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
