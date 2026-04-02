'use client';

import { useState, useEffect, useCallback } from 'react';
import { Expense } from '@/lib/types';
import { TEMPLATES, applyTemplate, outputToCSV, outputToJSON } from '@/lib/exportTemplates';
import {
  INITIAL_DESTINATIONS,
  Destination,
  getHistory,
  addToHistory,
  getSchedules,
  saveSchedules,
  makeSchedule,
  generateShareId,
  buildShareUrl,
  formatRelativeTime,
  getMockAccount,
  HistoryRecord,
  Schedule,
} from '@/lib/cloudExport';
import QRCode from './QRCode';
import {
  X,
  Cloud,
  Zap,
  Clock,
  History,
  Share2,
  Download,
  Check,
  Copy,
  Link,
  RefreshCw,
  Loader2,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Lock,
  ChevronRight,
  CalendarClock,
  Wifi,
  WifiOff,
} from 'lucide-react';

type Tab = 'templates' | 'destinations' | 'schedule' | 'history' | 'share';

interface ExportHubProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'templates', label: 'Templates', Icon: Zap },
  { id: 'destinations', label: 'Destinations', Icon: Cloud },
  { id: 'schedule', label: 'Schedule', Icon: CalendarClock },
  { id: 'history', label: 'History', Icon: History },
  { id: 'share', label: 'Share', Icon: Share2 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ExportHub({ isOpen, onClose, expenses, onToast }: ExportHubProps) {
  const [tab, setTab] = useState<Tab>('templates');

  // Templates tab state
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [exportingTemplate, setExportingTemplate] = useState(false);
  const [lastExported, setLastExported] = useState<string | null>(null);

  // Destinations tab state
  const [destinations, setDestinations] = useState<Destination[]>(INITIAL_DESTINATIONS);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  // Schedule tab state
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newSched, setNewSched] = useState({
    templateId: TEMPLATES[0].id,
    destinationId: 'email',
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    dayOfWeek: 1,
    dayOfMonth: 1,
    time: '09:00',
    format: 'csv' as 'csv' | 'json',
  });

  // History tab state
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // Share tab state
  const [shareId, setShareId] = useState<string | null>(null);
  const [shareExpiry, setShareExpiry] = useState<'never' | '7d' | '30d'>('never');
  const [sharePassword, setSharePassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);

  // Load persisted data when hub opens
  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
      setSchedules(getSchedules());
    }
  }, [isOpen]);

  const activeTemplate = TEMPLATES.find((t) => t.id === selectedTemplate)!;
  const templateOutput = applyTemplate(selectedTemplate, expenses);
  const connectedDests = destinations.filter((d) => d.connected);

  // ── Templates tab ──────────────────────────────────────────────────────────

  async function handleTemplateExport() {
    if (expenses.length === 0) { onToast('No expenses to export', 'error'); return; }
    setExportingTemplate(true);
    await new Promise((r) => setTimeout(r, 800));

    const content = exportFormat === 'csv'
      ? outputToCSV(templateOutput)
      : outputToJSON(templateOutput, activeTemplate.name);
    const ext = exportFormat === 'csv' ? 'csv' : 'json';
    const mime = exportFormat === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json';

    triggerDownload(content, `${templateOutput.filename}.${ext}`, mime);

    const record: HistoryRecord = {
      id: `h_${Date.now().toString(36)}`,
      templateName: activeTemplate.name,
      templateIcon: activeTemplate.icon,
      destination: 'Local Download',
      destinationIcon: '💾',
      format: exportFormat.toUpperCase(),
      recordCount: templateOutput.recordCount,
      fileSizeKb: Math.max(1, Math.round(content.length / 1024)),
      timestamp: new Date().toISOString(),
      status: 'success',
    };
    addToHistory(record);
    setHistory((prev) => [record, ...prev]);
    setLastExported(activeTemplate.id);
    setExportingTemplate(false);
    onToast(`${activeTemplate.name} exported — ${templateOutput.recordCount} records`);
    setTimeout(() => setLastExported(null), 3000);
  }

  // ── Destinations tab ───────────────────────────────────────────────────────

  async function handleConnect(dest: Destination) {
    if (dest.connected) {
      setDestinations((prev) =>
        prev.map((d) => d.id === dest.id ? { ...d, connected: false, accountLabel: undefined, lastSync: undefined } : d)
      );
      onToast(`Disconnected from ${dest.name}`, 'info');
      return;
    }
    setConnectingId(dest.id);
    await new Promise((r) => setTimeout(r, dest.oauthSimDelay));
    setDestinations((prev) =>
      prev.map((d) =>
        d.id === dest.id
          ? { ...d, connected: true, accountLabel: getMockAccount(d.id), lastSync: 'just now' }
          : d
      )
    );
    setConnectingId(null);
    onToast(`Connected to ${dest.name}`, 'success');
  }

  async function handleSendNow(dest: Destination) {
    if (expenses.length === 0) { onToast('No expenses to send', 'error'); return; }
    setSendingId(dest.id);
    await new Promise((r) => setTimeout(r, 1400));

    const record: HistoryRecord = {
      id: `h_${Date.now().toString(36)}`,
      templateName: activeTemplate.name,
      templateIcon: activeTemplate.icon,
      destination: dest.name,
      destinationIcon: dest.icon,
      format: 'CSV',
      recordCount: expenses.length,
      fileSizeKb: Math.max(1, Math.round(expenses.length * 0.08)),
      timestamp: new Date().toISOString(),
      status: 'success',
    };
    addToHistory(record);
    setHistory((prev) => [record, ...prev]);
    setDestinations((prev) =>
      prev.map((d) => d.id === dest.id ? { ...d, lastSync: 'just now' } : d)
    );
    setSendingId(null);
    onToast(`Sent to ${dest.name} — ${expenses.length} records`);
  }

  // ── Schedule tab ───────────────────────────────────────────────────────────

  function handleAddSchedule() {
    const tpl = TEMPLATES.find((t) => t.id === newSched.templateId)!;
    const dest = destinations.find((d) => d.id === newSched.destinationId) ?? destinations[0];
    const sched = makeSchedule(
      tpl.id, tpl.name, tpl.icon,
      dest.id, dest.name, dest.icon,
      newSched.frequency, newSched.time, newSched.format,
      newSched.frequency === 'weekly' ? newSched.dayOfWeek : undefined,
      newSched.frequency === 'monthly' ? newSched.dayOfMonth : undefined,
    );
    const updated = [...schedules, sched];
    setSchedules(updated);
    saveSchedules(updated);
    setShowAddSchedule(false);
    onToast(`Schedule created — ${tpl.name} every ${newSched.frequency}`, 'success');
  }

  function toggleSchedule(id: string) {
    const updated = schedules.map((s) => s.id === id ? { ...s, active: !s.active } : s);
    setSchedules(updated);
    saveSchedules(updated);
  }

  function deleteSchedule(id: string) {
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    saveSchedules(updated);
    onToast('Schedule removed', 'info');
  }

  // ── Share tab ──────────────────────────────────────────────────────────────

  async function handleGenerateLink() {
    if (expenses.length === 0) { onToast('No data to share', 'error'); return; }
    setGeneratingLink(true);
    await new Promise((r) => setTimeout(r, 1000));
    setShareId(generateShareId());
    setGeneratingLink(false);
  }

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onToast('Copy failed — try manually', 'error');
    }
  }

  if (!isOpen) return null;

  const shareUrl = shareId ? buildShareUrl(shareId) : '';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[520px] bg-white shadow-2xl flex flex-col overflow-hidden border-l border-gray-200">

        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
              <Cloud className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm leading-tight">Export Hub</h2>
              <p className="text-xs text-gray-400 leading-tight mt-0.5">
                {expenses.length} records · {connectedDests.length} services connected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-0.5 px-4 py-2.5 border-b border-gray-100 shrink-0 overflow-x-auto scrollbar-hide">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                tab === id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={tab === id ? 2.5 : 2} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content (scrollable) */}
        <div className="flex-1 overflow-y-auto">

          {/* ── TEMPLATES TAB ───────────────────────────────────────────── */}
          {tab === 'templates' && (
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-3">
                  Choose a template optimized for your use case. Each shapes the data differently.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        setSelectedTemplate(tpl.id);
                        setExportFormat(tpl.defaultFormat);
                      }}
                      className={`relative flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                        selectedTemplate === tpl.id
                          ? `border-indigo-400 ${tpl.bgColor}`
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      <span className="text-xl leading-none mt-0.5">{tpl.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-sm font-semibold ${selectedTemplate === tpl.id ? tpl.accentColor : 'text-gray-800'}`}>
                            {tpl.name}
                          </span>
                          {tpl.badge && (
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                              tpl.badge === 'Popular' ? 'bg-amber-100 text-amber-700'
                              : tpl.badge === 'New' ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-violet-100 text-violet-700'
                            }`}>
                              {tpl.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 leading-snug">{tpl.description}</p>
                      </div>
                      {lastExported === tpl.id && (
                        <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {selectedTemplate === tpl.id && lastExported !== tpl.id && (
                        <div className="shrink-0 w-5 h-5 rounded-full border-2 border-indigo-400 bg-white flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-indigo-400" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview stats */}
              {expenses.length > 0 && (
                <div className={`rounded-xl border px-4 py-3 ${activeTemplate.bgColor} ${activeTemplate.borderColor}`}>
                  <p className={`text-xs font-semibold ${activeTemplate.accentColor} mb-2`}>
                    {activeTemplate.icon} {activeTemplate.name} Preview
                  </p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-600">
                      <span className="font-bold text-gray-900">{templateOutput.recordCount}</span> rows
                    </span>
                    <span className="text-gray-600">
                      <span className="font-bold text-gray-900">{templateOutput.headers.length}</span> columns
                    </span>
                    <span className="text-gray-500 truncate">
                      {templateOutput.headers.join(' · ')}
                    </span>
                  </div>
                </div>
              )}

              {/* Format + export */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  {(['csv', 'json'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setExportFormat(f)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all uppercase ${
                        exportFormat === f ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleTemplateExport}
                  disabled={exportingTemplate || expenses.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {exportingTemplate ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Preparing…</>
                  ) : (
                    <><Download className="w-4 h-4" /> Download {exportFormat.toUpperCase()}</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── DESTINATIONS TAB ────────────────────────────────────────── */}
          {tab === 'destinations' && (
            <div className="p-5 space-y-3">
              <p className="text-xs text-gray-500">
                Connect cloud services to send exports directly. Connected services also power scheduled exports.
              </p>

              {destinations.map((dest) => {
                const isConnecting = connectingId === dest.id;
                const isSending = sendingId === dest.id;

                return (
                  <div
                    key={dest.id}
                    className={`rounded-xl border p-4 transition-all ${
                      dest.connected
                        ? `${dest.brandBg} ${dest.brandBorder}`
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl leading-none">{dest.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-800">{dest.name}</span>
                            {dest.isPremium && (
                              <span className="flex items-center gap-0.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                                <Lock className="w-2.5 h-2.5" /> Pro
                              </span>
                            )}
                            <span className={`flex items-center gap-1 text-xs font-medium ${
                              dest.connected ? 'text-emerald-600' : 'text-gray-400'
                            }`}>
                              {dest.connected
                                ? <><Wifi className="w-3 h-3" /> Connected</>
                                : <><WifiOff className="w-3 h-3" /> Not connected</>
                              }
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{dest.tagline}</p>
                          {dest.connected && dest.accountLabel && (
                            <p className="text-xs text-gray-600 mt-1 font-medium">{dest.accountLabel}</p>
                          )}
                          {dest.connected && dest.lastSync && (
                            <p className="text-xs text-gray-400 mt-0.5">Last sync: {dest.lastSync}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => handleConnect(dest)}
                          disabled={isConnecting || !!connectingId || dest.isPremium}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                            dest.connected
                              ? 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                              : dest.isPremium
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                          }`}
                        >
                          {isConnecting ? (
                            <span className="flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" /> Connecting…
                            </span>
                          ) : dest.connected ? (
                            'Disconnect'
                          ) : dest.isPremium ? (
                            'Upgrade'
                          ) : (
                            'Connect'
                          )}
                        </button>
                        {dest.connected && (
                          <button
                            onClick={() => handleSendNow(dest)}
                            disabled={isSending || expenses.length === 0}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            {isSending ? (
                              <><Loader2 className="w-3 h-3 animate-spin" /> Sending…</>
                            ) : (
                              <><RefreshCw className="w-3 h-3" /> Send Now</>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── SCHEDULE TAB ────────────────────────────────────────────── */}
          {tab === 'schedule' && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Recurring exports run automatically and show up in History.
                </p>
                <button
                  onClick={() => setShowAddSchedule((v) => !v)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {/* Add schedule form */}
              {showAddSchedule && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-indigo-700">New Scheduled Export</p>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Template</label>
                      <select
                        value={newSched.templateId}
                        onChange={(e) => setNewSched((s) => ({ ...s, templateId: e.target.value }))}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        {TEMPLATES.map((t) => (
                          <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Destination</label>
                      <select
                        value={newSched.destinationId}
                        onChange={(e) => setNewSched((s) => ({ ...s, destinationId: e.target.value }))}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        {destinations.filter((d) => d.connected && !d.isPremium).map((d) => (
                          <option key={d.id} value={d.id}>{d.icon} {d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Frequency</label>
                      <select
                        value={newSched.frequency}
                        onChange={(e) => setNewSched((s) => ({ ...s, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' }))}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Time</label>
                      <input
                        type="time"
                        value={newSched.time}
                        onChange={(e) => setNewSched((s) => ({ ...s, time: e.target.value }))}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    {newSched.frequency === 'weekly' && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Day of Week</label>
                        <select
                          value={newSched.dayOfWeek}
                          onChange={(e) => setNewSched((s) => ({ ...s, dayOfWeek: Number(e.target.value) }))}
                          className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (
                            <option key={d} value={i}>{d}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {newSched.frequency === 'monthly' && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Day of Month</label>
                        <input
                          type="number"
                          min={1} max={28}
                          value={newSched.dayOfMonth}
                          onChange={(e) => setNewSched((s) => ({ ...s, dayOfMonth: Number(e.target.value) }))}
                          className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Format</label>
                      <select
                        value={newSched.format}
                        onChange={(e) => setNewSched((s) => ({ ...s, format: e.target.value as 'csv' | 'json' }))}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setShowAddSchedule(false)}
                      className="flex-1 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddSchedule}
                      disabled={connectedDests.length === 0}
                      className="flex-1 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Save Schedule
                    </button>
                  </div>
                  {connectedDests.length === 0 && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Connect a destination first
                    </p>
                  )}
                </div>
              )}

              {/* Schedule list */}
              {schedules.length === 0 ? (
                <div className="text-center py-10">
                  <CalendarClock className="w-10 h-10 text-gray-200 mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-gray-500">No schedules yet</p>
                  <p className="text-xs text-gray-400 mt-1">Add one to automate your exports</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {schedules.map((s) => (
                    <div
                      key={s.id}
                      className={`rounded-xl border p-3.5 transition-all ${
                        s.active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-lg leading-none">{s.templateIcon}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{s.templateName}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-gray-500">
                                {s.destinationIcon} {s.destinationName}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-gray-300" />
                              <span className="text-xs text-gray-400 capitalize">{s.frequency}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300" />
                              <span className="text-xs text-gray-400">{s.time}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Next: {new Date(s.nextRun).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => toggleSchedule(s.id)}
                            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                            title={s.active ? 'Pause' : 'Resume'}
                          >
                            {s.active
                              ? <ToggleRight className="w-5 h-5 text-indigo-500" />
                              : <ToggleLeft className="w-5 h-5 text-gray-400" />
                            }
                          </button>
                          <button
                            onClick={() => deleteSchedule(s.id)}
                            className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── HISTORY TAB ─────────────────────────────────────────────── */}
          {tab === 'history' && (
            <div className="p-5 space-y-3">
              <p className="text-xs text-gray-500">
                All exports from this device — manual, scheduled, and cloud-synced.
              </p>

              {history.length === 0 ? (
                <div className="text-center py-10">
                  <History className="w-10 h-10 text-gray-200 mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-gray-500">No exports yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((h) => (
                    <div key={h.id} className="flex items-start gap-3 p-3.5 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                      <div className="flex flex-col items-center gap-0.5 shrink-0 mt-0.5">
                        <span className="text-lg leading-none">{h.templateIcon}</span>
                        <span
                          className={`w-1.5 h-1.5 rounded-full mt-1 ${
                            h.status === 'success' ? 'bg-emerald-400'
                            : h.status === 'failed' ? 'bg-red-400'
                            : 'bg-amber-400'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-800 truncate">{h.templateName}</p>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                              h.status === 'success' ? 'bg-emerald-50 text-emerald-700'
                              : h.status === 'failed' ? 'bg-red-50 text-red-600'
                              : 'bg-amber-50 text-amber-600'
                            }`}
                          >
                            {h.status === 'success' ? '✓ Success' : h.status === 'failed' ? '✕ Failed' : '⏳ Pending'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-gray-500">{h.destinationIcon} {h.destination}</span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">{h.format}</span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">{h.recordCount} records</span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">{h.fileSizeKb} KB</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-400">{formatRelativeTime(h.timestamp)}</p>
                          {h.shareLink && (
                            <button
                              onClick={() => handleCopy(h.shareLink!)}
                              className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600"
                            >
                              <Link className="w-3 h-3" /> Share link
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SHARE TAB ───────────────────────────────────────────────── */}
          {tab === 'share' && (
            <div className="p-5 space-y-5">
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Share your expense data</p>
                <p className="text-xs text-gray-500">
                  Generate a read-only link anyone can open in their browser — no account required.
                </p>
              </div>

              {/* Link generation */}
              {!shareId ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Link className="w-5 h-5 text-indigo-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">No link generated yet</p>
                  <p className="text-xs text-gray-400 mb-4">
                    {expenses.length} records will be included
                  </p>
                  <button
                    onClick={handleGenerateLink}
                    disabled={generatingLink || expenses.length === 0}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 shadow-sm"
                  >
                    {generatingLink ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                    ) : (
                      <><Zap className="w-4 h-4" /> Generate Share Link</>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Link + copy */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <p className="text-xs font-semibold text-emerald-700">Link ready</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-white border border-emerald-200 rounded-lg px-3 py-2 text-gray-600 truncate font-mono">
                        {shareUrl}
                      </code>
                      <button
                        onClick={() => handleCopy(shareUrl)}
                        className={`shrink-0 flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                          copied
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                      </button>
                    </div>
                  </div>

                  {/* QR code */}
                  <div className="flex gap-4 items-start">
                    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                      <QRCode value={shareUrl} size={128} />
                      <p className="text-xs text-gray-400 text-center mt-2">Scan to open</p>
                    </div>

                    {/* Share options */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">Expiry</label>
                        <div className="flex gap-1.5">
                          {(['never', '7d', '30d'] as const).map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setShareExpiry(opt)}
                              className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                shareExpiry === opt
                                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                              }`}
                            >
                              {opt === 'never' ? '∞ Never' : opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">Access</label>
                        <button
                          onClick={() => setSharePassword((v) => !v)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg border transition-all ${
                            sharePassword
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" />
                            {sharePassword ? 'Password protected' : 'Anyone with link'}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${sharePassword ? 'bg-amber-400' : 'bg-gray-300'}`} />
                        </button>
                      </div>

                      <button
                        onClick={() => setShareId(null)}
                        className="w-full py-1.5 text-xs font-medium text-red-500 hover:text-red-600 bg-white border border-gray-200 hover:border-red-200 rounded-lg transition-colors"
                      >
                        Revoke link
                      </button>
                    </div>
                  </div>

                  {/* Share via */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Share via</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Email', icon: '✉️', action: () => onToast('Opening email client…', 'info') },
                        { label: 'Slack', icon: '💬', action: () => onToast('Posting to Slack…', 'info') },
                        { label: 'Copy QR', icon: '📱', action: () => onToast('QR code copied', 'success') },
                      ].map(({ label, icon, action }) => (
                        <button
                          key={label}
                          onClick={action}
                          className="flex flex-col items-center gap-1.5 py-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors text-xs font-medium text-gray-600"
                        >
                          <span className="text-xl">{icon}</span>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Insights card */}
              {history.filter((h) => h.status === 'success').length > 1 && (
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-indigo-700 mb-2">✨ Export Insights</p>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Total exports', value: history.filter((h) => h.status === 'success').length },
                      { label: 'Most used template', value: (() => {
                          const counts: Record<string, number> = {};
                          history.forEach((h) => { counts[h.templateName] = (counts[h.templateName] ?? 0) + 1; });
                          return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
                        })()
                      },
                      { label: 'Records exported', value: history.reduce((s, h) => s + (h.status === 'success' ? h.recordCount : 0), 0) },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-xs text-indigo-600">{label}</span>
                        <span className="text-xs font-bold text-indigo-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </aside>
    </>
  );
}
