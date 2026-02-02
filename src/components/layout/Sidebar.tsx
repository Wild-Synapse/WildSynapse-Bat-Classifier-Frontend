import React from 'react';
import { Leaf, BarChart3, Upload, Package, History, TrendingUp, MessageSquare, Settings, Moon, Sun, BrainCircuit} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  isOnline: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  setCurrentPage,
  darkMode,
  setDarkMode,
  isOnline,
  sidebarOpen,
  setSidebarOpen
}) => {
  const accentGradient = 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600';
  const accentText = 'bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'analyze', label: 'Single Analysis', icon: Upload },
    { id: 'batch', label: 'Batch Processing', icon: Package },
    { id: 'history', label: 'Data Archive', icon: History },
    { id: 'analytics', label: 'Species Intelligence', icon: TrendingUp },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
  ];

  const buttonBaseClass = "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium group";
  const activeClass = `${accentGradient} text-white shadow-lg shadow-cyan-500/25`;
  const inactiveClass = darkMode 
    ? 'hover:bg-slate-800/50 text-slate-400 hover:text-white' 
    : 'hover:bg-slate-100 text-slate-600';

  return (
    <aside className={`fixed left-0 top-0 h-full w-72 ${darkMode ? 'bg-slate-900/95' : 'bg-white/95'} backdrop-blur-xl border-r ${darkMode ? 'border-slate-800' : 'border-slate-200'} z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3 mb-6">
          <div className={`${accentGradient} p-3 rounded-2xl shadow-lg shadow-cyan-500/20`}>
            <BrainCircuit className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-bold tracking-tight ${accentText}`}>
              Pulse
            </h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Bat Species Identification and Call Analysis</p>
          </div>
        </div>

      
      </div>

      <nav className="p-4 space-y-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setCurrentPage(id);
              setSidebarOpen(false);
            }}
            className={`${buttonBaseClass} ${currentPage === id ? activeClass : inactiveClass}`}
          >
            <Icon className={`w-5 h-5 ${currentPage === id ? 'text-white' : 'text-cyan-500'} group-hover:scale-110 transition-transform`} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-6 left-0 right-0 px-4 space-y-3">
        <button
          onClick={() => {
            setCurrentPage('settings');
            setSidebarOpen(false);
          }}
          className={`${buttonBaseClass} ${
            currentPage === 'settings' 
              ? `${activeClass} border-transparent` 
              : `border ${darkMode ? 'border-slate-800 text-slate-400 hover:border-cyan-500/50 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`
          }`}
        >
          <Settings className={`w-5 h-5 ${currentPage === 'settings' ? 'text-white' : 'text-cyan-500'}`} />
          <span>Settings</span>
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'} transition-all group`}
        >
          <span className="text-sm font-medium">Theme</span>
          <div className="flex items-center gap-2">
            {darkMode ? (
              <Moon className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500 group-hover:rotate-45 transition-transform" />
            )}
          </div>
        </button>
      </div>
    </aside>
  );
};