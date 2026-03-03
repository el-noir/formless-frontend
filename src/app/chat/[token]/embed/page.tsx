import { ChatClient } from "../ChatClient";

interface PageProps {
    params: Promise<{ token: string }>;
}

export default async function EmbedChatPage({ params }: PageProps) {
    const { token } = await params;

    return (
        <div className="overflow-hidden h-[100dvh]">
            <ChatClient token={token} isEmbed={true} />
        </div>
    );
}
