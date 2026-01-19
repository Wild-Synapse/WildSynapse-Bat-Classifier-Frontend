// types/index.ts

// 1. Add the Prediction interface that your Components are explicitly using
export interface Prediction {
  file_id: string;
  original_filename?: string;
  timestamp: number;
  
  // These flat fields match your UploadPage and DashboardPage usage
  species: string;
  confidence: number;
  species_image_url?: string; 
  
  audio_url: string;
  spectrogram_url: string;
  
  // Optional: detailed metrics if available
  call_parameters?: CallParameters;
}

// 2. Keep the detailed sub-types for backend processing
export interface SpeciesDetection {
  species: string;
  confidence: number;
  rank: number;
}

export interface CallParameters {
  start_frequency: number;
  end_frequency: number;
  peak_frequency: number;
  bandwidth: number;
  intensity: number;
  pulse_duration: number;
  total_length: number;
  shape: string;
}

// 3. Update AnalysisResult to be compatible or distinct based on backend response
// If your backend returns the list of all detections + the top one, this covers both.
export interface AnalysisResult extends Prediction {
  duration: number;
  sample_rate: number;
  species_detected: SpeciesDetection[]; // The full list of candidates
  firebase_urls?: {
    audio?: string;
    audio_slow?: string;
    spectrogram?: string;
  };
  processing_mode: string;
  display_theme: string;
}

export interface BatchAnalysisResult {
  batch_id: string;
  total_files: number;
  completed: number;
  failed: number;
  results: AnalysisResult[];
}

export interface Stats {
  total_analyses: number;
  total_duration_seconds: number;
  unique_species_detected: number;
  top_species: {
    species: string;
    count: number;
  }[];
  average_duration: number;
}

export interface AIReportRequest {
  file_ids: string[];
  query?: string;
}

export interface AIReportResponse {
  report: string;
  analyzed_files: number;
  query?: string;
}

export interface HealthCheck {
  status: string;
  firebase: boolean;
  groq: boolean;
  model_loaded: boolean;
}

export interface Theme {
  name: string;
  label: string;
}

export const AVAILABLE_THEMES: Theme[] = [
  { name: 'dark_viridis', label: 'Dark Viridis' },
  { name: 'bright_plasma', label: 'Bright Plasma' },
  { name: 'classic_grayscale', label: 'Classic Grayscale' },
  { name: 'inferno', label: 'Inferno' },
  { name: 'magma', label: 'Magma' },
  { name: 'jet', label: 'Jet' },
];

export type InputType = 'audio' | 'image';
export type PageType = 'dashboard' | 'single' | 'batch' | 'history';