import React from 'react';
import GlowingCard from '../components/GlowingCard';
import { Sun, Moon, Check } from 'lucide-react'; // Import the Check icon

interface SettingsPageProps {
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  spectrogramTheme: 'dark_viridis' | 'bright_plasma' | 'classic_grayscale';
  setSpectrogramTheme: (theme: 'dark_viridis' | 'bright_plasma' | 'classic_grayscale') => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ darkMode, setDarkMode, viewMode, setViewMode, spectrogramTheme, setSpectrogramTheme }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Settings & Preferences</h1>
        <p className="text-gray-400 text-lg">Customize your analysis experience</p>
      </div>

      <GlowingCard className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
        <h2 className="text-xl font-semibold text-white mb-4">Preferences</h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Default View Mode</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred history display</p>
            </div>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'grid' | 'list')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="grid">Grid View</option>
              <option value="list">List View</option>
            </select>
          </div>
        </div>
      </GlowingCard>

      {/* NEW SPECTROGRAM SETTINGS SECTION */}
      <GlowingCard className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
        <h2 className="text-xl font-semibold text-white mb-4">Spectrogram Settings</h2>
        
        <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Theme</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Choose a color scheme for the spectrograms.</p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                    onClick={() => setSpectrogramTheme('dark_viridis')}
                    className={`relative flex-1 p-4 rounded-lg border-2 transition-colors duration-200 ${
                        spectrogramTheme === 'dark_viridis' ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                >
                    <div className="w-full h-8 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 rounded-md shadow-md"></div>
                    <span className="mt-2 block text-sm font-medium text-center">Dark Viridis</span>
                    {spectrogramTheme === 'dark_viridis' && (
                        <Check className="absolute top-2 right-2 text-blue-500" size={20} />
                    )}
                </button>
                <button
                    onClick={() => setSpectrogramTheme('bright_plasma')}
                    className={`relative flex-1 p-4 rounded-lg border-2 transition-colors duration-200 ${
                        spectrogramTheme === 'bright_plasma' ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                >
                    <div className="w-full h-8 bg-gradient-to-r from-purple-800 via-red-500 to-yellow-300 rounded-md shadow-md"></div>
                    <span className="mt-2 block text-sm font-medium text-center">Bright Plasma</span>
                    {spectrogramTheme === 'bright_plasma' && (
                        <Check className="absolute top-2 right-2 text-blue-500" size={20} />
                    )}
                </button>
                <button
                    onClick={() => setSpectrogramTheme('classic_grayscale')}
                    className={`relative flex-1 p-4 rounded-lg border-2 transition-colors duration-200 ${
                        spectrogramTheme === 'classic_grayscale' ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                >
                    <div className="w-full h-8 bg-gradient-to-r from-gray-800 to-white rounded-md shadow-md"></div>
                    <span className="mt-2 block text-sm font-medium text-center">Classic Grayscale</span>
                    {spectrogramTheme === 'classic_grayscale' && (
                        <Check className="absolute top-2 right-2 text-blue-500" size={20} />
                    )}
                </button>
            </div>
        </div>
      </GlowingCard>
    </div>
  );
};

export default SettingsPage;