import React, { useState, useEffect } from 'react';
import { Trash2, Download, Eye, Loader2, Search, Calendar } from 'lucide-react';
import SpeciesCard from '../components/SpeciesCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface HistoryItem {
  file_id: string;
  original_filename: string;
  timestamp: number;
  species_detected: any[];
  call_parameters: any;
  spectrogram_url: string;
  duration: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/results`);
      const data = await response.json();
      setHistory(data.results || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;

    try {
      await fetch(`${API_URL}/api/results/${fileId}`, {
        method: 'DELETE',
      });
      setHistory(history.filter(item => item.file_id !== fileId));
      if (selectedItem?.file_id === fileId) {
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete analysis');
    }
  };

  const downloadPDF = async (fileId: string, filename: string) => {
    try {
      const response = await fetch(`${API_URL}/api/download/pdf/${fileId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${filename}.pdf`;
      a.click();
    } catch (error) {
      console.error('PDF download error:', error);
    }
  };

  const downloadAllCSV = async () => {
    try {
      const response = await fetch(`${API_URL}/api/download/csv`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'all_analyses.csv';
      a.click();
    } catch (error) {
      console.error('CSV download error:', error);
    }
  };

  const filteredHistory = history.filter(item =>
    item.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.species_detected.some(s => s.species.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Analysis <span className="text-purple-400">History</span>
          </h1>
          <p className="text-gray-400 text-lg mt-2">
            {history.length} total analyses
          </p>
        </div>
        
        <button
          onClick={downloadAllCSV}
          className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
        >
          <Download className="w-5 h-5" />
          <span>Export All (CSV)</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by filename or species..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-700 text-white rounded-lg border border-purple-500/20 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* History List */}
        <div className="lg:col-span-1 space-y-4 max-h-[800px] overflow-y-auto">
          {filteredHistory.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20 text-center">
              <p className="text-gray-400">No analyses found</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.file_id}
                onClick={() => setSelectedItem(item)}
                className={`bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 border cursor-pointer transition-all hover:scale-105 ${
                  selectedItem?.file_id === item.file_id
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                    : 'border-purple-500/20 hover:border-purple-500/40'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-700 border border-purple-500/20">
                      <img
                        src={`${API_URL}/species/${(item.species_detected[0]?.species || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`}
                        alt={item.species_detected[0]?.species || 'species'}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/bat.jpg'; }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-white font-medium text-sm truncate">
                      {item.original_filename}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.file_id);
                    }}
                    className="text-red-400 hover:text-red-300 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-gray-400 mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(item.timestamp * 1000).toLocaleDateString()}</span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-400">Top Species:</span>
                      <span className="text-purple-400 italic truncate ml-2">{item.species_detected[0]?.species || 'N/A'}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{item.species_detected[0]?.confidence?.toFixed(2) ?? '0'}%</div>
                      <div className="text-gray-400 text-xs">{item.species_detected.length} species</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-2">
          {selectedItem ? (
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedItem.original_filename}</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Analyzed on {new Date(selectedItem.timestamp * 1000).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => downloadPDF(selectedItem.file_id, selectedItem.original_filename)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
              </div>

              {/* Spectrogram */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Spectrogram</h3>
                <img
                  src={`${API_URL}${selectedItem.spectrogram_url}`}
                  alt="Spectrogram"
                  className="w-full rounded-lg border border-purple-500/20"
                />
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Duration</p>
                  <p className="text-white font-semibold text-lg">{selectedItem.duration.toFixed(2)} s</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Species Detected</p>
                  <p className="text-white font-semibold text-lg">{selectedItem.species_detected.length}</p>
                </div>
              </div>

              {/* Call Parameters */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Call Parameters</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Start Freq', value: `${selectedItem.call_parameters.start_frequency} kHz` },
                    { label: 'End Freq', value: `${selectedItem.call_parameters.end_frequency} kHz` },
                    { label: 'Peak Freq', value: `${selectedItem.call_parameters.peak_frequency} kHz` },
                    { label: 'Bandwidth', value: `${selectedItem.call_parameters.bandwidth} kHz` },
                    { label: 'Intensity', value: `${selectedItem.call_parameters.intensity.toFixed(1)} dB` },
                    { label: 'Pulse Duration', value: `${selectedItem.call_parameters.pulse_duration} ms` },
                    { label: 'Total Length', value: `${selectedItem.call_parameters.total_length} ms` },
                    { label: 'Shape', value: selectedItem.call_parameters.shape },
                  ].map((param, idx) => (
                    <div key={idx} className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">{param.label}</p>
                      <p className="text-white font-medium text-sm mt-1">{param.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Species List */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Detected Species ({selectedItem.species_detected.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedItem.species_detected.slice(0, 12).map((species, idx) => (
                    <SpeciesCard
                      key={idx}
                      rank={species.rank}
                      species={species.species}
                      confidence={species.confidence}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-12 border border-purple-500/20 flex flex-col items-center justify-center text-center h-full">
              <Eye className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">Select an analysis to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}