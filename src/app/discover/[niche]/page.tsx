import Link from 'next/link';

interface PageProps {
    params: Promise<{ niche: string }>;
    searchParams?: Promise<{ source?: string; token?: string; form?: string; org?: string }>;
}

function titleCase(input: string): string {
    return input
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default async function NicheDiscoveryPage({ params, searchParams }: PageProps) {
    const { niche } = await params;
    const query = searchParams ? await searchParams : undefined;

    const readableNiche = titleCase(niche || 'General');
    const source = query?.source || 'badge';

    const ctaUrl = `/?source=${encodeURIComponent(source)}&niche=${encodeURIComponent(niche || 'general')}`;

    return (
        <main className="min-h-screen bg-brand-dark text-white px-6 py-14">
            <div className="max-w-4xl mx-auto">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-400 mb-4">Discover 0Fill</p>
                <h1 className="text-4xl sm:text-5xl font-semibold leading-tight mb-4">
                    Built for {readableNiche} teams who need better conversations.
                </h1>
                <p className="text-gray-300 max-w-2xl text-base sm:text-lg leading-relaxed mb-10">
                    0Fill transforms static forms into guided AI conversations that increase completion rates and capture richer, more actionable answers.
                </p>

                <section className="grid gap-4 sm:grid-cols-3 mb-10">
                    <article className="rounded-xl border border-white/10 bg-white/3 p-5">
                        <h2 className="text-sm font-medium text-emerald-300 mb-2">Higher Completion</h2>
                        <p className="text-sm text-gray-300">Adaptive prompts and context-aware flow reduce drop-off from first question to submit.</p>
                    </article>
                    <article className="rounded-xl border border-white/10 bg-white/3 p-5">
                        <h2 className="text-sm font-medium text-emerald-300 mb-2">Faster Setup</h2>
                        <p className="text-sm text-gray-300">Start from niche templates and launch an embeddable chat flow in minutes.</p>
                    </article>
                    <article className="rounded-xl border border-white/10 bg-white/3 p-5">
                        <h2 className="text-sm font-medium text-emerald-300 mb-2">Actionable Insights</h2>
                        <p className="text-sm text-gray-300">Use AI summaries and sentiment signals to find pain points without manual analysis.</p>
                    </article>
                </section>

                <div className="flex flex-wrap items-center gap-4">
                    <Link
                        href={ctaUrl}
                        className="inline-flex items-center rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
                    >
                        Start Building Free
                    </Link>
                    <p className="text-xs text-gray-500">
                        Attribution: source={source}{query?.form ? `, form=${query.form}` : ''}{query?.org ? `, org=${query.org}` : ''}
                    </p>
                </div>
            </div>
        </main>
    );
}
