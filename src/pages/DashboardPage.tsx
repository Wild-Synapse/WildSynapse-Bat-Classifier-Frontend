import React from 'react';
import { BarChart3, TrendingUp, Activity, Clock, Upload, History, Download } from 'lucide-react';
import GlowingCard from '../components/GlowingCard';
import StatCard from '../components/StatCard';
import { Prediction } from '../types';
import ExportDropdown from '../components/ExportDropdown'; 

interface DashboardPageProps {
  history: Prediction[];
  setActiveSection: (section: 'dashboard' | 'upload' | 'history' | 'settings') => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ history, setActiveSection }) => {
  const uniqueSpecies = [...new Set(history.map(h => h.species))];
  const avgConfidence = history.length > 0 ? history.reduce((sum, h) => sum + h.confidence, 0) / history.length : 0;
  const totalAnalyses = history.length;
  const recentAnalyses = history.filter(h => h.timestamp && (Date.now() / 1000 - h.timestamp) < 86400).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Bat Call Analyzer
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Advanced acoustic analysis for bat species identification using machine learning
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          icon={BarChart3}
          label="Total Analyses"
          value={totalAnalyses}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Confidence"
          value={`${avgConfidence.toFixed(1)}%`}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          icon={Activity}
          label="Species Detected"
          value={uniqueSpecies.length}
        />
        <StatCard
          icon={Clock}
          label="Today's Analyses"
          value={recentAnalyses}
          trend={{ value: 25, isPositive: true }}
        />
      </div>

      <GlowingCard className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20" intensity="high">
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveSection('upload')}
            className="flex items-center justify-center space-x-3 p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg"
          >
            <Upload className="w-6 h-6" />
            <span className="font-medium">Analyze New Call</span>
          </button>
          <button
            onClick={() => setActiveSection('history')}
            className="flex items-center justify-center space-x-3 p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg"
          >
            <History className="w-6 h-6" />
            <span className="font-medium">View History</span>
          </button>
          <ExportDropdown /> {/* Replace the old button with the new component */}
        </div>
      </GlowingCard>
    </div>
  );
};


export default DashboardPage;