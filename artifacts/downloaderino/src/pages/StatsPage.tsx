import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart2, Download, Search, Users, Smartphone, Monitor, Tablet,
  TrendingUp, Calendar, ArrowLeft, Film, Star, Zap,
} from 'lucide-react';
import { getAnalytics } from '../analytics';

interface Props { onBack: () => void; }

function pct(val: number, total: number) {
  if (!total) return 0;
  return Math.round((val / total) * 100);
}

function last7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  mobile: <Smartphone size={14} />,
  tablet: <Tablet size={14} />,
  desktop: <Monitor size={14} />,
};

const QUALITY_COLORS: Record<string, string> = {
  '360': 'bg-gray-400',
  '480': 'bg-blue-400',
  '720': 'bg-primary',
  '1080': 'bg-yellow-400',
};

export const StatsPage: React.FC<Props> = ({ onBack }) => {
  const data = useMemo(() => getAnalytics(), []);
  const days = last7Days();

  const totalDevices = Object.values(data.deviceTypes).reduce((a, b) => a + b, 0);
  const totalQuality = Object.values(data.downloadsByQuality).reduce((a, b) => a + b, 0);
  const topSearchList = Object.entries(data.topSearches)
    .sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxDailyVisit = Math.max(...days.map(d => data.dailyVisits[d] ?? 0), 1);
  const maxDailyDl = Math.max(...days.map(d => data.dailyDownloads[d] ?? 0), 1);

  const statCards = [
    { icon: Users, label: 'Total Visits', value: data.totalVisits.toLocaleString(), color: 'text-primary' },
    { icon: Download, label: 'Downloads', value: data.totalDownloads.toLocaleString(), color: 'text-blue-400' },
    { icon: Search, label: 'Searches', value: data.totalSearches.toLocaleString(), color: 'text-purple-400' },
    { icon: Calendar, label: 'Active Days', value: data.uniqueDays.length.toString(), color: 'text-yellow-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-8 pb-20"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.button
          whileHover={{ x: -5 }}
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border-subtle text-sm font-bold text-gray-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
        >
          <ArrowLeft size={16} /> Back
        </motion.button>
        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
          <BarChart2 size={14} /> Analytics Dashboard
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tight">Site Analytics</h2>
        <p className="text-sm text-gray-400 font-medium">
          Your personal usage stats — stored locally on this device.
          {data.firstVisit && <span className="ml-2 text-gray-500">Since {fmtDate(data.firstVisit)}</span>}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-surface border border-border-subtle rounded-2xl p-5 space-y-3 hover:border-primary/30 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl bg-surface border border-border-subtle flex items-center justify-center ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{s.label}</p>
              <p className="text-2xl font-black mt-0.5">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Visits Chart */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-6 space-y-4">
          <h3 className="font-black text-sm flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" /> Daily Visits (Last 7 Days)
          </h3>
          <div className="flex items-end gap-2 h-28">
            {days.map(d => {
              const v = data.dailyVisits[d] ?? 0;
              const h = maxDailyVisit > 0 ? Math.max(4, Math.round((v / maxDailyVisit) * 100)) : 4;
              return (
                <div key={d} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-gray-400 font-bold">{v || ''}</span>
                  <div className="w-full rounded-t-lg bg-primary/20 relative overflow-hidden" style={{ height: `${h}%`, minHeight: 4 }}>
                    <motion.div
                      className="absolute bottom-0 w-full bg-primary rounded-t-lg"
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                    />
                  </div>
                  <span className="text-[9px] text-gray-500 font-bold">{fmtDate(d).split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Downloads Chart */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-6 space-y-4">
          <h3 className="font-black text-sm flex items-center gap-2">
            <Download size={16} className="text-blue-400" /> Daily Downloads (Last 7 Days)
          </h3>
          <div className="flex items-end gap-2 h-28">
            {days.map(d => {
              const v = data.dailyDownloads[d] ?? 0;
              const h = maxDailyDl > 0 ? Math.max(4, Math.round((v / maxDailyDl) * 100)) : 4;
              return (
                <div key={d} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-gray-400 font-bold">{v || ''}</span>
                  <div className="w-full rounded-t-lg bg-blue-400/20 relative overflow-hidden" style={{ height: `${h}%`, minHeight: 4 }}>
                    <motion.div
                      className="absolute bottom-0 w-full bg-blue-400 rounded-t-lg"
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                    />
                  </div>
                  <span className="text-[9px] text-gray-500 font-bold">{fmtDate(d).split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quality Breakdown */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-6 space-y-4">
          <h3 className="font-black text-sm flex items-center gap-2">
            <Zap size={16} className="text-yellow-400" /> Downloads by Quality
          </h3>
          {totalQuality === 0 ? (
            <p className="text-sm text-gray-400 font-medium">No downloads yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(data.downloadsByQuality).sort((a, b) => b[1] - a[1]).map(([q, count]) => (
                <div key={q} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{q}p</span>
                    <span className="text-gray-400">{count} · {pct(count, totalQuality)}%</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${QUALITY_COLORS[q] ?? 'bg-primary'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct(count, totalQuality)}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Device Breakdown */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-6 space-y-4">
          <h3 className="font-black text-sm flex items-center gap-2">
            <Monitor size={16} className="text-purple-400" /> Visitors by Device
          </h3>
          {totalDevices === 0 ? (
            <p className="text-sm text-gray-400 font-medium">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(data.deviceTypes).sort((a, b) => b[1] - a[1]).map(([device, count]) => (
                <div key={device} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 capitalize">
                      {DEVICE_ICONS[device]} {device}
                    </span>
                    <span className="text-gray-400">{count} · {pct(count, totalDevices)}%</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-purple-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct(count, totalDevices)}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Download Type Breakdown */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-6 space-y-4">
          <h3 className="font-black text-sm flex items-center gap-2">
            <Film size={16} className="text-primary" /> Downloads by Type
          </h3>
          {Object.keys(data.downloadsByType).length === 0 ? (
            <p className="text-sm text-gray-400 font-medium">No downloads yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(data.downloadsByType).map(([type, count]) => (
                <div key={type} className="bg-background border border-border-subtle rounded-xl p-4 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 capitalize">{type}</p>
                  <p className="text-xl font-black">{count}</p>
                  <p className="text-[10px] text-gray-400">{pct(count, data.totalDownloads)}% of total</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Searches */}
        <div className="bg-surface border border-border-subtle rounded-2xl p-6 space-y-4">
          <h3 className="font-black text-sm flex items-center gap-2">
            <Star size={16} className="text-yellow-400" /> Top Searches
          </h3>
          {topSearchList.length === 0 ? (
            <p className="text-sm text-gray-400 font-medium">No searches yet.</p>
          ) : (
            <div className="space-y-2">
              {topSearchList.map(([q, count], i) => (
                <div key={q} className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-gray-500 w-4">{i + 1}</span>
                  <span className="flex-grow text-sm font-bold capitalize truncate">{q}</span>
                  <span className="text-[10px] font-black text-gray-400 shrink-0">{count}×</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-center text-[11px] text-gray-500 font-medium">
        All data is stored locally on your device only — nothing is sent to any server.
      </p>
    </motion.div>
  );
};
