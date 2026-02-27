import React from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Calendar, AlertCircle, ExternalLink } from "lucide-react";

interface Response {
    id: string;
    sessionId: string;
    status: string;
    answers: any[];
    submittedAt: string;
    error?: string;
    confirmationUrl?: string;
}

interface ResponsesListProps {
    responses: Response[];
    loading: boolean;
}

export const ResponsesList: React.FC<ResponsesListProps> = ({ responses, loading }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="w-8 h-8 border-2 border-t-[#6E8BFF] border-gray-800 rounded-full animate-spin mb-4" />
                <p className="text-sm">Loading responses...</p>
            </div>
        );
    }

    if (responses.length === 0) {
        return (
            <div className="border border-dashed border-gray-800 rounded-xl p-12 text-center bg-black/20">
                <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-4" />
                <h3 className="text-white font-medium mb-1">No responses yet</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                    Share your form to start collecting conversational data from your users.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {responses.map((resp) => (
                <div
                    key={resp.id}
                    className="bg-[#0f0f14] border border-gray-800 rounded-xl overflow-hidden transition-all hover:border-gray-700"
                >
                    <div className="p-4 border-b border-gray-800/50 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${resp.status === 'SUCCESS' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(resp.submittedAt), { addSuffix: true })}
                                </p>
                                <p className="text-[10px] text-gray-600 font-mono uppercase tracking-wider">
                                    Session: {resp.sessionId.split('-')[0]}...
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${resp.status === 'SUCCESS'
                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}>
                                {resp.status}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 space-y-3">
                        {resp.answers && resp.answers.length > 0 ? (
                            <div className="grid gap-3">
                                {resp.answers.map((ans, idx) => (
                                    <div key={idx} className="group">
                                        <p className="text-[11px] text-gray-500 mb-0.5 group-hover:text-gray-400 transition-colors">
                                            {ans.label}
                                        </p>
                                        <p className="text-sm text-gray-200 bg-black/20 p-2 rounded-lg border border-gray-800/50">
                                            {Array.isArray(ans.value) ? ans.value.join(', ') : ans.value || '—'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-600 italic">No answers collected for this submission.</p>
                        )}

                        {resp.error && (
                            <div className="mt-3 p-3 bg-red-500/5 border border-red-500/10 rounded-lg flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-red-400/80">{resp.error}</p>
                            </div>
                        )}

                        {resp.confirmationUrl && (
                            <a
                                href={resp.confirmationUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-[#6E8BFF] hover:underline mt-2"
                            >
                                <ExternalLink className="w-3 h-3" />
                                View Confirmation
                            </a>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
