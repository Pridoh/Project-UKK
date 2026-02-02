import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CircleHelp, TrafficCone } from 'lucide-react';

export default function NotFound() {
    return (
        <>
            <Head title="404 - Page Not Found" />

            <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
                {/* Background blur effects */}
                <div className="pointer-events-none absolute top-0 left-0 -z-10 h-full w-full overflow-hidden">
                    <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-blue-100/40 opacity-60 blur-3xl dark:bg-blue-900/20" />
                    <div className="absolute top-[40%] -right-[10%] h-[40%] w-[40%] rounded-full bg-slate-200/40 opacity-60 blur-3xl dark:bg-slate-800/30" />
                </div>

                <main className="z-10 flex w-full max-w-2xl flex-col items-center text-center">
                    {/* Icon container */}
                    <div className="group relative mb-10">
                        <div className="relative z-10 flex h-64 w-64 items-center justify-center rounded-full bg-card shadow-xl ring-8 shadow-blue-100/50 ring-white/50 dark:shadow-blue-900/20 dark:ring-slate-800/50">
                            {/* Inner circle with decorations */}
                            <div className="absolute inset-4 flex items-end justify-center overflow-hidden rounded-full border border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                                <div className="absolute -right-4 h-[200%] w-20 rotate-45 transform bg-slate-100/50 dark:bg-slate-700/50" />
                            </div>

                            {/* Main floating icon */}
                            <TrafficCone className="animate-float relative z-20 text-orange-500 drop-shadow-lg" size={110} strokeWidth={1.5} />

                            {/* Bouncing badge icon */}
                            <div className="absolute top-12 right-12 z-30 animate-bounce rounded-full bg-card p-1.5 shadow-md">
                                <CircleHelp className="h-7 w-7 text-primary" strokeWidth={2} />
                            </div>
                        </div>

                        {/* Shadow under container */}
                        <div className="absolute -bottom-4 left-1/2 h-8 w-48 -translate-x-1/2 rounded-[100%] bg-blue-900/5 blur-xl dark:bg-blue-500/10" />
                    </div>

                    {/* Text content */}
                    <div className="relative space-y-6">
                        <h1 className="text-9xl leading-none font-extrabold tracking-tight text-foreground">404</h1>

                        <div className="mx-auto max-w-md space-y-3">
                            <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
                            <p className="text-lg leading-relaxed text-muted-foreground">
                                Oops! The page you are looking for has been moved or doesn't exist.
                            </p>
                        </div>

                        {/* Back button */}
                        <div className="pt-8">
                            <Link
                                href={route('dashboard')}
                                className="group inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3.5 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-primary/40"
                            >
                                <ArrowLeft className="mr-2 h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="absolute bottom-6 text-xs font-medium tracking-wide text-muted-foreground">© ParkEazy Systems</footer>
            </div>
        </>
    );
}
