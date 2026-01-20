import React, { useState, useEffect, useRef } from 'react';
import { Database, Filter, RefreshCw, Waves, Clock, Zap, Activity, Trash2, ChevronUp, ChevronDown, Play, Pause, FileText, Target, Mic, LayoutGrid, List, Bot, X, Image as ImageIcon, Volume2 } from 'lucide-react';
import { AnalysisResult } from '../types';

interface HistoryProps {
  darkMode: boolean;
  results: AnalysisResult[];
  loading: boolean;
  API_BASE: string;
  fetchResults: () => void;
  fetchStatistics: () => void;
}

export const History: React.FC<HistoryProps> = ({ darkMode, results, loading, API_BASE, fetchResults, fetchStatistics }) => {
  // --- STATE ---
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [filterSpecies, setFilterSpecies] = useState<string>('all');
  
  // Audio State
  const [playingFileId, setPlayingFileId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Species Preview State
  const [selectedSpeciesPreview, setSelectedSpeciesPreview] = useState<Record<string, string>>({}); 
  
  // AI State
  // We store explanations by file_id so we don't re-fetch if they close/open
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [isExplaining, setIsExplaining] = useState<string | null>(null); // Stores file_id of currently loading AI

  // Styling Helpers
  const cardClass = darkMode ? 'bg-slate-900/40 backdrop-blur-md border-slate-800' : 'bg-white/90 backdrop-blur-md border-slate-200';
  const mutedClass = darkMode ? 'text-slate-400' : 'text-slate-600';
  const uniqueSpecies = [...new Set(results.flatMap(r => r.species_detected.map(s => s.species)).filter(Boolean))];

  // --- INITIALIZATION ---
  useEffect(() => {
    audioRef.current = new Audio();
    
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        const curr = audioRef.current.currentTime;
        setCurrentTime(curr);
        // Duration might be Infinity initially for streams, fallback to 0
        const dur = isFinite(audioRef.current.duration) ? audioRef.current.duration : 0;
        setDuration(dur);
        setAudioProgress(dur > 0 ? (curr / dur) * 100 : 0);
      }
    };

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    };

    const handleEnded = () => { 
        setPlayingFileId(null); 
        setAudioProgress(0); 
        setCurrentTime(0);
    };
    
    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      audioRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
      audioRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current?.removeEventListener('ended', handleEnded);
    };
  }, []);

  // --- HANDLERS ---
  const formatConfidence = (val: number) => {
    const percentage = val > 1 ? val : val * 100;
    return `${percentage.toFixed(4)}%`;
  };

  const formatTime = (time: number) => {
    if (!time || !isFinite(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSpeciesImageUrl = (speciesName: string) => {
    const formattedName = speciesName.replace(/\s+/g, '_'); 
    return `${API_BASE}/api/static/bat_species/${formattedName}`;
  };

  const toggleAudio = (url: string, fileId: string) => {
    if (!audioRef.current) return;
    
    if (playingFileId && playingFileId !== fileId) {
        audioRef.current.pause();
        setPlayingFileId(null);
    }

    if (playingFileId === fileId) {
      audioRef.current.pause();
      setPlayingFileId(null);
    } else {
      audioRef.current.src = `${API_BASE}${url}`;
      audioRef.current.play().catch(console.error);
      setPlayingFileId(fileId);
    }
  };

  const handleSpeciesClick = (speciesName: string, fileId: string) => {
    setSelectedSpeciesPreview(prev => ({ ...prev, [fileId]: speciesName }));
  };

  // Separated Fetch Logic
  const fetchAIExplanation = async (result: AnalysisResult) => {
    // If we already have it, don't re-fetch
    if (aiExplanations[result.file_id]) return;

    setIsExplaining(result.file_id);
    try {
      const res = await fetch(`${API_BASE}/api/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: result.original_filename,
          species_detected: result.species_detected,
          call_parameters: result.call_parameters
        })
      });
      const data = await res.json();
      setAiExplanations(prev => ({ ...prev, [result.file_id]: data.explanation }));
    } catch (error) {
      console.error("AI Error", error);
    } finally {
      setIsExplaining(null);
    }
  };

  const toggleExpanded = (result: AnalysisResult) => {
    const isExpanding = !expandedResults.has(result.file_id);
    
    setExpandedResults(prev => { 
        const n = new Set(prev); 
        isExpanding ? n.add(result.file_id) : n.delete(result.file_id); 
        return n; 
    });

    // AUTO TRIGGER AI ON EXPAND
    if (isExpanding) {
        fetchAIExplanation(result);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (confirm('Delete result?')) {
      await fetch(`${API_BASE}/api/results/${fileId}`, { method: 'DELETE' });
      fetchResults();
      fetchStatistics();
    }
  };

  const handleDownloadPDF = async (fileId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/download/pdf/${fileId}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${fileId}.pdf`;
      a.click();
    } catch(e) {
      alert("Download failed");
    }
  };

  // --- RENDERERS ---
  const MiniVisualizer = ({ isActive }: { isActive: boolean }) => (
    <div className="flex items-end gap-[3px] h-6 w-12">
      {[...Array(4)].map((_, i) => (
        <div key={i} className={`w-1.5 bg-cyan-400 rounded-t-sm transition-all duration-75 shadow-[0_0_8px_rgba(34,211,238,0.5)] ${isActive ? 'animate-music-bar' : 'h-1 opacity-30'}`} style={{ animationDelay: `${i*0.05}s`, height: isActive ? undefined : '3px' }} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* Header Controls */}
      <div className={`flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-3xl border backdrop-blur-sm ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${darkMode ? 'bg-slate-800 text-cyan-400' : 'bg-slate-100 text-cyan-600'}`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent leading-none">Data Archive</h2>
            <p className="text-slate-500 text-xs mt-1 font-medium">{results.length} events processed</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className={`flex p-1 rounded-xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-400'}`}><List className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-400'}`}><LayoutGrid className="w-4 h-4" /></button>
          </div>

          {/* Species Filter */}
          <div className={`relative flex items-center group`}>
            <div className={`absolute inset-y-0 left-3 flex items-center pointer-events-none ${darkMode ? 'text-cyan-500' : 'text-cyan-600'}`}>
              <Filter className="w-4 h-4" />
            </div>
            <select 
              value={filterSpecies} 
              onChange={e => setFilterSpecies(e.target.value)} 
              className={`pl-10 pr-4 py-2.5 rounded-xl border appearance-none text-sm font-medium transition-all cursor-pointer focus:ring-2 focus:ring-cyan-500/50 outline-none min-w-[160px]
                ${darkMode 
                  ? 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700' 
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
            >
              <option value="all" className={darkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'}>All Species</option>
              {uniqueSpecies.map(s => (
                <option key={s} value={s} className={darkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'}>{s}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-32"><RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mb-4" /><p className="text-slate-500 font-mono">Loading archive...</p></div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
          {results.filter(r => filterSpecies === 'all' || r.species_detected.some(s => s.species === filterSpecies)).map(result => {
            
            const activeSpeciesName = selectedSpeciesPreview[result.file_id] || result.species_detected[0]?.species || 'Unknown';
            const activeImageUrl = getSpeciesImageUrl(activeSpeciesName);
            const explanation = aiExplanations[result.file_id];
            const isLoadingAI = isExplaining === result.file_id;

            return (
              <div 
                key={result.file_id} 
                className={`${cardClass} border rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-900/10 hover:border-cyan-500/30 flex flex-col group`}
              >
                
                {/* --- ROW SUMMARY / CARD HEADER --- */}
                <div 
                  className="cursor-pointer relative"
                  onClick={() => toggleExpanded(result)}
                >
                  {viewMode === 'grid' ? (
                    // GRID VIEW HEADER
                    <div className="aspect-[3/2] w-full bg-black relative overflow-hidden border-b border-slate-800">
                      <img src={`${API_BASE}${result.spectrogram_url}`} alt="Spectrogram" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90" />
                      <div className="absolute bottom-4 left-4 right-4 z-10">
                        <h3 className="font-bold text-lg text-white truncate drop-shadow-md">{result.original_filename}</h3>
                        <div className="flex items-center gap-3 text-sm mt-1">
                            <p className="text-cyan-400 font-bold flex items-center gap-1.5"><Target className="w-3 h-3" /> {result.species_detected[0]?.species || 'Unknown'}</p>
                            <span className="text-slate-400 text-[10px] font-mono tracking-wider">{formatConfidence(result.species_detected[0]?.confidence)}</span>
                        </div>
                      </div>
                      {playingFileId === result.file_id && <div className="absolute bottom-4 right-4 z-20"><MiniVisualizer isActive={true} /></div>}
                    </div>
                  ) : (
                    // LIST VIEW HEADER
                    <div className="p-4 flex flex-col md:flex-row items-center gap-4">
                      <div className="relative w-full md:w-32 h-20 bg-black rounded-xl overflow-hidden border border-slate-800 shrink-0 group/thumb">
                        <img src={`${API_BASE}${result.spectrogram_url}`} className="w-full h-full object-cover opacity-70 group-hover/thumb:opacity-100 transition-opacity" alt="Spec" />
                        {playingFileId === result.file_id && <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]"><MiniVisualizer isActive={true} /></div>}
                      </div>
                      <div className="flex-1 min-w-0 text-center md:text-left">
                        <h3 className="font-bold text-base text-white truncate">{result.original_filename}</h3>
                        <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1 text-cyan-400 font-semibold"><Target className="w-3 h-3" /> {result.species_detected[0]?.species} ({formatConfidence(result.species_detected[0]?.confidence)})</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(result.timestamp * 1000).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {result.call_parameters.peak_frequency} kHz</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         {result.audio_url && (
                            <button onClick={(e) => { e.stopPropagation(); toggleAudio(result.audio_url || '', result.file_id); }} className={`p-2 rounded-lg transition-all ${playingFileId === result.file_id ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`} title="Play Audio">
                                {playingFileId === result.file_id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>
                         )}
                         <button className={`p-2 rounded-lg bg-indigo-900/30 text-indigo-400 transition-all ${isLoadingAI ? 'animate-pulse' : ''}`} title="AI Insight"><Bot className="w-4 h-4" /></button>
                         <button onClick={(e) => { e.stopPropagation(); handleDownloadPDF(result.file_id); }} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all" title="Download Report"><FileText className="w-4 h-4" /></button>
                         <ChevronDown className={`w-5 h-5 text-slate-600 transition-transform ml-2 ${expandedResults.has(result.file_id) ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* --- EXPANDED DETAILS --- */}
                {expandedResults.has(result.file_id) && (
                  <div className="p-6 bg-slate-950/30 border-t border-slate-800/50 animate-in slide-in-from-top-4 fade-in">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      
                      {/* --- LEFT COLUMN: Spectrogram & Species --- */}
                      <div className="space-y-6">
                        
                        {/* 1. Large Spectrogram (Proper Square Container) */}
                        <div className="relative rounded-xl overflow-hidden border border-slate-700/50 bg-black shadow-lg">
                            {/* Force Square Aspect Ratio for Container */}
                            <div className="w-full aspect-square relative">
                                <img 
                                    src={`${API_BASE}${result.spectrogram_url}`} 
                                    alt="Spectrogram" 
                                    className="w-full h-full object-contain bg-black" 
                                />
                                
                                {/* Overlay Header */}
                                <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-start">
                                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider flex items-center gap-2 px-2 py-1 bg-black/40 rounded-lg backdrop-blur-sm border border-white/10">
                                        <Activity className="w-3 h-3 text-cyan-400" /> Full Resolution Spectrogram
                                    </span>
                                </div>
                            </div>

                            {/* Integrated Audio Player Bar (Attached to bottom) */}
                            {result.audio_url && (
                                <div className="bg-slate-900 border-t border-slate-800 p-3 flex items-center gap-3">
                                    <button 
                                        onClick={() => result.audio_url && toggleAudio(result.audio_url, result.file_id)} 
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${playingFileId === result.file_id ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                                    >
                                        {playingFileId === result.file_id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                                    </button>
                                    
                                    {/* Waveform Progress Bar */}
                                    <div className="flex-1 h-8 bg-slate-950 rounded-lg relative overflow-hidden flex items-center px-2 gap-[2px]">
                                        {[...Array(30)].map((_, i) => (
                                            <div 
                                                key={i} 
                                                className={`w-1 rounded-full transition-all duration-300 ${
                                                    playingFileId === result.file_id 
                                                        ? 'bg-cyan-500/50 animate-pulse' 
                                                        : 'bg-slate-800'
                                                }`}
                                                style={{ 
                                                    height: `${Math.max(20, Math.random() * 100)}%`,
                                                    opacity: (i / 30) * 100 < audioProgress ? 1 : 0.3
                                                }}
                                            />
                                        ))}
                                        <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none" style={{ width: `${playingFileId === result.file_id ? audioProgress : 0}%`, transition: 'width 0.1s linear' }}></div>
                                    </div>

                                    <div className="text-[10px] font-mono text-slate-400 min-w-[80px] text-right">
                                        {playingFileId === result.file_id ? formatTime(currentTime) : "00:00"} / {formatTime(playingFileId === result.file_id ? duration : result.duration)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Species Reference Image */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">Species Reference</span>
                            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-700/50 relative shadow-lg group/img">
                                <img 
                                    key={activeSpeciesName}
                                    src={activeImageUrl} 
                                    alt={activeSpeciesName} 
                                    className="w-full h-full object-cover animate-in fade-in transition-opacity duration-300"
                                    onError={(e) => { (e.target as HTMLImageElement).src = `${API_BASE}/api/static/bat_species/placeholder.jpg`; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                                <div className="absolute bottom-4 left-4">
                                    <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5">
                                        {selectedSpeciesPreview[result.file_id] ? 'Selected Preview' : 'Dominant Match'}
                                    </p>
                                    <h4 className="text-xl font-bold text-white leading-none italic">{activeSpeciesName}</h4>
                                </div>
                            </div>
                        </div>

                        {/* 3. Detected Species List */}
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detected Candidates</span>
                                <span className="text-[10px] text-slate-600">Click row to preview image</span>
                            </div>
                            <div className="space-y-1 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {result.species_detected.map((s, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => handleSpeciesClick(s.species, result.file_id)}
                                        className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-all border ${
                                            (activeSpeciesName === s.species) ? 'bg-cyan-900/20 border-cyan-500/30' : 'bg-transparent border-transparent hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${idx === 0 ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400'}`}>{idx + 1}</div>
                                            <span className={`text-sm font-medium ${idx === 0 ? 'text-white' : 'text-slate-400'}`}>{s.species}</span>
                                        </div>
                                        <span className="font-mono text-xs text-slate-500 w-20 text-right">{formatConfidence(s.confidence)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                      </div>

                      {/* --- RIGHT COLUMN: Parameters & Actions --- */}
                      <div className="flex flex-col h-full">
                        
                        {/* 1. AI Explanation Box (Auto-Triggered) */}
                        <div className={`mb-6 p-4 rounded-xl border relative transition-all duration-500 ${
                            isLoadingAI 
                                ? 'bg-indigo-950/20 border-indigo-500/20 animate-pulse' 
                                : explanation 
                                    ? 'bg-indigo-950/40 border-indigo-500/30' 
                                    : 'hidden'
                        }`}>
                            <div className="flex gap-3">
                              <Bot className={`w-5 h-5 mt-1 shrink-0 ${isLoadingAI ? 'text-indigo-500' : 'text-indigo-400'}`} />
                              <div className="prose prose-invert prose-sm text-indigo-200 leading-relaxed">
                                {isLoadingAI ? (
                                    <p className="text-indigo-400 font-medium">Analyzing signal structure...</p>
                                ) : (
                                    explanation?.split('\n').map((l, i) => <p key={i} className="mb-1">{l}</p>)
                                )}
                              </div>
                            </div>
                        </div>

                        {/* 2. Full Parameters Grid */}
                        <div className="flex-1">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Mic className="w-3 h-3" /> Acoustic Parameters
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { l: 'Start Frequency', v: `${result.call_parameters.start_frequency} kHz` },
                                    { l: 'End Frequency', v: `${result.call_parameters.end_frequency} kHz` },
                                    { l: 'Peak Frequency', v: `${result.call_parameters.peak_frequency} kHz` },
                                    { l: 'Bandwidth', v: `${result.call_parameters.bandwidth} kHz` },
                                    { l: 'Pulse Duration', v: `${result.call_parameters.pulse_duration} ms` },
                                    { l: 'Intensity', v: result.call_parameters.intensity ? `${result.call_parameters.intensity.toFixed(1)} dB` : 'N/A' },
                                    { l: 'Call Shape', v: result.call_parameters.shape, highlight: true },
                                    { l: 'Confidence', v: formatConfidence(result.species_detected[0]?.confidence), highlight: true },
                                ].map((p, i) => (
                                    <div key={i} className={`p-3 rounded-xl border transition-all ${p.highlight ? 'bg-slate-800/60 border-slate-600' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}>
                                        <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">{p.l}</span>
                                        <span className={`font-mono font-bold text-sm ${p.highlight ? 'text-white' : 'text-cyan-400'}`}>{p.v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Bottom Actions */}
                        <div className="mt-8 pt-6 border-t border-slate-800/50 grid grid-cols-2 gap-3">
                             <button onClick={() => fetchAIExplanation(result)} className="py-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-xl border border-indigo-500/30 flex items-center justify-center gap-2 transition-all font-bold text-sm hover:shadow-lg hover:shadow-indigo-900/20">
                                <RefreshCw className={`w-4 h-4 ${isLoadingAI ? 'animate-spin' : ''}`} /> Refresh Data
                             </button>
                             <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => handleDownloadPDF(result.file_id)} className="py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 font-bold text-sm">
                                    <FileText className="w-4 h-4" /> Report
                                </button>
                                <button onClick={() => handleDelete(result.file_id)} className="py-3 bg-red-900/10 hover:bg-red-900/20 text-red-400 rounded-xl border border-red-900/20 transition-all flex items-center justify-center gap-2 font-bold text-sm">
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                             </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}
              </div>
          )})}
        </div>
      )}

      <style>{`
        @keyframes music-bar { 0% { height: 20%; } 50% { height: 100%; } 100% { height: 20%; } }
        .animate-music-bar { animation: music-bar 0.4s ease-in-out infinite alternate; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      `}</style>
    </div>
  );
};