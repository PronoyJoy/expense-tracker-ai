// Cloud export: destinations, history, schedules, share links

// ─── Destinations ────────────────────────────────────────────────────────────

export interface Destination {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  brandBg: string;
  brandText: string;
  brandBorder: string;
  connected: boolean;
  accountLabel?: string;
  lastSync?: string;
  isPremium?: boolean;
  oauthSimDelay: number; // ms to simulate OAuth
}

export const INITIAL_DESTINATIONS: Destination[] = [
  {
    id: 'email',
    name: 'Email',
    tagline: 'Send exports to any inbox',
    icon: '✉️',
    brandBg: 'bg-sky-50',
    brandText: 'text-sky-700',
    brandBorder: 'border-sky-200',
    connected: true,
    accountLabel: 'you@example.com',
    lastSync: '2 hours ago',
    oauthSimDelay: 1200,
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    tagline: 'Live sync to a spreadsheet',
    icon: '📊',
    brandBg: 'bg-green-50',
    brandText: 'text-green-700',
    brandBorder: 'border-green-200',
    connected: false,
    oauthSimDelay: 1800,
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    tagline: 'Auto-save to cloud folder',
    icon: '📦',
    brandBg: 'bg-blue-50',
    brandText: 'text-blue-700',
    brandBorder: 'border-blue-200',
    connected: true,
    accountLabel: 'Personal · /Apps/ExpenseTracker',
    lastSync: 'Yesterday',
    oauthSimDelay: 1500,
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    tagline: 'Microsoft 365 integration',
    icon: '☁️',
    brandBg: 'bg-indigo-50',
    brandText: 'text-indigo-700',
    brandBorder: 'border-indigo-200',
    connected: false,
    oauthSimDelay: 1600,
  },
  {
    id: 'notion',
    name: 'Notion',
    tagline: 'Push to a database page',
    icon: '📝',
    brandBg: 'bg-gray-50',
    brandText: 'text-gray-700',
    brandBorder: 'border-gray-200',
    connected: false,
    isPremium: true,
    oauthSimDelay: 2000,
  },
  {
    id: 'slack',
    name: 'Slack',
    tagline: 'Post digest to a channel',
    icon: '💬',
    brandBg: 'bg-purple-50',
    brandText: 'text-purple-700',
    brandBorder: 'border-purple-200',
    connected: false,
    isPremium: true,
    oauthSimDelay: 1400,
  },
];

// Mock emails used when simulating OAuth connections
const MOCK_ACCOUNTS: Record<string, string> = {
  'google-sheets': 'you@gmail.com · Sheet: Expense Tracker 2026',
  dropbox: 'Personal · /Apps/ExpenseTracker',
  onedrive: 'you@outlook.com · Documents/Expenses',
  notion: 'Workspace: Personal · Database: Expenses',
  slack: '#finance channel · Digest every Monday',
};

export function getMockAccount(id: string): string {
  return MOCK_ACCOUNTS[id] ?? 'Connected';
}

// ─── Export History ───────────────────────────────────────────────────────────

export type ExportStatus = 'success' | 'failed' | 'pending';

export interface HistoryRecord {
  id: string;
  templateName: string;
  templateIcon: string;
  destination: string;
  destinationIcon: string;
  format: string;
  recordCount: number;
  fileSizeKb: number;
  timestamp: string; // ISO
  status: ExportStatus;
  shareLink?: string;
}

const HISTORY_KEY = 'exptrack_export_history';

const SEED_HISTORY: HistoryRecord[] = [
  {
    id: 'h1',
    templateName: 'Tax Report',
    templateIcon: '🧾',
    destination: 'Email',
    destinationIcon: '✉️',
    format: 'CSV',
    recordCount: 47,
    fileSizeKb: 12,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'success',
  },
  {
    id: 'h2',
    templateName: 'Monthly Summary',
    templateIcon: '📅',
    destination: 'Dropbox',
    destinationIcon: '📦',
    format: 'CSV',
    recordCount: 20,
    fileSizeKb: 6,
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    status: 'success',
    shareLink: 'https://exptrack.app/share/d3f8a2',
  },
  {
    id: 'h3',
    templateName: 'Category Analysis',
    templateIcon: '📊',
    destination: 'Google Sheets',
    destinationIcon: '📊',
    format: 'CSV',
    recordCount: 20,
    fileSizeKb: 8,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'failed',
  },
  {
    id: 'h4',
    templateName: 'Full Export',
    templateIcon: '🗂️',
    destination: 'Local Download',
    destinationIcon: '💾',
    format: 'JSON',
    recordCount: 20,
    fileSizeKb: 18,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'success',
  },
];

export function getHistory(): HistoryRecord[] {
  if (typeof window === 'undefined') return SEED_HISTORY;
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(SEED_HISTORY));
      return SEED_HISTORY;
    }
    return JSON.parse(raw) as HistoryRecord[];
  } catch {
    return SEED_HISTORY;
  }
}

export function addToHistory(record: HistoryRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getHistory();
    const updated = [record, ...current].slice(0, 50); // cap at 50
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

// ─── Schedules ────────────────────────────────────────────────────────────────

export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface Schedule {
  id: string;
  templateId: string;
  templateName: string;
  templateIcon: string;
  destinationId: string;
  destinationName: string;
  destinationIcon: string;
  frequency: Frequency;
  dayOfWeek?: number; // 0=Sun … 6=Sat (weekly)
  dayOfMonth?: number; // 1-28 (monthly)
  time: string; // "HH:MM"
  active: boolean;
  nextRun: string; // ISO
  format: 'csv' | 'json';
}

const SCHEDULES_KEY = 'exptrack_schedules';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function computeNextRun(frequency: Frequency, time: string, dayOfWeek?: number, dayOfMonth?: number): string {
  const [h, m] = time.split(':').map(Number);
  const now = new Date();
  const candidate = new Date(now);
  candidate.setHours(h, m, 0, 0);

  if (frequency === 'daily') {
    if (candidate <= now) candidate.setDate(candidate.getDate() + 1);
    return candidate.toISOString();
  }

  if (frequency === 'weekly') {
    const target = dayOfWeek ?? 1; // Monday default
    const diff = (target - now.getDay() + 7) % 7 || 7;
    candidate.setDate(now.getDate() + diff);
    return candidate.toISOString();
  }

  // monthly
  const dom = dayOfMonth ?? 1;
  candidate.setDate(dom);
  if (candidate <= now) candidate.setMonth(candidate.getMonth() + 1);
  return candidate.toISOString();
}

const SEED_SCHEDULES: Schedule[] = [
  {
    id: 's1',
    templateId: 'monthly-summary',
    templateName: 'Monthly Summary',
    templateIcon: '📅',
    destinationId: 'email',
    destinationName: 'Email',
    destinationIcon: '✉️',
    frequency: 'monthly',
    dayOfMonth: 1,
    time: '08:00',
    active: true,
    nextRun: computeNextRun('monthly', '08:00', undefined, 1),
    format: 'csv',
  },
  {
    id: 's2',
    templateId: 'budget-tracker',
    templateName: 'Budget Tracker',
    templateIcon: '💰',
    destinationId: 'dropbox',
    destinationName: 'Dropbox',
    destinationIcon: '📦',
    frequency: 'weekly',
    dayOfWeek: 1,
    time: '09:00',
    active: false,
    nextRun: computeNextRun('weekly', '09:00', 1),
    format: 'csv',
  },
];

export function getSchedules(): Schedule[] {
  if (typeof window === 'undefined') return SEED_SCHEDULES;
  try {
    const raw = localStorage.getItem(SCHEDULES_KEY);
    if (!raw) {
      localStorage.setItem(SCHEDULES_KEY, JSON.stringify(SEED_SCHEDULES));
      return SEED_SCHEDULES;
    }
    return JSON.parse(raw) as Schedule[];
  } catch {
    return SEED_SCHEDULES;
  }
}

export function saveSchedules(schedules: Schedule[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
  } catch {
    // ignore
  }
}

export function makeSchedule(
  templateId: string,
  templateName: string,
  templateIcon: string,
  destinationId: string,
  destinationName: string,
  destinationIcon: string,
  frequency: Frequency,
  time: string,
  format: 'csv' | 'json',
  dayOfWeek?: number,
  dayOfMonth?: number
): Schedule {
  return {
    id: `s_${Date.now().toString(36)}`,
    templateId,
    templateName,
    templateIcon,
    destinationId,
    destinationName,
    destinationIcon,
    frequency,
    dayOfWeek,
    dayOfMonth,
    time,
    active: true,
    nextRun: computeNextRun(frequency, time, dayOfWeek, dayOfMonth),
    format,
  };
}

export { computeNextRun, DAYS };

// ─── Share Links ──────────────────────────────────────────────────────────────

export function generateShareId(): string {
  return Math.random().toString(36).substring(2, 8);
}

export function buildShareUrl(shareId: string): string {
  return `https://exptrack.app/share/${shareId}`;
}

export function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
