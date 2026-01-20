import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { MobileHeader } from './components/layout/MobileHeader';
import { BackgroundEffects } from './components/layout/BackgroundEffects';
import { Dashboard } from './pages/Dashboard';
import { SingleAnalysis } from './pages/SingleAnalysis';
import { BatchAnalysis } from './pages/BatchAnalysis';
import { History } from './pages/History';
import { SpeciesAnalytics } from './pages/SpeciesAnalytics';
import { ChatAssistant } from './pages/ChatAssistant';
import { SettingsPage } from './pages/SettingsPage';
import { AnalysisResult, HealthStatus, Statistics } from './types';

const API_BASE = 'http://localhost:8000';

const BatAnalyzerApp = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Global Settings State
  const [threshold, setThreshold] = useState(0.01);
  const [maxFreq, setMaxFreq] = useState(250);

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

  const bgClass = darkMode ? 'bg-slate-950' : 'bg-slate-50';
  const textClass = darkMode ? 'text-slate-100' : 'text-slate-900';

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} transition-all duration-500 font-sans relative overflow-hidden`}>
      <BackgroundEffects />

      <Sidebar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isOnline={isOnline}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <MobileHeader 
        darkMode={darkMode}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onRefresh={() => { fetchHealth(); fetchStatistics(); fetchResults(); }}
      />

      {/* Main Content */}
      <main className="lg:ml-72 pt-20 lg:pt-6 px-4 lg:px-8 pb-8 relative z-10">
        {currentPage === 'dashboard' && (
          <Dashboard 
            darkMode={darkMode}
            healthStatus={healthStatus}
            statistics={statistics}
            onDownloadCSV={handleDownloadCSV}
          />
        )}

        {currentPage === 'analyze' && (
          <SingleAnalysis 
            darkMode={darkMode}
            API_BASE={API_BASE}
            defaultThreshold={threshold}
            defaultMaxFreq={maxFreq}
            fetchResults={fetchResults}
            fetchStatistics={fetchStatistics}
          />
        )}

        {currentPage === 'batch' && (
          <BatchAnalysis 
            darkMode={darkMode}
            API_BASE={API_BASE}
            defaultThreshold={threshold}
            defaultMaxFreq={maxFreq}
            fetchResults={fetchResults}
            fetchStatistics={fetchStatistics}
          />
        )}

        {currentPage === 'history' && (
          <History 
            darkMode={darkMode}
            results={results}
            loading={loading}
            API_BASE={API_BASE}
            fetchResults={fetchResults}
            fetchStatistics={fetchStatistics}
          />
        )}

        {currentPage === 'analytics' && (
          <SpeciesAnalytics 
            darkMode={darkMode}
            results={results}
            API_BASE={API_BASE} // <--- Added here
          />
        )}

        {currentPage === 'chat' && (
          <ChatAssistant 
            darkMode={darkMode}
            API_BASE={API_BASE}
            results={results}
            statistics={statistics}
          />
        )}

        {currentPage === 'settings' && (
          <SettingsPage 
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            threshold={threshold}
            setThreshold={setThreshold}
            maxFreq={maxFreq}
            setMaxFreq={setMaxFreq}
            isOnline={isOnline}
            API_BASE={API_BASE}
          />
        )}
      </main>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default BatAnalyzerApp;