import React from 'react';
import { Settings, X } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  threshold: number;
  setThreshold: (val: number) => void;
  maxFreq: number;
  setMaxFreq: (val: number) => void;
  darkMode: boolean;
  isOnline: boolean;
  API_BASE: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  threshold,
  setThreshold,
  maxFreq,
  setMaxFreq,
  darkMode,
  isOnline,
  API_BASE
}) => {
  const cardClass = darkMode ? 'bg-slate-900/50 backdrop-blur-xl border-slate-800/50' : 'bg-white/80 backdrop-blur-xl border-slate-200';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`${cardClass} border rounded-3xl p-8 max-w-2xl w-full shadow-2xl`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-500" />
            Application Settings
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Default Analysis Parameters</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-500">Default Threshold</label>
                <input 
                  type="number" 
                  value={threshold} 
                  onChange={e => setThreshold(parseFloat(e.target.value))} 
                  step="0.01"
                  className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-300'} border focus:border-cyan-500 outline-none`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500">Default Max Frequency</label>
                <input 
                  type="number" 
                  value={maxFreq} 
                  onChange={e => setMaxFreq(parseInt(e.target.value))}
                  className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-slate-950 border-slate-700' : 'bg-white border-slate-300'} border focus:border-cyan-500 outline-none`}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">System Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <p className="text-xs text-slate-500 mb-1">API Endpoint</p>
                <p className="text-sm font-mono text-cyan-400">{API_BASE}</p>
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <p className={`text-sm font-bold ${isOnline ? 'text-cyan-400' : 'text-red-400'}`}>
                  {isOnline ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};