import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-8 p-8 text-center">
            <h1 className="text-4xl font-bold tracking-tighter">WAVE Payment Sim</h1>
            <p className="text-muted-foreground max-w-md">
                Select a portal to enter.
            </p>
            <div className="flex gap-4">
                <Link
                    href="/admin"
                    className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                >
                    Admin Panel
                </Link>
                <Link
                    href="/site1/checkout"
                    className="px-6 py-3 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground font-medium transition-colors"
                >
                    Customer Checkout
                </Link>
            </div>
        </div>
    );
}
