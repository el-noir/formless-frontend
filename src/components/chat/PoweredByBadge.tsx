import Link from 'next/link';

interface PoweredByBadgeProps {
    href?: string;
    isEmbed?: boolean;
}

export function PoweredByBadge({ href, isEmbed = false }: PoweredByBadgeProps) {
    if (!href) return null;

    return (
        <div className="text-center mt-2">
            <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center rounded-full border border-white/10 bg-white/3 px-2.5 py-1 text-[10px] text-gray-500 transition-colors hover:border-white/20 hover:text-gray-300 ${isEmbed ? 'mb-0.5' : ''}`}
            >
                Powered by <span className="ml-1 font-semibold text-gray-400">0Fill</span>
            </Link>
        </div>
    );
}
