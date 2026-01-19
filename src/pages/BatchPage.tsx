import React, { useState } from 'react';
import { Upload, FileAudio, Image as ImageIcon, Loader2, Download, CheckCircle2, XCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://wildsynapse-bat-classifier-backend-570998533708.europe-west1.run.app';

type InputMode = 'audio' | 'spectrogram';

interface BatchResult {
  batch_id: string;
  total_files: number;
  completed: number;
  failed: number;
  results: any[];
}

export default function BatchPage() {
  const [inputMode, setInputMode] = useState<InputMode>('audio');
  const [files, setFiles] = useState<FileList | null>(null);
  const [theme, setTheme] = useState('dark_viridis');
  const [threshold, setThreshold] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
      setBatchResult(null);
    }
  };

  const handleBatchProcess = async () => {
    if (!files || files.length === 0) return;

    setProcessing(true);
    setProgress(0);

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });
    formData.append('input_type', inputMode);
    formData.append('theme', theme);
    formData.append('threshold', (threshold / 100).toString());

    try {
      const response = await fetch(`${API_URL}/api/analyze/batch`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Batch processing failed');

      const data = await response.json();
      setBatchResult(data);
      setProgress(100);
    } catch (error) {
      console.error('Batch processing error:', error);
      alert('Batch processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadCSV = async () => {
    try {
      const response = await fetch(`${API_URL}/api/download/csv`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'batch_results.csv';
      a.click();
    } catch (error) {
      console.error('CSV download error:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          Batch Processing
        </h1>
        <p className="text-gray-400 text-lg">
          Analyze multiple bat calls simultaneously with advanced configuration
        </p>
      </div>

      {/* Configuration */}
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
        <h2 className="text-xl font-semibold text-white mb-4">Batch Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Mode */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Input Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setInputMode('audio')}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                  inputMode === 'audio'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                <FileAudio className="w-5 h-5" />
                <span>Audio Files</span>
              </button>
              <button
                onClick={() => setInputMode('spectrogram')}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                  inputMode === 'spectrogram'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
                <span>Spectrograms</span>
              </button>
            </div>
          </div>

          {/* Theme */}
          {inputMode === 'audio' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Spectrogram Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-purple-500/20 focus:border-purple-500 focus:outline-none"
              >
                <option value="dark_viridis">Dark Viridis</option>
                <option value="bright_plasma">Bright Plasma</option>
                <option value="classic_grayscale">Classic Grayscale</option>
                <option value="inferno">Inferno</option>
                <option value="magma">Magma</option>
                <option value="jet">Jet</option>
              </select>
            </div>
          )}

          {/* Threshold */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-300">
              Detection Threshold: {threshold}%
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>
        </div>

        {/* File Upload */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Upload Multiple {inputMode === 'audio' ? 'Audio Files (.wav)' : 'Spectrogram Images'}
          </label>
          <label className="flex items-center justify-center space-x-2 px-4 py-12 border-2 border-dashed border-purple-500/50 rounded-lg cursor-pointer hover:border-purple-500 transition-all bg-slate-900/50">
            <Upload className="w-8 h-8 text-purple-400" />
            <div className="text-center">
              <p className="text-gray-300">
                {files ? `${files.length} file(s) selected` : 'Click to select multiple files'}
              </p>
              <p className="text-sm text-gray-500 mt-1">Drag and drop supported</p>
            </div>
            <input
              type="file"
              multiple
              accept={inputMode === 'audio' ? '.wav' : '.png,.jpg,.jpeg'}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Process Button */}
        <button
          onClick={handleBatchProcess}
          disabled={!files || files.length === 0 || processing}
          className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing {files?.length} files...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Process Batch</span>
            </>
          )}
        </button>
      </div>

      {/* Progress */}
      {processing && (
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
          <h3 className="text-lg font-semibold text-white mb-4">Processing Progress</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {batchResult && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Files</p>
                  <p className="text-3xl font-bold text-white">{batchResult.total_files}</p>
                </div>
                <Upload className="w-10 h-10 text-purple-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-green-400">{batchResult.completed}</p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-red-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Failed</p>
                  <p className="text-3xl font-bold text-red-400">{batchResult.failed}</p>
                </div>
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="flex justify-center">
            <button
              onClick={downloadCSV}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105"
            >
              <Download className="w-5 h-5" />
              <span>Download Results (CSV)</span>
            </button>
          </div>

          {/* Results Table */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 overflow-x-auto">
            <h3 className="text-xl font-semibold text-white mb-4">Processed Files</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="pb-3 text-gray-400 font-medium">Filename</th>
                  <th className="pb-3 text-gray-400 font-medium">Top Species</th>
                  <th className="pb-3 text-gray-400 font-medium">Confidence</th>
                  <th className="pb-3 text-gray-400 font-medium">Total Detected</th>
                </tr>
              </thead>
              <tbody>
                {batchResult.results.map((result, index) => (
                  <tr key={index} className="border-b border-slate-700/50">
                    <td className="py-3 text-white">{result.original_filename}</td>
                    <td className="py-3 text-purple-400 italic">
                      {result.species_detected[0]?.species || 'N/A'}
                    </td>
                    <td className="py-3 text-white">
                      {result.species_detected[0]?.confidence.toFixed(2) || '0.00'}%
                    </td>
                    <td className="py-3 text-white">{result.species_detected.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}