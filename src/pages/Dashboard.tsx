import React from 'react';
import { 
  Download, 
  Zap, 
  FileAudio, 
  Clock, 
  Target, 
  Database, 
  PieChart as PieIcon, 
  BarChart3, 
  Activity, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  CartesianGrid, 
  XAxis, 
  YAxis 
} from 'recharts';
import { HealthStatus, Statistics } from '../types';

interface DashboardProps {
  darkMode: boolean;
  healthStatus: HealthStatus | null;
  statistics: Statistics | null;
  onDownloadCSV: () => void;
}

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];

// --- Custom Tooltip Component ---
const CustomTooltip = ({ active, payload, label, darkMode }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`backdrop-blur-xl border px-4 py-3 rounded-xl shadow-2xl ${
        darkMode ? 'bg-slate-900/90 border-slate-700 text-slate-100' : 'bg-white/90 border-slate-200 text-slate-900'
      }`}>
        <p className="text-xs font-bold mb-1 opacity-70 uppercase tracking-wider">{label || payload[0].name}</p>
        <p className="text-lg font-mono font-bold text-cyan-400">
          {payload[0].value.toLocaleString()}
          <span className="text-[10px] ml-1 text-slate-500 font-sans font-normal">detections</span>
        </p>
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC<DashboardProps> = ({ darkMode, healthStatus, statistics, onDownloadCSV }) => {
  
  // Helper for background styles
  const glassPanelClass = `backdrop-blur-xl border transition-all duration-300 ${
    darkMode 
      ? 'bg-slate-900/60 border-white/10 hover:border-white/20' 
      : 'bg-white/60 border-slate-200 hover:border-slate-300'
  }`;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-sans w-full">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 relative">
        {/* Background Glow */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10">
          <h2 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 mb-2">
            Ecological Overview
          </h2>
          <div className={`flex items-center gap-2 text-sm font-medium tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <Activity className="w-4 h-4 text-cyan-500 animate-pulse" />
            <span className="uppercase tracking-widest text-xs font-bold">Live System Telemetry</span>
            <span className="w-1 h-1 rounded-full bg-slate-500" />
            <span>Acoustic Monitoring Active</span>
          </div>
        </div>

        <button
          onClick={onDownloadCSV}
          className="relative group overflow-hidden px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25 active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 transition-all duration-300 group-hover:scale-110" />
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-2 text-white font-bold tracking-wide">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </div>
        </button>
      </div>

      {/* --- STATISTICS GRID --- */}
      {statistics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Analyses', value: statistics.total_analyses.toLocaleString(), sub: 'Files Processed', icon: FileAudio, from: 'from-cyan-500', to: 'to-blue-500', text: 'text-cyan-400' },
              { label: 'Monitoring Time', value: statistics.total_duration_hours.toFixed(1), sub: 'Hours Logged', icon: Clock, from: 'from-blue-500', to: 'to-indigo-500', text: 'text-blue-400' },
              { label: 'Biodiversity', value: statistics.unique_species_detected, sub: 'Species Identified', icon: Target, from: 'from-indigo-500', to: 'to-purple-500', text: 'text-indigo-400' },
              { label: 'Database', value: statistics.storage_type, sub: 'Storage Engine', icon: Database, from: 'from-purple-500', to: 'to-pink-500', text: 'text-purple-400' },
            ].map((stat, idx) => (
              <div key={idx} className={`${glassPanelClass} rounded-2xl p-6 relative overflow-hidden group`}>
                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500`}>
                  <stat.icon className={`w-24 h-24 ${stat.text}`} />
                </div>
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.from} ${stat.to} text-white shadow-lg`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {stat.label}
                    </span>
                  </div>
                  
                  <div>
                    <div className={`text-4xl font-mono font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      {stat.value}
                    </div>
                    <div className={`text-xs font-medium mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {stat.sub}
                    </div>
                  </div>
                </div>
                
                {/* Bottom Line Indicator */}
                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${stat.from} ${stat.to} w-0 group-hover:w-full transition-all duration-700 ease-out`} />
              </div>
            ))}
          </div>

          {/* --- CHARTS SECTION --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Pie Chart Card */}
            <div className={`${glassPanelClass} rounded-3xl p-6 flex flex-col`}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <PieIcon className="w-5 h-5 text-cyan-500" />
                    <span className={darkMode ? 'text-white' : 'text-slate-900'}>Species Distribution</span>
                  </h3>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Proportional breakdown of identified calls
                  </p>
                </div>
              </div>

              <div className="flex-1 min-h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statistics.top_species.slice(0, 8).map((s: any) => ({ name: s.species, value: s.count }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {statistics.top_species.slice(0, 8).map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                          className="hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      formatter={(value) => <span className={`text-xs font-medium ml-1 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center Text Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                  <div className="text-center">
                    <p className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Top</p>
                    <p className={`text-3xl font-mono font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>8</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bar Chart Card */}
            <div className={`${glassPanelClass} rounded-3xl p-6 flex flex-col`}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    <span className={darkMode ? 'text-white' : 'text-slate-900'}>Detection Frequency</span>
                  </h3>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Quantitative analysis of top observed species
                  </p>
                </div>
              </div>

              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statistics.top_species.slice(0, 6)} barSize={40}>
                    <defs>
                      {COLORS.map((color, idx) => (
                        <linearGradient key={idx} id={`colorBar-${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={1} />
                          <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e5e7eb'} vertical={false} strokeOpacity={0.4} />
                    <XAxis 
                      dataKey="species" 
                      tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b', fontWeight: 600 }} 
                      interval={0}
                      tickMargin={10}
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: darkMode ? '#64748b' : '#94a3b8', fontFamily: 'monospace' }} 
                    />
                    <Tooltip cursor={{fill: darkMode ? '#ffffff' : '#000000', opacity: 0.05}} content={<CustomTooltip darkMode={darkMode} />} />
                    <Bar dataKey="count" radius={[12, 12, 4, 4]}>
                      {statistics.top_species.slice(0, 6).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={`url(#colorBar-${index})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};