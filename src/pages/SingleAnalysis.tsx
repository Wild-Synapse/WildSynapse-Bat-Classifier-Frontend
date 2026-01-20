import React, { useState } from 'react';
import { Upload, FileAudio, ImageIcon, Settings, CheckCircle, RefreshCw, Zap, Pause, Play, FileText, Activity, Waves, Clock, Mic, Target, AlertCircle, BarChart3 } from 'lucide-react';
import { AnalysisResult } from '../types';

interface SingleAnalysisProps {
  darkMode: boolean;
  API_BASE: string;
  defaultThreshold: number;
  defaultMaxFreq: number;
  fetchResults: () => void;
  fetchStatistics: () => void;
}

export const SingleAnalysis: React.FC<SingleAnalysisProps> = ({ 
  darkMode, 
  API_BASE, 
  defaultThreshold, 
  defaultMaxFreq,
  fetchResults,
  fetchStatistics
}) => {
  const [fileType, setFileType] = useState<'audio' | 'spectrogram'>('audio');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState(defaultThreshold);
  const [maxFreq, setMaxFreq] = useState(defaultMaxFreq);
  const [maxThreshold] = useState(0.5);
  const [theme, setTheme] = useState('dark_viridis');
  const [analyzing, setAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [playingFileId, setPlayingFileId] = useState<string | null>(null);
  const [audioRef] = useState(new Audio());

  const cardClass = darkMode ? 'bg-slate-900/50 backdrop-blur-xl border-slate-800/50' : 'bg-white/80 backdrop-blur-xl border-slate-200';
  const mutedClass = darkMode ? 'text-slate-400' : 'text-slate-600';

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

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
          Acoustic Diagnostics Lab
        </h2>
        <p className={`${mutedClass}`}>Process individual recordings with precision AI models</p>
      </div>
      
      <div className={`${cardClass} border rounded-3xl p-8 shadow-2xl`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-3 text-cyan-500 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Input Configuration
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFileType('audio')}
                  className={`flex flex-col items-center gap-3 p-6 rounded-2xl transition-all border-2 ${
                    fileType === 'audio'
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/20'
                      : `${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'} opacity-60 hover:opacity-100`
                  }`}
                >
                  <FileAudio className="w-8 h-8" />
                  <span className="font-bold text-sm">Audio (.wav)</span>
                </button>
                <button
                  onClick={() => setFileType('spectrogram')}
                  className={`flex flex-col items-center gap-3 p-6 rounded-2xl transition-all border-2 ${
                    fileType === 'spectrogram'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/20'
                      : `${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'} opacity-60 hover:opacity-100`
                  }`}
                >
                  <ImageIcon className="w-8 h-8" />
                  <span className="font-bold text-sm">Image (.png)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-3 text-cyan-500 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Analysis Parameters
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs text-slate-500 font-medium">Min Confidence</span>
                  <input 
                    type="number" 
                    value={threshold} 
                    onChange={e => setThreshold(parseFloat(e.target.value))} 
                    step="0.01" 
                    className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-300'} border focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all`} 
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-xs text-slate-500 font-medium">Max Frequency (kHz)</span>
                  <input 
                    type="number" 
                    value={maxFreq} 
                    onChange={e => setMaxFreq(parseInt(e.target.value))} 
                    className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-300'} border focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all`} 
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <span className="text-xs text-slate-500 font-medium">Spectrogram Theme</span>
                  <select 
                    value={theme} 
                    onChange={e => setTheme(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-300'} border focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all`}
                  >
                    <option value="dark_viridis">Dark Viridis</option>
                    <option value="light_inferno">Light Inferno</option>
                    <option value="plasma">Plasma</option>
                    <option value="magma">Magma</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 flex flex-col justify-between">
            <div className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-12 transition-all ${selectedFile ? 'border-cyan-500 bg-cyan-500/5' : `${darkMode ? 'border-slate-700' : 'border-slate-300'} hover:border-cyan-500/50`}`}>
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
                    <CheckCircle className="w-16 h-16 text-cyan-500 mx-auto mb-4 animate-pulse" />
                    <p className="font-bold text-lg text-white mb-2">{selectedFile.name}</p>
                    <p className="text-sm text-slate-500">Ready for analysis</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="font-bold text-lg text-slate-300 mb-2">Click to Upload</p>
                    <p className="text-sm text-slate-500">or drag and drop here</p>
                  </>
                )}
              </label>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || analyzing}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                analyzing 
                  ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-500/25 hover:shadow-cyan-500/40 transform hover:-translate-y-1'
              }`}
            >
              {analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" /> 
                  Processing Signal...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  Run AI Classification
                </span>
              )}
            </button>
          </div>
        </div>

        {currentResult && (
          <div className="mt-12 pt-8 border-t border-slate-700/50 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg shadow-cyan-500/30">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Analysis Complete</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-6">
                <div className="relative group overflow-hidden rounded-2xl border border-slate-700/50 bg-black shadow-2xl">
                  <img 
                    src={`${API_BASE}${currentResult.spectrogram_url}`} 
                    alt="Spectrogram" 
                    className="w-full object-contain opacity-90 group-hover:opacity-100 transition-opacity" 
                  />
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-cyan-400 border border-cyan-500/30 shadow-lg">
                    SPECTROGRAM ANALYSIS
                  </div>
                </div>

                {currentResult.audio_url && (
                  <div className={`p-5 rounded-2xl border flex items-center justify-between ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100 border-slate-200'} backdrop-blur-sm`}>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => { 
                          if (currentResult.audio_url) toggleAudio(currentResult.audio_url, currentResult.file_id); 
                        }}
                        className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105"
                      >
                        {playingFileId === currentResult.file_id ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white ml-1" />
                        )}
                      </button>
                      <div>
                        <p className="font-bold">Audio Playback</p>
                        <p className="text-xs text-slate-500">Time-expanded (10x slower)</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadPDF(currentResult.file_id)}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-bold text-slate-300 transition-colors border border-slate-700"
                    >
                      <FileText className="w-4 h-4 inline mr-2" />
                      PDF Report
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Peak Freq', val: `${currentResult.call_parameters.peak_frequency} kHz`, icon: Activity },
                    { label: 'Bandwidth', val: `${currentResult.call_parameters.bandwidth} kHz`, icon: Waves },
                    { label: 'Duration', val: `${currentResult.call_parameters.pulse_duration} ms`, icon: Clock },
                    { label: 'Shape', val: currentResult.call_parameters.shape, icon: Mic }
                  ].map((p, i) => (
                    <div key={i} className={`p-4 rounded-xl border text-center ${darkMode ? 'bg-slate-900/50 border-slate-800 backdrop-blur-sm' : 'bg-white border-slate-200'} hover:border-cyan-500/50 transition-all`}>
                      <div className="flex justify-center mb-2">
                        <p.icon className="w-4 h-4 text-cyan-500" />
                      </div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">{p.label}</p>
                      <p className="font-mono text-cyan-400 font-bold text-sm">{p.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                {currentResult.species_image_url && (
                  <div className="relative h-56 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50">
                    <img 
                      src={currentResult.species_image_url.startsWith('http') ? currentResult.species_image_url : `${API_BASE}${currentResult.species_image_url}`} 
                      className="w-full h-full object-cover" 
                      alt="Species" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-xs text-cyan-400 font-bold mb-1 flex items-center gap-2">
                        <Target className="w-3 h-3" />
                        PRIMARY MATCH
                      </p>
                      <p className="text-2xl font-bold text-white italic">{currentResult.species_detected[0]?.species}</p>
                    </div>
                  </div>
                )}

                <div className={`${cardClass} border rounded-2xl p-6 shadow-xl`}>
                  <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    Multi-Species Classification
                  </h4>
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-2" style={{scrollbarWidth: 'thin', scrollbarColor: '#475569 transparent'}}>
                    {currentResult.species_detected
                      .filter(s => s.confidence >= threshold) 
                      .slice(0, 8)
                      .map((s, i) => {
                        const isFloat = s.confidence <= 1.0;
                        const percentage = isFloat ? (s.confidence * 100) : s.confidence;
                        
                        return (
                          <div key={i} className="group">
                            <div className="flex justify-between text-sm mb-2">
                              <span className={`font-medium ${i===0 ? 'text-white' : 'text-slate-400'}`}>
                                {s.species}
                              </span>
                              <span className={`${i===0 ? 'text-cyan-400 font-bold' : 'text-slate-500'} font-mono`}>
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className={`h-2.5 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded-full overflow-hidden`}>
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  i===0 
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/50' 
                                    : 'bg-slate-600'
                                }`} 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    
                    {currentResult.species_detected.filter(s => s.confidence >= threshold).length === 0 && (
                      <div className="text-center py-6 text-slate-500 text-sm">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No species above threshold ({threshold})
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
  );
};