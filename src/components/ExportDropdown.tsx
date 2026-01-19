// In src/components/ExportDropdown.tsx, modify the button styling.

import React, { useState } from 'react';
import { Download, FileText, FileBarChart, ChevronDown, ChevronUp } from 'lucide-react';
import GlowingCard from './GlowingCard';

const SERVICE_URL = "https://wildsynapse-bat-classifier-backend-570998533708.europe-west1.run.app";

const ExportDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleDownloadAllPDFs = () => {
        window.open(`${SERVICE_URL}/api/download-reports/pdf`, '_blank');
        setIsOpen(false);
    };

    const handleDownloadAllCSV = () => {
        window.open(`${SERVICE_URL}/api/download-reports/csv`, '_blank');
        setIsOpen(false);
    };

    return (
        <div className="relative w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                // Corrected styling to match other buttons
                className="flex items-center justify-center w-full space-x-3 p-6 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg"
            >
                <Download className="w-6 h-6" />
                <span className="font-medium">Export Data</span>
                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10 animate-fadeIn">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <button
                            onClick={handleDownloadAllPDFs}
                            className="flex items-center space-x-3 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            role="menuitem"
                        >
                            <FileText className="w-5 h-5" />
                            <span>All Reports (PDF)</span>
                        </button>
                        <button
                            onClick={handleDownloadAllCSV}
                            className="flex items-center space-x-3 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            role="menuitem"
                        >
                            <FileBarChart className="w-5 h-5" />
                            <span>All Data (CSV)</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExportDropdown;