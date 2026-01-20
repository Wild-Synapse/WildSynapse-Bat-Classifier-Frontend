import React from 'react';
import { Settings, Monitor, Zap, Server, Shield, Moon, Sun, Volume2, Radio } from 'lucide-react';

interface SettingsPageProps {
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  threshold: number;
  setThreshold: (val: number) => void;
  maxFreq: number;
  setMaxFreq: (val: number) => void;
  isOnline: boolean;
  API_BASE: string;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  darkMode,
  setDarkMode,
  threshold,
  setThreshold,
  maxFreq,
  setMaxFreq,
  isOnline,
  API_BASE
}) => {
  const cardClass = darkMode ? 'bg-slate-900/50 backdrop-blur-xl border-slate-800/50' : 'bg-white/80 backdrop-blur-xl border-slate-200';
  const mutedClass = darkMode ? 'text-slate-400' : 'text-slate-600';
  const sectionTitleClass = "text-sm font-bold text-cyan-500 uppercase tracking-wider mb-4 flex items-center gap-2";

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto">
      <div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
          System Configuration
        </h2>
        <p className={`${mutedClass}`}>Global preferences and analysis defaults</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance Section */}
        <div className={`${cardClass} border rounded-3xl p-8 shadow-xl`}>
          <h3 className={sectionTitleClass}>
            <Monitor className="w-4 h-4" /> Interface & Appearance
          </h3>
          
          <div className={`flex items-center justify-between p-4 rounded-xl border mb-4 transition-all ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-600'}`}>
                {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-sm">Dark Mode</p>
                <p className="text-xs text-slate-500">Toggle application theme</p>
              </div>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${darkMode ? 'bg-cyan-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Analysis Defaults Section */}
        <div className={`${cardClass} border rounded-3xl p-8 shadow-xl`}>
          <h3 className={sectionTitleClass}>
            <Zap className="w-4 h-4" /> Analysis Defaults
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  Min. Confidence Threshold
                </label>
                <span className="text-sm font-mono text-cyan-400">{threshold}</span>
              </div>
              <input 
                type="range" 
                min="0.01" 
                max="0.99" 
                step="0.01"
                value={threshold}
                onChange={e => setThreshold(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <p className="text-xs text-slate-500">Minimum probability required for species identification</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Radio className="w-4 h-4 text-slate-400" />
                  Max Frequency Cutoff
                </label>
                <span className="text-sm font-mono text-cyan-400">{maxFreq} kHz</span>
              </div>
              <input 
                type="range" 
                min="20" 
                max="300" 
                step="10"
                value={maxFreq}
                onChange={e => setMaxFreq(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <p className="text-xs text-slate-500">Upper frequency limit for spectrogram generation</p>
            </div>
          </div>
        </div>

        {/* System Status Section */}
        <div className={`${cardClass} border rounded-3xl p-8 shadow-xl md:col-span-2`}>
          <h3 className={sectionTitleClass}>
            <Server className="w-4 h-4" /> System Status
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Backend Connection</p>
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></div>
                <span className={`font-mono text-sm ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                  {isOnline ? 'Active' : 'Disconnected'}
                </span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">API Endpoint</p>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-slate-500" />
                <span className="font-mono text-sm text-slate-400">{API_BASE}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};