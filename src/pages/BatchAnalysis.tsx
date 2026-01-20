import React, { useState } from 'react';
import { Package, RefreshCw, Zap, CheckCircle } from 'lucide-react';
import { AnalysisResult } from '../types';

interface BatchAnalysisProps {
  darkMode: boolean;
  API_BASE: string;
  defaultThreshold: number;
  defaultMaxFreq: number;
  fetchResults: () => void;
  fetchStatistics: () => void;
}

export const BatchAnalysis: React.FC<BatchAnalysisProps> = ({
  darkMode,
  API_BASE,
  defaultThreshold,
  defaultMaxFreq,
  fetchResults,
  fetchStatistics
}) => {
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchResults, setBatchResults] = useState<AnalysisResult[]>([]);
  const [batchAnalyzing, setBatchAnalyzing] = useState(false);
  const [batchTheme, setBatchTheme] = useState('dark_viridis');
  const [batchThreshold, setBatchThreshold] = useState(defaultThreshold);
  const [batchMaxThreshold] = useState(0.5);
  const [batchMaxFreq, setBatchMaxFreq] = useState(defaultMaxFreq);
  const [fileType] = useState<'audio' | 'spectrogram'>('audio'); // Defaulting for batch

  const cardClass = darkMode ? 'bg-slate-900/50 backdrop-blur-xl border-slate-800/50' : 'bg-white/80 backdrop-blur-xl border-slate-200';
  const mutedClass = darkMode ? 'text-slate-400' : 'text-slate-600';

  const handleBatchAnalyze = async () => {
    if (batchFiles.length === 0) return;
    
    setBatchAnalyzing(true);
    setBatchResults([]);
    
    try {
      const formData = new FormData();
      batchFiles.forEach(file => formData.append('files', file));
      formData.append('input_type', fileType);
      formData.append('theme', batchTheme);
      formData.append('threshold', batchThreshold.toString());
      formData.append('max_threshold', batchMaxThreshold.toString());
      formData.append('max_freq', batchMaxFreq.toString());
      
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

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
          High-Throughput Processing
        </h2>
        <p className={`${mutedClass}`}>Analyze entire datasets in parallel</p>
      </div>

      <div className={`${cardClass} border rounded-3xl p-8 shadow-2xl`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">Min Confidence</label>
            <input 
              type="number" 
              value={batchThreshold} 
              onChange={e => setBatchThreshold(parseFloat(e.target.value))} 
              step="0.01"
              className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-300'} border focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">Max Frequency (kHz)</label>
            <input 
              type="number" 
              value={batchMaxFreq} 
              onChange={e => setBatchMaxFreq(parseInt(e.target.value))}
              className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-300'} border focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">Spectrogram Theme</label>
            <select 
              value={batchTheme} 
              onChange={e => setBatchTheme(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-300'} border focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none`}
            >
              <option value="dark_viridis">Dark Viridis</option>
              <option value="light_inferno">Light Inferno</option>
              <option value="plasma">Plasma</option>
              <option value="magma">Magma</option>
            </select>
          </div>
        </div>

        <div className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
          batchFiles.length > 0 ? 'border-cyan-500 bg-cyan-500/5' : `${darkMode ? 'border-slate-700' : 'border-slate-300'} hover:border-cyan-500/50`
        }`}>
          <input 
            type="file" 
            multiple 
            onChange={(e) => setBatchFiles(Array.from(e.target.files || []))} 
            className="hidden" 
            id="batchInput" 
            accept=".wav,.png,.jpg,.jpeg"
          />
          <label htmlFor="batchInput" className="cursor-pointer block">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 hover:scale-110 transition-transform shadow-lg shadow-cyan-500/30">
              <Package className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Drag & Drop Multiple Files</h3>
            <p className="text-slate-500 mb-6">Process entire datasets simultaneously</p>
            <span className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-white font-bold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25">
              Select Files
            </span>
          </label>

          {batchFiles.length > 0 && (
            <div className="mt-8">
              <p className="text-cyan-400 font-bold mb-4 flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {batchFiles.length} Files Ready
              </p>
              <button 
                onClick={handleBatchAnalyze} 
                disabled={batchAnalyzing} 
                className={`px-10 py-4 rounded-xl font-bold shadow-lg transition-all ${
                  batchAnalyzing 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-500/25 hover:shadow-cyan-500/40 transform hover:-translate-y-1'
                }`}
              >
                {batchAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Processing {batchFiles.length} Files...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Start Batch Analysis
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {batchResults.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-cyan-500" />
              Batch Results ({batchResults.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batchResults.map((result, idx) => (
                <div key={idx} className={`${cardClass} border rounded-2xl p-5 hover:border-cyan-500/50 transition-all shadow-xl group`}>
                  <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-black border border-slate-700/50">
                    <img 
                      src={`${API_BASE}${result.spectrogram_url}`} 
                      alt={result.original_filename} 
                      className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <h4 className="font-bold truncate mb-2" title={result.original_filename}>{result.original_filename}</h4>
                  <p className="text-sm text-cyan-400 font-semibold mb-3">
                    {result.species_detected[0]?.species || 'Unknown'}
                  </p>
                  <button
                    onClick={() => handleDownloadPDF(result.file_id)}
                    className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-colors border border-slate-700"
                  >
                    Download PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};