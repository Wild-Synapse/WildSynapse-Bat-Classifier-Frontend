import React, { useState, useRef, FormEvent, DragEvent, ChangeEvent } from 'react';
import { Upload, FileAudio, X, Zap, Activity, Volume2, Download, Eye } from 'lucide-react';
import { Prediction } from '../types';
import GlowingCard from '../components/GlowingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import SpectrogramViewer from '../components/SpectrogramViewer';

const SERVICE_URL = "http://localhost:8000";

interface UploadPageProps {
  setActiveSection: (section: 'dashboard' | 'upload' | 'history' | 'settings') => void;
  backendStatus: 'online' | 'offline' | 'checking';
  fetchHistory: () => void;
  setSelectedResult: (result: Prediction | null) => void;
  spectrogramTheme: string;
}

const UploadPage: React.FC<UploadPageProps> = ({ 
  backendStatus, 
  fetchHistory, 
  setSelectedResult, 
  spectrogramTheme 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const droppedFile = files[0];
      if (droppedFile.name.endsWith('.wav')) {
        setFile(droppedFile);
        setPrediction(null);
        setError(null);
      } else {
        setError("Please select a valid .wav audio file.");
      }
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.name.endsWith('.wav')) {
        setFile(selectedFile);
        setPrediction(null);
        setError(null);
      } else {
        setError("Please select a valid .wav audio file.");
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Please select an audio file to upload.");
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedResult(null);
    setPrediction(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${SERVICE_URL}/api/process_audio?theme=${spectrogramTheme}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to process audio.");
      }

      const data: Prediction = await response.json();
      setPrediction(data);
      fetchHistory();
    } catch (err: any) {
      console.error("Error submitting file:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Audio Analysis</h1>
        <p className="text-gray-400 text-lg">Upload bat call recordings for instant species identification</p>
      </div>

      <GlowingCard className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20" intensity="high">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              dragOver
                ? 'border-purple-400 bg-purple-500/10 scale-105'
                : 'border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".wav"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className={`p-4 rounded-full transition-all duration-300 ${
                  dragOver ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-110' : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-300'
                }`}>
                  <FileAudio className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-white">
                    {dragOver ? 'Drop your audio file here' : 'Upload bat call audio'}
                  </h3>
                  <p className="text-gray-400 mt-2">
                    Drag and drop or click to select • WAV or ZC file format supported
                  </p>
                </div>
                {!dragOver && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:scale-105 transition-all duration-200 shadow-lg shadow-purple-500/30"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Choose File</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {file && (
            <div className="flex items-center space-x-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <FileAudio className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="font-medium text-green-800 dark:text-green-200">{file.name}</p>
                <p className="text-sm text-green-600 dark:text-green-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || loading || backendStatus !== 'online'}
            className="w-full flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                <span>Analyzing Audio...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Analyze Call</span>
              </>
            )}
          </button>
        </form>
      </GlowingCard>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {loading && (
        <GlowingCard className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center space-y-6">
            <LoadingSpinner size="large" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Processing Audio</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Generating spectrogram and running AI analysis...
              </p>
            </div>
          </div>
        </GlowingCard>
      )}

      {prediction && (
        <GlowingCard className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700" intensity="high">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg text-white">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis Complete</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Suggested Species</h4>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{prediction.species}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Confidence: {prediction.confidence.toFixed(2)}%</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        prediction.confidence > 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        prediction.confidence > 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {prediction.confidence > 80 ? 'High Confidence' :
                         prediction.confidence > 60 ? 'Medium Confidence' : 'Low Confidence'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Audio Playback</h4>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <audio controls className="w-full mb-4">
                    <source src={`${SERVICE_URL}${prediction.audio_url}`} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                  <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Volume2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Original bat call recording converted to human audible range.</span>
                  </div>
                </div>
              </div>

              {prediction.species_image_url && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Species Photo</h4>
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={prediction.species_image_url}
                      alt={`Image of ${prediction.species}`}
                      className="w-full h-48 object-cover hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                      <span className="text-white text-sm font-medium">{prediction.species}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4 mt-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Spectrogram Analysis</h4>
              <SpectrogramViewer 
                src={`${SERVICE_URL}${prediction.spectrogram_url}`} 
                alt="Audio Spectrogram" 
                className="cursor-pointer"
              />
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              <a
                href={`${SERVICE_URL}/api/report/${prediction.file_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-all duration-200"
              >
                <Download className="w-5 h-5" />
                <span>Download Full Report</span>
              </a>
              <button
                onClick={() => setSelectedResult(prediction)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-all duration-200"
              >
                <Eye className="w-5 h-5" />
                <span>Detailed View</span>
              </button>
            </div>
          </div>
        </GlowingCard>
      )}
    </div>
  );
};

export default UploadPage;