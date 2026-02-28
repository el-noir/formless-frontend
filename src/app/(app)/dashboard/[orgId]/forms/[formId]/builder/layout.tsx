// Full-screen layout — overrides the dashboard shell (no sidebar/topbar)
export default function BuilderLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 bg-[#0B0B0F] z-50 flex flex-col overflow-hidden">
            {children}
        </div>
    );
}
