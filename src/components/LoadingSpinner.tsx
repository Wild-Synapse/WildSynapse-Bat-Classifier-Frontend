import React from 'react';

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "medium" }) => {
  const sizeClass = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12"
  }[size];

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClass} relative`}>
        <div className={`${sizeClass} border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin`}>
          <div className={`${sizeClass} border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full absolute top-0 left-0 animate-spin`} style={{ animationDuration: '0.8s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;