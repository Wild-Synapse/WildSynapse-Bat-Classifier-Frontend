import React, { useState } from 'react';
import { 
  Activity, 
  Waves, 
  Clock, 
  LayoutGrid, 
  List, 
  ChevronDown, 
  Zap,
  BarChart2,
  Maximize2
} from 'lucide-react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  CartesianGrid, 
  XAxis, 
  YAxis 
} from 'recharts';
import { AnalysisResult } from '../types';

interface SpeciesAnalyticsProps {
  darkMode: boolean;
  results: AnalysisResult[];
  API_BASE: string;
}

// --- Custom Tooltip Component for Recharts ---
const CustomTooltip = ({ active, payload, label, darkMode }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`backdrop-blur-xl border px-3 py-2 rounded-lg shadow-2xl ${
        darkMode ? 'bg-slate-900/90 border-slate-700 text-slate-100' : 'bg-white/90 border-slate-200 text-slate-900'
      }`}>
        <p className="text-xs font-bold mb-1 opacity-70">{label || 'Metric'}</p>
        <p className="text-sm font-mono font-bold text-cyan-400">
          {typeof payload[0].value === 'number' ? payload[0].value.toFixed(1) : payload[0].value}
          <span className="text-[10px] ml-1 text-slate-500">unit</span>
        </p>
      </div>
    );
  }
  return null;
};

export const SpeciesAnalytics: React.FC<SpeciesAnalyticsProps> = ({ darkMode, results, API_BASE }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [expandedSpecies, setExpandedSpecies] = useState<string | null>(null);

  // Derive unique species list
  const uniqueSpecies = [...new Set(results.flatMap(r => r.species_detected.map(s => s.species)).filter(Boolean))];

  // --- Helper Functions ---
  const getSpeciesImageUrl = (species: string) => 
    `${API_BASE}/api/static/bat_species/${species.replace(/\s+/g, '_')}`;

  const getSpeciesAnalytics = (species: string) => {
    const speciesResults = results.filter(r => r.species_detected[0]?.species === species);
    
    const freqData = speciesResults.map(r => ({
      name: r.original_filename.slice(0, 15),
      peak: r.call_parameters.peak_frequency,
      start: r.call_parameters.start_frequency,
      end: r.call_parameters.end_frequency
    }));
    
    const avgPeak = speciesResults.reduce((sum, r) => sum + r.call_parameters.peak_frequency, 0) / speciesResults.length;
    const avgBandwidth = speciesResults.reduce((sum, r) => sum + r.call_parameters.bandwidth, 0) / speciesResults.length;
    const avgDuration = speciesResults.reduce((sum, r) => sum + r.call_parameters.pulse_duration, 0) / speciesResults.length;

    // Normalized data for Radar Chart to make it look balanced
    const radarData = [
      { metric: 'Peak Freq', value: avgPeak, fullMark: 150 },
      { metric: 'Bandwidth', value: avgBandwidth, fullMark: 100 },
      { metric: 'Duration', value: avgDuration * 10, fullMark: 100 }, // Scaled for visual
      { metric: 'Start Freq', value: speciesResults.reduce((sum, r) => sum + r.call_parameters.start_frequency, 0) / speciesResults.length, fullMark: 150 },
      { metric: 'End Freq', value: speciesResults.reduce((sum, r) => sum + r.call_parameters.end_frequency, 0) / speciesResults.length, fullMark: 150 }
    ];
    
    return { freqData, radarData, count: speciesResults.length, avgPeak, avgBandwidth, avgDuration };
  };

  // --- Sub-Component: The Data Panel ---
  const AnalyticsPanel = ({ species }: { species: string }) => {
    const analytics = getSpeciesAnalytics(species);
    
    return (
      <div className={`relative mt-6 overflow-hidden rounded-3xl border animate-in fade-in slide-in-from-top-4 duration-500
        ${darkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/60 border-slate-200'} backdrop-blur-2xl shadow-2xl`}>
        
        {/* Decorative background gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 p-6 lg:p-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row gap-8 mb-10">
            {/* Left: Image & Title */}
            <div className="flex-1 flex gap-6 items-center">
              <div className="relative group">
                <div className={`absolute -inset-1 bg-gradient-to-r from-cyan-400 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500`} />
                <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                  <img 
                    src={getSpeciesImageUrl(species)} 
                    alt={species}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
                    onError={(e) => (e.target as HTMLImageElement).src = `https://via.placeholder.com/150?text=${species.charAt(0)}`}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-3xl lg:text-4xl font-black bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-2">
                  {species}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                    darkMode ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' : 'border-cyan-600/30 text-cyan-700 bg-cyan-100'
                  }`}>
                    Acoustic Profile
                  </span>
                  <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Analysis based on {analytics.count} detections
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Key Metrics Grid */}
            <div className="grid grid-cols-3 gap-4 w-full lg:w-auto">
              {[
                { label: 'Avg Frequency', value: analytics.avgPeak.toFixed(1), unit: 'kHz', icon: Waves, color: 'text-cyan-400' },
                { label: 'Avg Duration', value: analytics.avgDuration.toFixed(1), unit: 'ms', icon: Clock, color: 'text-indigo-400' },
                { label: 'Bandwidth', value: analytics.avgBandwidth.toFixed(1), unit: 'kHz', icon: Zap, color: 'text-purple-400' },
              ].map((stat, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center min-w-[120px] transition-all hover:bg-white/5
                  ${darkMode ? 'bg-slate-800/40 border-white/5' : 'bg-white/50 border-slate-200/50'}`}>
                  <stat.icon className={`w-5 h-5 mb-2 ${stat.color} opacity-80`} />
                  <div className={`text-2xl font-mono font-bold tracking-tighter ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Radar Chart */}
            <div className={`col-span-1 rounded-3xl p-6 border flex flex-col
              ${darkMode ? 'bg-slate-950/30 border-white/5' : 'bg-white/40 border-slate-200'}`}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Signature Shape
              </h4>
              <div className="flex-1 min-h-[250px] relative">
                 <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analytics.radarData}>
                    <PolarGrid stroke={darkMode ? '#334155' : '#e2e8f0'} strokeOpacity={0.5} />
                    <PolarAngleAxis 
                      dataKey="metric" 
                      tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 600 }} 
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                    <Radar
                      name={species}
                      dataKey="value"
                      stroke="#22d3ee"
                      strokeWidth={2}
                      fill="#22d3ee"
                      fillOpacity={0.2}
                    />
                    <Tooltip cursor={false} content={<CustomTooltip darkMode={darkMode} />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Area Chart */}
            <div className={`col-span-1 lg:col-span-2 rounded-3xl p-6 border flex flex-col
              ${darkMode ? 'bg-slate-950/30 border-white/5' : 'bg-white/40 border-slate-200'}`}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                <BarChart2 className="w-4 h-4" /> Frequency Distribution Trend
              </h4>
              <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.freqData.slice(0, 30)}>
                    <defs>
                      <linearGradient id="colorFreq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} vertical={false} opacity={0.4} />
                    <XAxis dataKey="name" hide />
                    <YAxis 
                      tick={{fill: darkMode ? '#64748b' : '#475569', fontSize: 10, fontFamily: 'monospace'}} 
                      axisLine={false} 
                      tickLine={false} 
                      domain={['auto', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                    <Area 
                      type="monotone" 
                      dataKey="peak" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorFreq)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700 font-sans">
      
      {/* --- Top Control Bar --- */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 mb-2">
            Species Intelligence
          </h2>
          <p className={`text-sm font-medium tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            POPULATION DYNAMICS & BIOACOUSTIC ANALYSIS
          </p>
        </div>
        
        {/* Futuristic Toggle Switch */}
        <div className={`p-1.5 rounded-2xl flex items-center gap-1 border shadow-inner
          ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
          <button 
            onClick={() => setViewMode('grid')} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300
              ${viewMode === 'grid' 
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
          >
            <LayoutGrid className="w-4 h-4" /> Grid
          </button>
          <button 
            onClick={() => setViewMode('list')} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300
              ${viewMode === 'list' 
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
          >
            <List className="w-4 h-4" /> List
          </button>
        </div>
      </div>

      {/* --- GRID VIEW --- */}
      {viewMode === 'grid' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {uniqueSpecies.slice(0, 16).map(species => {
              const stats = getSpeciesAnalytics(species);
              const isSelected = selectedSpecies === species;
              const imageUrl = getSpeciesImageUrl(species);

              return (
                <button
                  key={species}
                  onClick={() => setSelectedSpecies(isSelected ? null : species)}
                  className={`group relative h-80 w-full overflow-hidden rounded-[2rem] text-left transition-all duration-500 ease-out
                    ${isSelected ? 'ring-2 ring-cyan-400 ring-offset-4 ring-offset-slate-950 scale-[1.02]' : 'hover:-translate-y-1 hover:shadow-2xl'}
                  `}
                >
                  {/* Image Background */}
                  <div className="absolute inset-0 bg-slate-900">
                    <img 
                      src={imageUrl} 
                      alt={species} 
                      className={`w-full h-full object-cover transition-transform duration-700 ease-in-out
                        ${isSelected ? 'scale-110 opacity-40 blur-sm' : 'opacity-80 group-hover:scale-110 group-hover:opacity-60'}
                      `}
                      onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                    />
                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent opacity-90" />
                    <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-cyan-900/20 opacity-0 group-hover:opacity-100 transition duration-500`} />
                  </div>

                  {/* Content Container */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
                    
                    {/* Floating Stats - Reveal on Hover */}
                    <div className={`absolute top-6 right-6 flex flex-col gap-2 transition-all duration-500
                       ${isSelected || 'opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0'}`}>
                      <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <Activity className="w-3 h-3 text-cyan-400" />
                        <span className="text-xs font-mono font-bold text-white">{stats.count}</span>
                      </div>
                      <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <Waves className="w-3 h-3 text-purple-400" />
                        <span className="text-xs font-mono font-bold text-white">{stats.avgPeak.toFixed(0)}k</span>
                      </div>
                    </div>

                    {/* Title Area */}
                    <div className="transform transition-all duration-300 group-hover:translate-y-0 translate-y-2">
                       <div className="w-10 h-1 bg-cyan-500 rounded-full mb-4 w-0 group-hover:w-10 transition-all duration-500" />
                       <h3 className={`text-2xl font-bold leading-tight text-white mb-1 ${isSelected && 'text-cyan-400'}`}>
                         {species}
                       </h3>
                       <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                         View Analytics
                       </p>
                    </div>
                  </div>

                  {/* Active Border Glow */}
                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-[2rem] pointer-events-none animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Detail View */}
          {selectedSpecies && (
            <div key={selectedSpecies} className="mt-8">
               <AnalyticsPanel species={selectedSpecies} />
            </div>
          )}
        </div>
      )}

      {/* --- LIST VIEW --- */}
      {viewMode === 'list' && (
        <div className="flex flex-col gap-4">
          {uniqueSpecies.map((species, index) => {
            const stats = getSpeciesAnalytics(species);
            const isExpanded = expandedSpecies === species;
            const imageUrl = getSpeciesImageUrl(species);

            return (
              <div key={species} className={`group rounded-2xl transition-all duration-500 border overflow-hidden
                ${isExpanded 
                  ? 'bg-slate-900/40 border-cyan-500/30 shadow-2xl ring-1 ring-cyan-500/20' 
                  : darkMode ? 'bg-slate-900/20 border-white/5 hover:border-white/10' : 'bg-white border-slate-200 hover:shadow-lg'}`}>
                
                {/* List Header / Trigger */}
                <div 
                  onClick={() => setExpandedSpecies(isExpanded ? null : species)}
                  className="relative p-4 md:p-6 cursor-pointer flex flex-col md:flex-row items-center gap-6"
                >
                  {/* Left: Avatar & Name */}
                  <div className="flex items-center gap-5 flex-1 w-full">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg flex-shrink-0 bg-slate-800">
                      <img src={imageUrl} className="w-full h-full object-cover" alt="icon" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${isExpanded ? 'text-cyan-400' : darkMode ? 'text-white' : 'text-slate-900'}`}>{species}</h3>
                      <div className="flex items-center gap-2 mt-1">
                         <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border 
                           ${darkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                           Detected
                         </span>
                         <span className="text-xs text-slate-500 font-mono">{stats.freqData[0]?.name || 'Unknown source'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Stats */}
                  <div className="flex items-center justify-between md:justify-end gap-2 md:gap-8 w-full md:w-auto">
                    <div className="text-center w-20">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Count</p>
                      <p className={`font-mono text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.count}</p>
                    </div>
                    
                    {/* Visual Bar for Frequency */}
                    <div className="hidden sm:block w-32">
                       <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex justify-between">
                         <span>Freq</span>
                         <span className="text-cyan-400">{stats.avgPeak.toFixed(0)}kHz</span>
                       </p>
                       <div className="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden">
                         <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" 
                            style={{ width: `${Math.min((stats.avgPeak / 120) * 100, 100)}%` }} 
                         />
                       </div>
                    </div>

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 border
                      ${isExpanded 
                        ? 'bg-cyan-500 border-cyan-400 text-white rotate-180' 
                        : darkMode ? 'bg-slate-800 border-slate-700 text-slate-400 group-hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* List Details (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-dashed border-white/10">
                    <AnalyticsPanel species={species} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};