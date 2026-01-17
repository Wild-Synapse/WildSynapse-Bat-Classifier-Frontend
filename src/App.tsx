import { useState, useEffect, useCallback } from 'react';
import { Activity, Upload, History, BarChart3, Download, Trash2, FileAudio, Image as ImageIcon, CheckCircle, XCircle, AlertCircle, Wifi, WifiOff, Moon, Sun, RefreshCw, Play, Pause, FileText, Package, ChevronDown, ChevronUp, TrendingUp, PieChart, Waves, Mic, MessageSquare, Send, Zap, Database, Clock, Target, Leaf } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

const API_BASE = 'http://localhost:8000';

type SpeciesDetected = {
  species: string;
  confidence: number;
};

type CallParameters = {
  start_frequency: number;
  end_frequency: number;
  peak_frequency: number;
  bandwidth: number;
  pulse_duration: number;
  intensity?: number;
  shape: string;
};

type AnalysisResult = {
  file_id: string;
  original_filename: string;
  timestamp: number;
  duration: number;
  sample_rate: number;
  spectrogram_url: string;
  species_image_url?: string;
  audio_url?: string;
  species_detected: SpeciesDetected[];
  call_parameters: CallParameters;
  threshold?: number;
  max_threshold?: number;
};

// Updated Colors to Greenish-Blue / Teal / Cyan
const COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#14b8a6', '#f59e0b', '#84cc16', '#6366f1'];

const BatAnalyzerApp = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'audio' | 'spectrogram'>('audio');
  const [theme, setTheme] = useState('dark_viridis');
  const [threshold, setThreshold] = useState(0.01);
  const [maxThreshold, setMaxThreshold] = useState(0.5);
  const [maxFreq, setMaxFreq] = useState(250);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchResults, setBatchResults] = useState<AnalysisResult[]>([]);
  const [batchAnalyzing, setBatchAnalyzing] = useState(false);
  
  const [playing, setPlaying] = useState(false);
  const [audioRef] = useState(new Audio());
  
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [filterSpecies, setFilterSpecies] = useState<string>('all');
  
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  const [selectedSpeciesAnalytics, setSelectedSpeciesAnalytics] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/health/detailed`);
      const data = await res.json();
      setHealthStatus(data);
      setIsOnline(true);
    } catch (error) {
      setIsOnline(false);
    }
  }, []);

  const fetchStatistics = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stats`);
      const data = await res.json();
      setStatistics(data);
    } catch (error) {
      console.error('Stats fetch failed');
    }
  }, []);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/results`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Results fetch failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    fetchStatistics();
    fetchResults();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth, fetchStatistics, fetchResults]);

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    setAnalyzing(true);
    setCurrentResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('theme', theme);
      formData.append('threshold', threshold.toString());
      formData.append('max_threshold', maxThreshold.toString());
      formData.append('max_freq', maxFreq.toString());
      
      const endpoint = fileType === 'audio' 
        ? `${API_BASE}/api/analyze/audio`
        : `${API_BASE}/api/analyze/spectrogram`;
      
      const res = await fetch(endpoint, { method: 'POST', body: formData });
      
      if (!res.ok) throw new Error('Analysis failed');
      
      const data = await res.json();
      
      // FIX: Handle potential nesting (e.g., data.result or just data)
      // If the API returns { result: { ... } }, use that. Otherwise use data.
      const validResult = data.result || data.data || data;

      setCurrentResult(validResult);
      fetchStatistics();
      fetchResults();
    } catch (error) {
      console.error(error);
      alert('Analysis failed. Please check the console for details.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleBatchAnalyze = async () => {
    if (batchFiles.length === 0) return;
    
    setBatchAnalyzing(true);
    setBatchResults([]);
    
    try {
      const formData = new FormData();
      batchFiles.forEach(file => formData.append('files', file));
      formData.append('input_type', fileType);
      formData.append('theme', theme);
      formData.append('threshold', threshold.toString());
      formData.append('max_threshold', maxThreshold.toString());
      formData.append('max_freq', maxFreq.toString());
      
      const res = await fetch(`${API_BASE}/api/analyze/batch`, { method: 'POST', body: formData });
      
      if (!res.ok) throw new Error('Batch analysis failed');
      
      const data = await res.json();
      setBatchResults(data.results || []);
      fetchStatistics();
      fetchResults();
    } catch (error) {
      alert('Batch analysis failed. Please try again.');
    } finally {
      setBatchAnalyzing(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Delete this result?')) return;
    
    try {
      await fetch(`${API_BASE}/api/results/${fileId}`, { method: 'DELETE' });
      fetchResults();
      fetchStatistics();
    } catch (error) {
      console.error('Delete failed');
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/download/csv`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bat_analysis_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      alert('CSV download failed');
    }
  };

  const handleDownloadPDF = async (fileId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/download/pdf/${fileId}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bat_report_${fileId}.pdf`;
      a.click();
    } catch (error) {
      alert('PDF download failed');
    }
  };

  const toggleAudio = (url: string, fileId: string) => {
    if (playingFileId === fileId) {
      audioRef.pause();
      setPlayingFileId(null);
    } else {
      audioRef.src = `${API_BASE}${url}`;
      audioRef.play();
      setPlayingFileId(fileId);
      audioRef.onended = () => setPlayingFileId(null);
    }
  };

  const [playingFileId, setPlayingFileId] = useState<string | null>(null);

  const toggleExpanded = (fileId: string) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(fileId)) {
      newExpanded.delete(fileId);
    } else {
      newExpanded.add(fileId);
    }
    setExpandedResults(newExpanded);
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          history: results,
          statistics: statistics
        })
      });
      
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const getFilteredResults = () => {
    if (filterSpecies === 'all') return results;
    // Check if the filtered species appears anywhere in the detected list, not just the top
    return results.filter(r => r.species_detected.some(s => s.species === filterSpecies));
  };

  const getSpeciesAnalytics = (species: string) => {
    const speciesResults = results.filter(r => r.species_detected[0]?.species === species);
    
    const timeData = speciesResults.map(r => ({
      date: new Date(r.timestamp * 1000).toLocaleDateString(),
      count: 1,
      confidence: r.species_detected[0]?.confidence || 0
    }));
    
    const freqData = speciesResults.map(r => ({
      name: r.original_filename.slice(0, 15),
      peak: r.call_parameters.peak_frequency,
      start: r.call_parameters.start_frequency,
      end: r.call_parameters.end_frequency
    }));
    
    const durationData = speciesResults.map(r => ({
      name: r.original_filename.slice(0, 15),
      duration: r.call_parameters.pulse_duration
    }));
    
    return { timeData, freqData, durationData, count: speciesResults.length };
  };

  // Theme Classes - Green/Blue focus
  const bgClass = darkMode ? 'bg-slate-950' : 'bg-slate-50';
  const cardClass = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textClass = darkMode ? 'text-slate-100' : 'text-slate-900';
  const mutedClass = darkMode ? 'text-slate-400' : 'text-slate-500';
  const accentGradient = 'bg-gradient-to-r from-emerald-500 to-cyan-600';
  const accentText = 'bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent';

  const uniqueSpecies = [...new Set(results.flatMap(r => r.species_detected.map(s => s.species)).filter(Boolean))];

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} transition-colors duration-300 font-sans selection:bg-emerald-500/30`}>
      <header className={`${darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'} border-b sticky top-0 z-50 backdrop-blur-lg transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`${accentGradient} p-3 rounded-2xl shadow-lg shadow-emerald-500/20`}>
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold tracking-tight ${accentText}`}>
                  BioAcoustic AI
                </h1>
                <p className={`text-xs ${mutedClass} flex items-center gap-2 font-medium`}>
                  <Zap className="w-3 h-3 text-emerald-500" />
                  Multi-Species Identification Engine
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                <span className="text-xs font-semibold">{isOnline ? 'SYSTEM ONLINE' : 'DISCONNECTED'}</span>
              </div>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'} transition-all`}
              >
                {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>
              
              <button
                onClick={() => { fetchHealth(); fetchStatistics(); fetchResults(); }}
                className={`p-2 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'} transition-all`}
              >
                <RefreshCw className="w-5 h-5 text-cyan-500" />
              </button>
            </div>
          </div>
          
          <nav className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'analyze', label: 'Single Analysis', icon: Upload },
              { id: 'batch', label: 'Batch Processing', icon: Package },
              { id: 'history', label: 'Data History', icon: History },
              { id: 'analytics', label: 'Species Analytics', icon: TrendingUp },
              { id: 'chat', label: 'Eco-Assistant', icon: MessageSquare },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentPage(id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all whitespace-nowrap text-sm font-medium ${
                  currentPage === id
                    ? `${accentGradient} text-white shadow-lg shadow-emerald-500/25`
                    : darkMode
                    ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white border border-transparent hover:border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Page */}
        {currentPage === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">Ecological Overview</h2>
                <p className={`${mutedClass} mt-1`}>Live monitoring of acoustic sensors and classification metrics</p>
              </div>
              <button
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 text-white rounded-xl transition-all shadow-lg group"
              >
                <Download className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                Export Data CSV
              </button>
            </div>

            {healthStatus && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(healthStatus.services).map(([key, value]) => (
                  <div key={key} className={`${cardClass} border rounded-2xl p-4 hover:shadow-lg transition-all group`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs ${mutedClass} capitalize font-bold tracking-wider`}>{key.replace('_', ' ')}</span>
                      {value === 'online' || value === 'enabled' || value === 'loaded' || value === 'connected' ? (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      )}
                    </div>
                    <p className="text-sm font-bold capitalize flex items-center gap-2">
                        {String(value)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {statistics && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Recordings', value: statistics.total_analyses, icon: FileAudio, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Total Audio Hours', value: `${statistics.total_duration_hours.toFixed(1)}h`, icon: Clock, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
                    { label: 'Species Identified', value: statistics.unique_species_detected, icon: Target, color: 'text-teal-500', bg: 'bg-teal-500/10' },
                    { label: 'Storage Mode', value: statistics.storage_type, icon: Database, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                  ].map((stat, idx) => (
                    <div key={idx} className={`${cardClass} border rounded-2xl p-6 hover:translate-y-[-2px] transition-transform duration-300 shadow-xl shadow-black/5`}>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-sm font-medium ${mutedClass}`}>{stat.label}</span>
                        <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-white tracking-tight">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className={`${cardClass} border rounded-2xl p-6`}>
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-emerald-500" />
                      Species Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RePieChart>
                        <Pie
                          data={statistics.top_species.slice(0, 8).map((s: any) => ({ name: s.species, value: s.count }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statistics.top_species.slice(0, 8).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={darkMode ? '#0f172a' : '#fff'} strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#fff', borderRadius: '12px', border: '1px solid #1e293b' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className={`${cardClass} border rounded-2xl p-6`}>
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-cyan-500" />
                      Most Frequent Detections
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={statistics.top_species.slice(0, 6)}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1e293b' : '#e5e7eb'} vertical={false} />
                        <XAxis dataKey="species" tick={{ fontSize: 11, fill: '#64748b' }} angle={-25} textAnchor="end" height={60} axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#fff', borderRadius: '12px', border: '1px solid #1e293b' }} cursor={{fill: '#1e293b', opacity: 0.4}} />
                        <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]}>
                             {statistics.top_species.slice(0, 6).map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Analyze Page */}
        {currentPage === 'analyze' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl font-bold">Acoustic Diagnostics</h2>
              <p className={`${mutedClass} mt-1`}>Process individual files using the efficient-net backend</p>
            </div>
            
            <div className={`${cardClass} border rounded-3xl p-8 shadow-2xl shadow-black/20`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-3 text-emerald-500">Input Configuration</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setFileType('audio')}
                        className={`flex flex-col items-center gap-3 p-6 rounded-2xl transition-all border-2 ${
                          fileType === 'audio'
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                            : `${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'} opacity-70 hover:opacity-100`
                        }`}
                      >
                        <FileAudio className="w-8 h-8" />
                        <span className="font-bold">Audio (.wav)</span>
                      </button>
                      <button
                        onClick={() => setFileType('spectrogram')}
                        className={`flex flex-col items-center gap-3 p-6 rounded-2xl transition-all border-2 ${
                          fileType === 'spectrogram'
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                            : `${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'} opacity-70 hover:opacity-100`
                        }`}
                      >
                        <ImageIcon className="w-8 h-8" />
                        <span className="font-bold">Image (.png)</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-3 text-emerald-500">Parameters</label>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <span className="text-xs text-slate-400">Min Confidence</span>
                            <input type="number" value={threshold} onChange={e => setThreshold(parseFloat(e.target.value))} step="0.01" className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-200'} border focus:border-emerald-500 outline-none transition-colors`} />
                         </div>
                         <div className="space-y-2">
                            <span className="text-xs text-slate-400">Max Frequency (kHz)</span>
                            <input type="number" value={maxFreq} onChange={e => setMaxFreq(parseInt(e.target.value))} className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-200'} border focus:border-emerald-500 outline-none transition-colors`} />
                         </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 flex flex-col justify-between">
                   <div className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-12 transition-all ${selectedFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-700 hover:border-slate-500'}`}>
                      <input
                        type="file"
                        id="fileUpload"
                        accept={fileType === 'audio' ? '.wav' : '.png,.jpg,.jpeg'}
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <label htmlFor="fileUpload" className="cursor-pointer text-center">
                          {selectedFile ? (
                              <>
                                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                                <p className="font-bold text-lg text-white">{selectedFile.name}</p>
                                <p className="text-sm text-slate-500 mt-2">Ready to analyze</p>
                              </>
                          ) : (
                              <>
                                <Upload className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                <p className="font-bold text-lg text-slate-300">Click to Upload File</p>
                                <p className="text-sm text-slate-500 mt-2">or drag and drop here</p>
                              </>
                          )}
                      </label>
                   </div>

                   <button
                    onClick={handleAnalyze}
                    disabled={!selectedFile || analyzing}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${analyzing ? 'bg-slate-700 cursor-not-allowed text-slate-400' : `${accentGradient} hover:shadow-emerald-500/25 text-white transform hover:-translate-y-1`}`}
                  >
                    {analyzing ? (
                        <span className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-5 h-5 animate-spin" /> Processing Signal...
                        </span>
                    ) : 'Run Identification Model'}
                  </button>
                </div>
              </div>

              {currentResult && (
                <div className="mt-12 pt-8 border-t border-slate-700 animate-in fade-in slide-in-from-bottom-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-emerald-500 rounded-full">
                        <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold">Analysis Results</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Visuals */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="relative group overflow-hidden rounded-2xl border border-slate-700 bg-black">
                            <img src={`${API_BASE}${currentResult.spectrogram_url}`} alt="Spectrogram" className="w-full object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-emerald-400 border border-emerald-500/30">SPECTROGRAM</div>
                        </div>

                        {currentResult.audio_url && (
  <div className={`p-4 rounded-2xl border flex items-center justify-between ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100'}`}>
    <div className="flex items-center gap-4">
      <button
        // FIX: Pass both audio_url AND file_id
        onClick={() => { 
          if (currentResult.audio_url) {
            toggleAudio(currentResult.audio_url, currentResult.file_id); 
          }
        }}
        className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
      >
        {/* Check if THIS specific file is playing */}
        {playingFileId === currentResult.file_id ? (
          <Pause className="w-5 h-5 text-white" />
        ) : (
          <Play className="w-5 h-5 text-white ml-1" />
        )}
      </button>
      <div>
        <p className="font-bold text-sm">Audio Playback</p>
        <p className="text-xs text-slate-500">Time-expanded playback (10x)</p>
      </div>
    </div>
    <button
      onClick={() => handleDownloadPDF(currentResult.file_id)}
      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
    >
      Download Report
    </button>
  </div>
)}

                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: 'Peak Freq', val: `${currentResult.call_parameters.peak_frequency} kHz` },
                                { label: 'Bandwidth', val: `${currentResult.call_parameters.bandwidth} kHz` },
                                { label: 'Duration', val: `${currentResult.call_parameters.pulse_duration} ms` },
                                { label: 'Shape', val: currentResult.call_parameters.shape }
                            ].map((p, i) => (
                                <div key={i} className={`p-3 rounded-xl border text-center ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">{p.label}</p>
                                    <p className="font-mono text-emerald-400 font-bold">{p.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Species */}
                    <div className="lg:col-span-5 space-y-6">
                        {currentResult.species_image_url && (
                            <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg border border-slate-700">
                                <img src={currentResult.species_image_url.startsWith('http') ? currentResult.species_image_url : `${API_BASE}${currentResult.species_image_url}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                                <div className="absolute bottom-4 left-4">
                                    <p className="text-xs text-emerald-400 font-bold mb-1">TOP MATCH</p>
                                    <p className="text-xl font-bold text-white italic">{currentResult.species_detected[0]?.species}</p>
                                </div>
                            </div>
                        )}

                        <div className={`${cardClass} border rounded-2xl p-6`}>
    <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-slate-400">Classification Confidence</h4>
    <div className="space-y-4">
        {/* FIX: Filter by the user-defined threshold (e.g., 0.01) instead of 1 */}
        {currentResult.species_detected
            .filter(s => s.confidence >= threshold) 
            .slice(0, 5)
            .map((s, i) => {
                // FIX: Detect if confidence is 0-1 (float) or 0-100 (percentage)
                const isFloat = s.confidence <= 1.0;
                const percentage = isFloat ? (s.confidence * 100) : s.confidence;
                
                return (
                    <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className={`font-medium ${i===0 ? 'text-white' : 'text-slate-400'}`}>
                                {s.species}
                            </span>
                            <span className={`${i===0 ? 'text-emerald-400' : 'text-slate-500'} font-mono`}>
                                {percentage.toFixed(1)}%
                            </span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${i===0 ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-slate-600'}`} 
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>
                );
            })}
            
            {/* Fallback if no species pass the threshold */}
            {currentResult.species_detected.filter(s => s.confidence >= threshold).length === 0 && (
                <div className="text-center py-4 text-slate-500 text-sm">
                    No species detected above the confidence threshold ({threshold}).
                </div>
            )}
    </div>
</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Batch Page - similar green updates needed but keeping concise for length */}
        {currentPage === 'batch' && (
             <div className="space-y-6">
                <h2 className="text-3xl font-bold">Batch Processing</h2>
                <div className={`${cardClass} border rounded-3xl p-12 text-center border-dashed`}>
                    <input type="file" multiple onChange={(e) => setBatchFiles(Array.from(e.target.files || []))} className="hidden" id="batchInput" />
                    <label htmlFor="batchInput" className="cursor-pointer block">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 hover:bg-slate-700 transition-colors">
                            <Package className="w-10 h-10 text-cyan-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Drag & Drop Multiple Files</h3>
                        <p className="text-slate-500 mb-6">Process entire datasets in one go</p>
                        <span className="px-6 py-3 bg-slate-700 rounded-xl text-white font-bold hover:bg-slate-600 transition-colors">Select Files</span>
                    </label>
                    {batchFiles.length > 0 && (
                        <div className="mt-8">
                            <p className="text-emerald-400 font-bold mb-4">{batchFiles.length} Files Selected</p>
                            <button onClick={handleBatchAnalyze} disabled={batchAnalyzing} className={`px-8 py-3 ${accentGradient} text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20`}>
                                {batchAnalyzing ? 'Processing...' : 'Start Batch Analysis'}
                            </button>
                        </div>
                    )}
                </div>
                {/* Batch results display would go here, styled similarly to history */}
             </div>
        )}

        {/* ===================================================================================== */}
        {/* HISTORY PAGE - FULLY REMODIFIED AS REQUESTED */}
        {/* ===================================================================================== */}
        {currentPage === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">Data History</h2>
                <p className={`${mutedClass} mt-1`}>Archive of {results.length} acoustic events processed</p>
              </div>
              <div className={`flex items-center px-4 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <select
                    value={filterSpecies}
                    onChange={(e) => setFilterSpecies(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm py-2 w-40 text-slate-300"
                >
                    <option value="all">All Species</option>
                    {uniqueSpecies.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                 <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {getFilteredResults().map((result) => (
                  <div key={result.file_id} className={`${cardClass} border rounded-2xl transition-all duration-300 overflow-hidden group hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5`}>
                    
                    {/* Collapsed Header View */}
                    <div 
                        className="p-5 flex flex-col md:flex-row items-center justify-between cursor-pointer" 
                        onClick={() => toggleExpanded(result.file_id)}
                    >
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} text-emerald-500`}>
                                <Waves className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white truncate max-w-[200px] md:max-w-md" title={result.original_filename}>{result.original_filename}</h3>
                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(result.timestamp * 1000).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {result.species_detected.length} Matches</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Top Match</p>
                                <p className="text-emerald-400 font-bold">{result.species_detected[0]?.species || 'Unknown'}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(result.file_id); }} className="p-2 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="w-5 h-5" /></button>
                                <div className={`p-2 rounded-lg ${expandedResults.has(result.file_id) ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500'}`}>
                                    {expandedResults.has(result.file_id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* EXPANDED DETAILS VIEW */}
                    {expandedResults.has(result.file_id) && (
                        <div className={`border-t ${darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'} p-6 animate-in slide-in-from-top-2`}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                
                                {/* Left Column: Visuals */}
                                <div className="space-y-6">
                                    {/* Spectrogram Image - Properly Displayed */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                <Activity className="w-3 h-3 text-emerald-500" /> Spectrogram
                                            </span>
                                            {result.audio_url && (
                                                <button 
                                                    onClick={() => result.audio_url && toggleAudio(result.audio_url, result.file_id)}
                                                    className="flex items-center gap-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    {playingFileId === result.file_id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                                    {playingFileId === result.file_id ? 'Pause Audio' : 'Play Audio'}
                                                </button>
                                            )}
                                        </div>
                                        <div className="rounded-xl overflow-hidden border border-slate-700 bg-black relative group shadow-lg">
                                            <img 
                                                src={`${API_BASE}${result.spectrogram_url}`} 
                                                alt="Spectrogram Analysis" 
                                                className="w-full h-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity" 
                                            />
                                        </div>
                                    </div>

                                    {/* Download Actions */}
                                    <div className="flex gap-3">
                                        <button onClick={() => handleDownloadPDF(result.file_id)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all">
                                            <FileText className="w-4 h-4 text-emerald-500" /> Download PDF Report
                                        </button>
                                    </div>
                                </div>

                                {/* Right Column: Metrics & Species */}
                                <div className="space-y-6">
                                    {/* Metrics Grid - Professionally Displayed */}
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block flex items-center gap-2">
                                            <BarChart3 className="w-3 h-3 text-cyan-500" /> Acoustic Metrics
                                        </span>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {[
                                                { label: 'Start Freq', val: `${result.call_parameters.start_frequency} kHz`, icon: TrendingUp },
                                                { label: 'End Freq', val: `${result.call_parameters.end_frequency} kHz`, icon: TrendingUp },
                                                { label: 'Peak Freq', val: `${result.call_parameters.peak_frequency} kHz`, icon: Activity },
                                                { label: 'Bandwidth', val: `${result.call_parameters.bandwidth} kHz`, icon: Waves },
                                                { label: 'Duration', val: `${result.call_parameters.pulse_duration} ms`, icon: Clock },
                                                { label: 'Intensity', val: `${result.call_parameters.intensity?.toFixed(1) || 'N/A'} dB`, icon: Zap },
                                                { label: 'Call Shape', val: result.call_parameters.shape, icon: Mic, full: true } // Call shape spans full width
                                            ].map((m, idx) => (
                                                <div key={idx} className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} ${m.full ? 'col-span-2 sm:col-span-3 bg-slate-800/50' : ''}`}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <m.icon className="w-3 h-3 text-slate-500" />
                                                        <span className="text-[10px] uppercase font-bold text-slate-500">{m.label}</span>
                                                    </div>
                                                    <p className={`font-mono font-bold ${m.full ? 'text-white text-sm capitalize' : 'text-emerald-400 text-sm'}`}>{m.val}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Species & Image */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Species List */}
                                        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Identified Species</h4>
                                            <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                                {result.species_detected.map((s, idx) => (
                                                    <div key={idx} className="flex flex-col gap-1">
                                                        <div className="flex justify-between items-end text-xs">
                                                            <span className={idx === 0 ? 'text-white font-bold' : 'text-slate-400'}>{s.species}</span>
                                                            <span className={idx === 0 ? 'text-emerald-400' : 'text-slate-500'}>{s.confidence.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${idx === 0 ? 'bg-emerald-500' : 'bg-slate-500'}`} style={{ width: `${Math.min(s.confidence, 100)}%` }}></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Species Reference Image */}
                                        {result.species_image_url && (
                                            <div className="rounded-xl overflow-hidden border border-slate-700 relative h-full min-h-[140px]">
                                                <img 
                                                    src={result.species_image_url.startsWith('http') ? result.species_image_url : `${API_BASE}${result.species_image_url}`} 
                                                    alt="Species Reference" 
                                                    className="w-full h-full object-cover" 
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                                                <div className="absolute bottom-2 left-3">
                                                    <p className="text-[10px] text-emerald-400 font-bold uppercase">Reference</p>
                                                    <p className="text-xs font-bold text-white truncate w-32">{result.species_detected[0]?.species}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Page */}
        {currentPage === 'analytics' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <h2 className="text-3xl font-bold">Population Analytics</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {uniqueSpecies.slice(0, 12).map(species => (
                 <button
                   key={species}
                   onClick={() => setSelectedSpeciesAnalytics(species)}
                   className={`p-4 rounded-2xl transition-all border-2 text-left group ${
                     selectedSpeciesAnalytics === species
                       ? 'bg-emerald-500/10 border-emerald-500'
                       : `${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} hover:border-emerald-500/50`
                   }`}
                 >
                   <p className="text-2xl mb-2 group-hover:scale-110 transition-transform">🦇</p>
                   <p className={`font-bold text-sm truncate ${selectedSpeciesAnalytics === species ? 'text-emerald-400' : 'text-slate-300'}`}>{species}</p>
                 </button>
               ))}
             </div>
             
             {selectedSpeciesAnalytics && (() => {
                const analytics = getSpeciesAnalytics(selectedSpeciesAnalytics);
                return (
                    <div className={`${cardClass} border rounded-3xl p-8`}>
                        <div className="flex items-center gap-4 mb-8">
                            <h3 className="text-3xl font-bold text-white italic">{selectedSpeciesAnalytics}</h3>
                            <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-mono border border-slate-700">DATA REPORT</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                                <p className="text-xs font-bold text-emerald-500 mb-2 uppercase">Occurrences</p>
                                <p className="text-4xl font-bold text-white">{analytics.count}</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
                                <p className="text-xs font-bold text-cyan-500 mb-2 uppercase">Avg Frequency</p>
                                <p className="text-4xl font-bold text-white">{(analytics.freqData.reduce((sum, d) => sum + d.peak, 0) / analytics.freqData.length).toFixed(1)} <span className="text-sm text-slate-500">kHz</span></p>
                            </div>
                            <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/20">
                                <p className="text-xs font-bold text-purple-500 mb-2 uppercase">Avg Duration</p>
                                <p className="text-4xl font-bold text-white">{(analytics.durationData.reduce((sum, d) => sum + d.duration, 0) / analytics.durationData.length).toFixed(1)} <span className="text-sm text-slate-500">ms</span></p>
                            </div>
                        </div>

                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.freqData}>
                                    <defs>
                                        <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" hide />
                                    <YAxis tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                                    <Area type="monotone" dataKey="peak" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPeak)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );
             })()}
          </div>
        )}

        {/* Chat Page */}
        {currentPage === 'chat' && (
             <div className="max-w-4xl mx-auto h-[80vh] flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.length === 0 && (
                        <div className="text-center mt-20 opacity-50">
                            <Leaf className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
                            <p>Ask Eco-Assistant about your bat data...</p>
                        </div>
                    )}
                    {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {chatLoading && <div className="p-4 bg-slate-800 rounded-2xl w-20 flex justify-center"><RefreshCw className="w-5 h-5 animate-spin text-emerald-500" /></div>}
                </div>
                <div className="p-4 bg-slate-900 border-t border-slate-800 mt-4 rounded-2xl flex gap-3">
                    <input 
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 text-white focus:border-emerald-500 outline-none transition-colors"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        placeholder="Type your question..."
                        onKeyDown={e => e.key === 'Enter' && handleChatSubmit()}
                    />
                    <button onClick={handleChatSubmit} className="p-3 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-white transition-colors">
                        <Send className="w-5 h-5" />
                    </button>
                </div>
             </div>
        )}
      </main>
    </div>
  );
};

export default BatAnalyzerApp;