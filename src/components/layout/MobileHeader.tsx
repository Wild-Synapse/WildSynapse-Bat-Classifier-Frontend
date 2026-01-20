import React from 'react';
import { Menu, X, RefreshCw } from 'lucide-react';

interface MobileHeaderProps {
  darkMode: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onRefresh: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ darkMode, sidebarOpen, setSidebarOpen, onRefresh }) => {
  return (
    <header className={`lg:hidden fixed top-0 left-0 right-0 ${darkMode ? 'bg-slate-900/95' : 'bg-white/95'} backdrop-blur-xl border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'} z-40 px-4 py-3`}>
      <div className="flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
          BioAcoustic AI
        </h1>
        <button onClick={onRefresh} className="p-2">
          <RefreshCw className="w-5 h-5 text-cyan-500" />
        </button>
      </div>
    </header>
  );
};