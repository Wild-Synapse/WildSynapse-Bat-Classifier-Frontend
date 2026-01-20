import React from 'react';
import { Activity, BarChart3, Mic2, Layers, Database, Globe, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const navItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Command Center' },
    { id: 'analyze', icon: Mic2, label: 'Acoustic Lab' },
    { id: 'batch', icon: Layers, label: 'Batch Process' },
    { id: 'history', icon: Database, label: 'Data Archive' },
    { id: 'encyclopedia', icon: Globe, label: 'Species Dex' },
  ];

  return (
    <div className="flex h-screen overflow-hidden selection:bg-cyan-500/30">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 glass-panel border-r border-white/5 flex flex-col z-20 transition-all duration-300">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Activity className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-white hidden lg:block tracking-tight">
            Echolocate<span className="text-cyan-400">.AI</span>
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
                activeTab === item.id 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'animate-pulse' : ''}`} />
              <span className="font-medium hidden lg:block">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <div className="hidden lg:block">
              <p className="text-xs font-bold text-slate-400 uppercase">Engine Status</p>
              <p className="text-sm font-bold text-emerald-400">Connected</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617]">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
        
        {/* Header */}
        <header className="sticky top-0 z-10 glass-panel border-b border-white/5 px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white capitalize">{activeTab.replace('-', ' ')}</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Sun className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 border-2 border-slate-900"></div>
          </div>
        </header>

        <div className="p-8 relative z-0 pb-24">
          {children}
        </div>
      </main>
    </div>
  );
}