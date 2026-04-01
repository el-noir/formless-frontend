'use client';
import React, { useState, useEffect } from 'react';
import {
    Loader2, Plus, Trash2, Webhook, Activity, Save,
    Play, Clock, CheckCircle2, XCircle, ChevronRight, AlertCircle,
    RefreshCcw, ShieldCheck, Eye, X, Code, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import {
    getFormAutomations,
    syncFormAutomations,
    testAutomation,
    toggleAutomation,
    getAutomationLogs,
} from '@/lib/api/organizations';
import { formatDistanceToNow } from 'date-fns';

// ─── Types ─────────────────────────────────────────────────────────────────
interface WebhookConfig { url: string; }

interface Automation {
    _id?: string;
    id?: string; // local-only temp id
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
    status: 'SUCCESS' | 'FAILED' | 'RETRYING';
    attemptCount: number;
    httpStatus?: number;
    latencyMs?: number;
    errorMessage?: string;
    createdAt: string;
}

interface TestReceipt {
    success: boolean;
    statusCode: number | null;
    latencyMs: number;
    errorMessage: string | null;
    message: string;
}

interface AutomationPanelProps {
    orgId: string;
    formId: string;
    form: any;
    onUpdate?: (updatedForm: any) => void;
}

// ─── Sample payload for the modal ─────────────────────────────────────────
const buildSamplePayload = (formTitle: string) => ({
    schemaVersion: 'v1',
    event: 'submission.completed',
    timestamp: new Date().toISOString(),
    deliveryId: 'auto_abc123:submission.completed:sub_xyz789',
    form: { id: '<form_id>', title: formTitle || 'My Form' },
    submission: {
        id: '<submission_id>',
        sessionId: '<session_id>',
        submittedAt: new Date().toISOString(),
        progress: 100,
        answers: [
            { fieldId: 'q1', label: 'Full Name', type: 'SHORT_TEXT', value: 'Jane Doe' },
            { fieldId: 'q2', label: 'Email', type: 'EMAIL', value: 'jane@example.com' },
            { fieldId: 'q3', label: 'Satisfaction (1-10)', type: 'SCALE', value: '9' },
        ],
    },
    lead: { name: 'Jane Doe', email: 'jane@example.com' },
});

const EVENTS = [
    { id: 'submission.completed', label: 'Submission Completed', emoji: '✅' },
    { id: 'submission.abandoned', label: 'Leads / Abandoned', emoji: '🔶' },
    { id: 'submission.failed', label: 'Submission Failed', emoji: '❌' },
    { id: 'form.published', label: 'Form Published', emoji: '🚀' },
    { id: 'form.updated', label: 'Form Modified', emoji: '✏️' },
];

// ─── Component ────────────────────────────────────────────────────────────
export function AutomationPanel({ orgId, formId, form }: AutomationPanelProps) {
    const [automations, setAutomations] = useState<Automation[]>([]);
    const [logs, setLogs] = useState<DeliveryLog[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'config' | 'logs'>('config');
    const [isTesting, setIsTesting] = useState<string | null>(null);
    const [testReceipts, setTestReceipts] = useState<Record<string, TestReceipt>>({});
    const [showPayloadModal, setShowPayloadModal] = useState(false);
    const [logFilter, setLogFilter] = useState<{ event: string; status: string }>({ event: '', status: '' });

    useEffect(() => { loadData(); }, [orgId, formId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [autoData, logsData] = await Promise.all([
                getFormAutomations(orgId, formId),
                getAutomationLogs(orgId, formId, { limit: 20 }),
            ]);
            setAutomations(autoData || []);
            setLogs(logsData.logs || []);
        } catch (err: any) {
            toast.error('Failed to load automations');
        } finally {
            setIsLoading(false);
        }
    };

    const refreshLogs = async () => {
        try {
            const data = await getAutomationLogs(orgId, formId, { limit: 20 });
            setLogs(data.logs || []);
        } catch { /* silent */ }
    };

    const handleAddWebhook = () => {
        setAutomations(prev => [...prev, {
            id: `local_${Date.now()}`,
            name: `Webhook ${prev.length + 1}`,
            type: 'webhook',
            secret: '',
            events: ['submission.completed'],
            config: { url: '' },
            enabled: true,
        }]);
    };

    const handleRemove = (idx: number) => {
        setAutomations(prev => prev.filter((_, i) => i !== idx));
    };

    const handleField = (idx: number, field: keyof Automation | 'url', value: any) => {
        setAutomations(prev => {
            const next = [...prev];
            if (field === 'url') next[idx].config.url = value;
            else (next[idx] as any)[field] = value;
            return next;
        });
    };

    const toggleEvent = (idx: number, eventId: string) => {
        setAutomations(prev => {
            const next = [...prev];
            const evts = next[idx].events || [];
            next[idx].events = evts.includes(eventId)
                ? evts.filter(e => e !== eventId)
                : [...evts, eventId];
            return next;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        const valid = automations.filter(a => a.config.url.trim());
        try {
            await syncFormAutomations(orgId, formId, valid);
            toast.success('Automations saved');
            await loadData();
        } catch (err: any) {
            toast.error(err.message || 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggle = async (auto: Automation, idx: number) => {
        if (!auto._id) {
            // Local-only — just flip the in-memory state
            handleField(idx, 'enabled', !auto.enabled);
            return;
        }
        const newVal = !auto.enabled;
        try {
            await toggleAutomation(orgId, formId, auto._id, newVal);
            handleField(idx, 'enabled', newVal);
            toast.success(newVal ? 'Automation enabled' : 'Automation paused');
        } catch (err: any) {
            toast.error(err.message || 'Failed to toggle');
        }
    };

    const handleTest = async (auto: Automation) => {
        if (!auto._id) {
            toast.error('Save automation first before testing');
            return;
        }
        const key = auto._id;
        setIsTesting(key);
        setTestReceipts(prev => ({ ...prev, [key]: undefined! }));
        try {
            const res: TestReceipt = await testAutomation(orgId, formId, auto._id);
            setTestReceipts(prev => ({ ...prev, [key]: res }));
            if (res.success) {
                toast.success(`Delivered in ${res.latencyMs}ms ✓`);
            } else {
                toast.error(res.errorMessage || 'Delivery failed');
            }
            setTimeout(refreshLogs, 1500);
        } catch (err: any) {
            toast.error(err.message || 'Test failed');
        } finally {
            setIsTesting(null);
        }
    };

    // Derive last successful delivery per automation for health badge
    const lastSuccess: Record<string, DeliveryLog> = {};
    logs.forEach(l => {
        if (l.status === 'SUCCESS' && !lastSuccess[l.automationId]) {
            lastSuccess[l.automationId] = l;
        }
    });

    const filteredLogs = logs.filter(l => {
        if (logFilter.event && l.event !== logFilter.event) return false;
        if (logFilter.status && l.status !== logFilter.status.toUpperCase()) return false;
        return true;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
            </div>
        );
    }

    return (
        <>
            {/* ── Payload Modal ── */}
            {showPayloadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl bg-[#0E0E14] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-brand-purple/10 flex items-center justify-center">
                                    <Code className="w-4 h-4 text-brand-purple" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">Sample Payload</h3>
                                    <p className="text-gray-500 text-[10px]">v1 contract — what your endpoint receives</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPayloadModal(false)} className="text-gray-600 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[65vh]">
                            <pre className="text-xs text-emerald-300 font-mono bg-black/40 p-4 rounded-lg border border-gray-800 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                                {JSON.stringify(buildSamplePayload(form?.title), null, 2)}
                            </pre>
                            <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg text-[11px] text-amber-200/60">
                                <strong className="text-amber-400 block mb-1">Verify HMAC Signature (Node.js)</strong>
                                <code className="font-mono text-[10px] block bg-black/30 p-2 rounded">
                                    {`const sig = req.headers['x-zerofill-signature'];\nconst expected = 'sha256=' + crypto\n  .createHmac('sha256', YOUR_SECRET)\n  .update(JSON.stringify(req.body))\n  .digest('hex');\nif (sig !== expected) return res.status(401).end();`}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Main Panel ── */}
            <div className="bg-[#0B0B0F] border border-gray-800/80 rounded-xl overflow-hidden shadow-2xl flex flex-col" style={{ height: 640 }}>

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#111116] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-purple/10 flex items-center justify-center border border-brand-purple/20">
                            <Activity className="w-5 h-5 text-brand-purple" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">Integration Ecosystem</h3>
                            <p className="text-gray-500 text-[11px]">Hardened webhooks · HMAC signing · Delivery logs</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowPayloadModal(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-800 bg-black/30 text-[10px] font-bold text-gray-400 hover:text-brand-purple hover:border-brand-purple/30 transition-all"
                        >
                            <Eye className="w-3 h-3" /> SAMPLE PAYLOAD
                        </button>
                        <div className="flex bg-black/40 p-1 rounded-lg border border-gray-800">
                            <button onClick={() => setActiveTab('config')}
                                className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all ${activeTab === 'config' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                                Configuration
                            </button>
                            <button onClick={() => setActiveTab('logs')}
                                className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all ${activeTab === 'logs' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                                Delivery Logs {logs.length > 0 && <span className="ml-1 opacity-60">({logs.length})</span>}
                            </button>
                        </div>
                        <button onClick={handleSave} disabled={isSaving}
                            className="bg-brand-purple hover:bg-[#0da372] text-white text-[11px] px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-brand-purple/10">
                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            Save
                        </button>
                    </div>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {activeTab === 'config' ? (
                        <>
                            {automations.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-20 h-20 rounded-full bg-gray-900/50 flex items-center justify-center mb-5 border border-gray-800">
                                        <Zap className="w-9 h-9 text-gray-700" />
                                    </div>
                                    <h4 className="text-gray-200 font-bold mb-1.5">No integrations yet</h4>
                                    <p className="text-gray-500 text-xs max-w-[280px] leading-relaxed">
                                        Connect ZeroFill to Zapier, Make, or your own backend with verified webhook delivery.
                                    </p>
                                </div>
                            )}

                            {automations.map((auto, idx) => {
                                const key = auto._id || auto.id || String(idx);
                                const receipt = auto._id ? testReceipts[auto._id] : undefined;
                                const health = auto._id ? lastSuccess[auto._id] : undefined;
                                const isTestingThis = isTesting === auto._id;

                                return (
                                    <div key={key}
                                        className={`relative border rounded-xl p-5 transition-all duration-300 ${auto.enabled ? 'border-gray-800 bg-[#111116]/30' : 'border-gray-800/40 bg-[#111116]/10 opacity-60'}`}>

                                        {/* Card Header */}
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${auto.enabled ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-gray-800/20 border-gray-800'}`}>
                                                    <Webhook className={`w-4 h-4 ${auto.enabled ? 'text-emerald-400' : 'text-gray-600'}`} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={auto.name}
                                                    onChange={e => handleField(idx, 'name', e.target.value)}
                                                    placeholder="Automation name"
                                                    className="bg-transparent border-none p-0 text-gray-200 font-bold text-sm focus:ring-0 placeholder:text-gray-700 w-44"
                                                />
                                                {health && (
                                                    <span className="flex items-center gap-1 text-[9px] text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                                        OK {formatDistanceToNow(new Date(health.createdAt))} ago
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Enable/Disable Toggle */}
                                                <button
                                                    onClick={() => handleToggle(auto, idx)}
                                                    title={auto.enabled ? 'Pause automation' : 'Enable automation'}
                                                    className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors focus:outline-none ${auto.enabled ? 'bg-emerald-500' : 'bg-gray-700'}`}
                                                >
                                                    <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform ${auto.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                                </button>

                                                {/* Test Button */}
                                                <button
                                                    onClick={() => handleTest(auto)}
                                                    disabled={isTestingThis || !auto._id}
                                                    title={!auto._id ? 'Save first to enable testing' : 'Send test payload'}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-brand-purple/40 text-[10px] font-black text-gray-400 hover:text-brand-purple transition-all disabled:opacity-40"
                                                >
                                                    {isTestingThis ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                                    TEST
                                                </button>

                                                <div className="h-4 w-px bg-gray-800" />
                                                <button onClick={() => handleRemove(idx)}
                                                    className="text-gray-600 hover:text-rose-500 p-1.5 rounded-lg transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Test Receipt Banner */}
                                        {receipt && (
                                            <div className={`mb-4 p-3 rounded-lg border flex items-center gap-3 text-[11px] transition-all ${receipt.success
                                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                                                : 'bg-rose-500/5 border-rose-500/20 text-rose-300'}`}>
                                                {receipt.success
                                                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                    : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                                                <div className="flex-1">
                                                    <span className="font-bold">{receipt.message}</span>
                                                    {receipt.statusCode && (
                                                        <span className="ml-2 opacity-60">· HTTP {receipt.statusCode}</span>
                                                    )}
                                                    {receipt.latencyMs > 0 && (
                                                        <span className="ml-2 opacity-60">· {receipt.latencyMs}ms</span>
                                                    )}
                                                </div>
                                                <button onClick={() => setTestReceipts(p => { const n = { ...p }; delete n[auto._id!]; return n; })}
                                                    className="text-current opacity-40 hover:opacity-100"><X className="w-3 h-3" /></button>
                                            </div>
                                        )}

                                        {/* Fields */}
                                        <div className="grid grid-cols-2 gap-4 mb-5">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Payload URL</label>
                                                <input
                                                    type="url"
                                                    value={auto.config.url}
                                                    onChange={e => handleField(idx, 'url', e.target.value)}
                                                    placeholder="https://hooks.zapier.com/..."
                                                    className="w-full bg-black/40 border border-gray-800 rounded-lg px-3 py-2.5 text-[12px] text-white placeholder:text-gray-700 focus:outline-none focus:border-brand-purple/50 transition-all font-mono"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="flex items-center gap-1.5 text-[10px] text-gray-500 font-black uppercase tracking-wider">
                                                    <ShieldCheck className="w-3 h-3" /> HMAC Secret
                                                </label>
                                                <input
                                                    type="password"
                                                    value={auto.secret}
                                                    onChange={e => handleField(idx, 'secret', e.target.value)}
                                                    placeholder="Optional signature secret"
                                                    className="w-full bg-black/40 border border-gray-800 rounded-lg px-3 py-2.5 text-[12px] text-white placeholder:text-gray-700 focus:outline-none focus:border-brand-purple/50 transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Events */}
                                        <div>
                                            <label className="block text-[10px] text-gray-500 font-black uppercase tracking-wider mb-3">Trigger Events</label>
                                            <div className="flex flex-wrap gap-x-5 gap-y-2.5">
                                                {EVENTS.map(ev => {
                                                    const checked = (auto.events || []).includes(ev.id);
                                                    return (
                                                        <label key={ev.id} className="flex items-center gap-2.5 cursor-pointer group">
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() => toggleEvent(idx, ev.id)}
                                                                className="w-4 h-4 rounded border-gray-700 bg-black text-brand-purple focus:ring-brand-purple focus:ring-offset-black"
                                                            />
                                                            <span className={`text-[12px] transition-colors ${checked ? 'text-gray-100 font-semibold' : 'text-gray-500 group-hover:text-gray-400'}`}>
                                                                {ev.emoji} {ev.label}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Add Button */}
                            <button onClick={handleAddWebhook}
                                className="w-full h-20 flex items-center justify-center gap-3 border-2 border-dashed border-gray-800/40 hover:border-brand-purple/40 rounded-xl text-gray-600 hover:text-brand-purple transition-all group">
                                <div className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 group-hover:border-brand-purple/30 flex items-center justify-center">
                                    <Plus className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest opacity-50 group-hover:opacity-100">
                                    Add New Integration
                                </span>
                            </button>

                            {/* Security note */}
                            <div className="p-4 bg-amber-500/[0.04] border border-amber-500/10 rounded-xl flex gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                <div className="text-[11px] text-amber-200/50 leading-relaxed">
                                    <strong className="text-amber-400/80 font-black block mb-0.5">SECURITY NOTE</strong>
                                    Payloads are signed with <code className="opacity-70">SHA256</code> and sent via <code className="opacity-70">X-ZeroFill-Signature</code>.
                                    Click <strong>"SAMPLE PAYLOAD"</strong> above to see the verification code snippet.
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Log Filters */}
                            <div className="flex items-center gap-3 mb-2">
                                <select
                                    value={logFilter.event}
                                    onChange={e => setLogFilter(p => ({ ...p, event: e.target.value }))}
                                    className="bg-black/40 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-brand-purple/40"
                                >
                                    <option value="">All Events</option>
                                    {EVENTS.map(ev => <option key={ev.id} value={ev.id}>{ev.label}</option>)}
                                </select>
                                <select
                                    value={logFilter.status}
                                    onChange={e => setLogFilter(p => ({ ...p, status: e.target.value }))}
                                    className="bg-black/40 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-brand-purple/40"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="success">✅ Success</option>
                                    <option value="failed">❌ Failed</option>
                                    <option value="retrying">🔄 Retrying</option>
                                </select>
                                <div className="flex-1" />
                                <button onClick={refreshLogs}
                                    className="p-2 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors">
                                    <RefreshCcw className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {filteredLogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <Clock className="w-10 h-10 text-gray-800 mb-3" />
                                    <p className="text-gray-500 text-xs">No delivery attempts yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredLogs.map(log => (
                                        <div key={log._id} className="flex items-center justify-between p-3.5 rounded-xl bg-[#111116]/40 border border-gray-800/50 hover:bg-[#111116]/70 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="shrink-0">
                                                    {log.status === 'SUCCESS'
                                                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                        : log.status === 'FAILED'
                                                            ? <XCircle className="w-4 h-4 text-rose-500" />
                                                            : <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-[12px] font-mono font-bold text-gray-300">{log.event}</span>
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' : log.status === 'RETRYING' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-500'}`}>
                                                            {log.status} {log.httpStatus ? `${log.httpStatus}` : ''}
                                                        </span>
                                                        {log.latencyMs != null && (
                                                            <span className="text-[9px] text-gray-600">{log.latencyMs}ms</span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-gray-700 mt-0.5 flex gap-2">
                                                        <span>Attempt {log.attemptCount}</span>
                                                        <span>·</span>
                                                        <span>{formatDistanceToNow(new Date(log.createdAt))} ago</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {log.errorMessage && (
                                                <p className="text-[10px] text-rose-400/70 max-w-[180px] truncate font-mono" title={log.errorMessage}>
                                                    {log.errorMessage}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {logs.length > 0 && (
                                <p className="text-[9px] text-gray-700 text-center mt-4 font-black uppercase tracking-[0.2em]">
                                    Logs retained for 90 days
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
