import React, { useState, useEffect } from 'react';
import { 
    Loader2, Plus, Trash2, Webhook, Activity, Save, 
    Play, Clock, CheckCircle2, XCircle, ChevronRight, AlertCircle, 
    RefreshCcw, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { 
    getFormAutomations, 
    syncFormAutomations, 
    testAutomation, 
    getAutomationLogs 
} from '@/lib/api/organizations';
import { formatDistanceToNow } from 'date-fns';

interface WebhookConfig {
    url: string;
}

interface Automation {
    _id?: string;
    id?: string; // local temp id
    name: string;
    type: 'webhook';
    secret: string;
    events: string[];
    config: WebhookConfig;
    enabled: boolean;
}

interface DeliveryLog {
    _id: string;
    automationId: string;
    event: string;
    status: 'success' | 'failed' | 'retrying';
    attempts: number;
    statusCode?: number;
    errorMessage?: string;
    createdAt: string;
}

interface AutomationPanelProps {
    orgId: string;
    formId: string;
    form: any;
    onUpdate?: (updatedForm: any) => void;
}

export function AutomationPanel({ orgId, formId, form }: AutomationPanelProps) {
    const [automations, setAutomations] = useState<Automation[]>([]);
    const [logs, setLogs] = useState<DeliveryLog[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'config' | 'logs'>('config');
    const [isTesting, setIsTesting] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [orgId, formId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [autoData, logsData] = await Promise.all([
                getFormAutomations(orgId, formId),
                getAutomationLogs(orgId, formId, { limit: 10 })
            ]);
            setAutomations(autoData || []);
            setLogs(logsData.logs || []);
        } catch (error: any) {
            toast.error('Failed to load automation data');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFetchLogs = async () => {
        try {
            const data = await getAutomationLogs(orgId, formId, { limit: 20 });
            setLogs(data.logs || []);
        } catch (err) {
            console.error('Failed to refresh logs', err);
        }
    };

    const handleAddWebhook = () => {
        const newWebhook: Automation = {
            id: Math.random().toString(36).substr(2, 9),
            name: `Webhook ${automations.length + 1}`,
            type: 'webhook',
            secret: '',
            events: ['submission.completed'],
            config: {
                url: ''
            },
            enabled: true
        };
        setAutomations([...automations, newWebhook]);
    };

    const handleRemoveWebhook = (index: number) => {
        const newAutomations = [...automations];
        newAutomations.splice(index, 1);
        setAutomations(newAutomations);
    };

    const handleUpdateField = (index: number, field: keyof Automation | 'url', value: any) => {
        const newAutomations = [...automations];
        if (field === 'url') {
            newAutomations[index].config.url = value;
        } else {
            (newAutomations[index] as any)[field] = value;
        }
        setAutomations(newAutomations);
    };

    const toggleEvent = (index: number, event: string) => {
        const newAutomations = [...automations];
        const currentEvents = newAutomations[index].events || [];
        if (currentEvents.includes(event)) {
            newAutomations[index].events = currentEvents.filter(e => e !== event);
        } else {
            newAutomations[index].events = [...currentEvents, event];
        }
        setAutomations(newAutomations);
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Clean out empty URLs
        const valid = automations.filter(a => a.config.url.trim() !== '');
        
        try {
            await syncFormAutomations(orgId, formId, valid);
            toast.success('Automations saved');
            await loadData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const handleTest = async (auto: Automation) => {
        if (!auto._id) {
            toast.error('Please save automation before testing');
            return;
        }
        setIsTesting(auto._id);
        try {
            const res = await testAutomation(orgId, formId, auto._id);
            if (res.success) {
                toast.success('Test delivery successful');
            } else {
                toast.error(res.message || 'Test failed');
            }
            // Refresh logs after a short delay
            setTimeout(handleFetchLogs, 2000);
        } catch (error: any) {
            toast.error(error.message || 'Test delivery failed');
        } finally {
            setIsTesting(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
            </div>
        );
    }

    return (
        <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#111116]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-purple/10 flex items-center justify-center border border-brand-purple/20">
                        <Activity className="w-5 h-5 text-brand-purple" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm">Integration Ecosystem</h3>
                        <p className="text-gray-500 text-[11px]">Robust webhooks and automation triggers.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-black/40 p-1 rounded-lg border border-gray-800 mr-2">
                        <button 
                            onClick={() => setActiveTab('config')}
                            className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${activeTab === 'config' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Configuration
                        </button>
                        <button 
                            onClick={() => setActiveTab('logs')}
                            className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${activeTab === 'logs' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Delivery Logs
                        </button>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-brand-purple hover:bg-[#0da372] text-white text-[11px] px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-brand-purple/10"
                    >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {activeTab === 'config' ? (
                    <div className="space-y-6">
                        {automations.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-gray-900/50 flex items-center justify-center mb-4 border border-gray-800">
                                    <Webhook className="w-8 h-8 text-gray-700" />
                                </div>
                                <h4 className="text-gray-300 font-medium mb-1">No automations configured</h4>
                                <p className="text-gray-500 text-xs max-w-[280px]">Connect ZeroFill to Zapier, Make, or your custom internal systems.</p>
                            </div>
                        )}

                        {automations.map((automation, idx) => (
                            <div key={automation.id || automation._id || idx} className="group relative border border-gray-800 rounded-xl p-5 bg-[#111116]/30 hover:bg-[#111116]/50 transition-all duration-300">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                            <Webhook className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <input 
                                            type="text"
                                            value={automation.name}
                                            onChange={(e) => handleUpdateField(idx, 'name', e.target.value)}
                                            placeholder="Automation Name"
                                            className="bg-transparent border-none p-0 text-gray-200 font-semibold text-sm focus:ring-0 placeholder:text-gray-700 w-48"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleTest(automation)}
                                            disabled={isTesting === (automation._id || automation.id) || isSaving}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-brand-purple/40 text-[10px] font-bold text-gray-400 hover:text-brand-purple transition-all disabled:opacity-50"
                                        >
                                            {isTesting === (automation._id || automation.id) ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <Play className="w-3 h-3" />
                                            )}
                                            TEST
                                        </button>
                                        <div className="h-4 w-[1px] bg-gray-800/60" />
                                        <button
                                            onClick={() => handleRemoveWebhook(idx)}
                                            title="Delete Automation"
                                            className="text-gray-600 hover:text-rose-500 p-1.5 rounded-lg transition-colors bg-black/20"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5 mb-5">
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                            Payload URL
                                        </label>
                                        <input
                                            type="url"
                                            value={automation.config.url}
                                            onChange={(e) => handleUpdateField(idx, 'url', e.target.value)}
                                            placeholder="https://hooks.zapier.com/..."
                                            className="w-full bg-black/40 border border-gray-800 rounded-lg px-3 py-2.5 text-[12px] text-white placeholder:text-gray-700 focus:outline-none focus:border-brand-purple/50 focus:bg-black/60 transition-all font-mono"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                            <ShieldCheck className="w-3 h-3" />
                                            HMAC Secret
                                        </label>
                                        <input
                                            type="password"
                                            value={automation.secret}
                                            onChange={(e) => handleUpdateField(idx, 'secret', e.target.value)}
                                            placeholder="Verify authenticity (optional)"
                                            className="w-full bg-black/40 border border-gray-800 rounded-lg px-3 py-2.5 text-[12px] text-white placeholder:text-gray-700 focus:outline-none focus:border-brand-purple/50 focus:bg-black/60 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-3">Trigger Events</label>
                                    <div className="flex flex-wrap gap-x-6 gap-y-3">
                                        {[
                                            { id: 'submission.completed', label: 'Submission Completed' },
                                            { id: 'submission.abandoned', label: 'Leads / Abandoned' },
                                            { id: 'form.published', label: 'Form Published' },
                                            { id: 'form.updated', label: 'Form Modified' }
                                        ].map(ev => (
                                            <label key={ev.id} className="group/item flex items-center gap-2.5 cursor-pointer">
                                                <div className="relative flex items-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={(automation.events || []).includes(ev.id)}
                                                        onChange={() => toggleEvent(idx, ev.id)}
                                                        className="peer w-4 h-4 bg-black border-gray-800 rounded text-brand-purple focus:ring-brand-purple focus:ring-offset-black transition-all"
                                                    />
                                                </div>
                                                <span className={`text-[12px] transition-colors ${automation.events?.includes(ev.id) ? 'text-gray-200 font-medium' : 'text-gray-500 group-hover/item:text-gray-400'}`}>
                                                    {ev.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={handleAddWebhook}
                            className="w-full h-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-800/40 hover:border-brand-purple/40 bg-gray-900/10 hover:bg-brand-purple/[0.02] text-gray-600 hover:text-brand-purple rounded-xl transition-all group"
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 group-hover:border-brand-purple/20 flex items-center justify-center mb-1">
                                <Plus className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100">Add New Integration</span>
                        </button>

                        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                            <div className="text-[11px] text-amber-200/60 leading-relaxed pt-0.5">
                                <strong className="text-amber-400 font-bold block mb-1">PRO TIP: SECURITY</strong>
                                Use the HMAC Secret to verify that payloads come from ZeroFill. We sign the request with <code>SHA256</code> and send it in the <code>X-ZeroFill-Signature</code> header.
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Recent Deliveries</h4>
                            <button 
                                onClick={handleFetchLogs}
                                className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 transition-colors"
                                title="Refresh Logs"
                            >
                                <RefreshCcw className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Clock className="w-10 h-10 text-gray-800 mb-3" />
                                <p className="text-gray-500 text-xs">No delivery attempts recorded yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {logs.map((log) => (
                                    <div key={log._id} className="flex items-center justify-between p-3 rounded-lg bg-[#111116]/40 border border-gray-800/60 hover:bg-[#111116]/60 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="shrink-0">
                                                {log.status === 'success' ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                ) : log.status === 'failed' ? (
                                                    <XCircle className="w-4 h-4 text-rose-500" />
                                                ) : (
                                                    <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[12px] font-mono font-bold text-gray-300">{log.event}</span>
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-black ${
                                                        log.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                                    }`}>
                                                        {log.status} {log.statusCode && `(${log.statusCode})`}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-gray-600 flex items-center gap-2 mt-0.5">
                                                    <span>Attempt {log.attempts}</span>
                                                    <span>•</span>
                                                    <span>{formatDistanceToNow(new Date(log.createdAt))} ago</span>
                                                </div>
                                            </div>
                                        </div>
                                        {log.errorMessage && (
                                            <div className="max-w-[200px] text-right">
                                                <p className="text-[10px] text-rose-400/80 truncate font-mono" title={log.errorMessage}>
                                                    {log.errorMessage}
                                                </p>
                                            </div>
                                        )}
                                        <ChevronRight className="w-4 h-4 text-gray-800 ml-2" />
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {logs.length > 0 && (
                            <p className="text-[9px] text-gray-600 text-center mt-6 uppercase font-bold tracking-[0.2em]">
                                Logs are retained for 90 days.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
