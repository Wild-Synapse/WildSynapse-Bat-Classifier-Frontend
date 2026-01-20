import React from 'react';

export const GlassCard = ({ 
  children, 
  className = "", 
  hover = false,
  onClick
}: { 
  children: React.ReactNode, 
  className?: string, 
  hover?: boolean,
  onClick?: () => void
}) => (
  <div 
    onClick={onClick}
    className={`glass-panel rounded-2xl border border-white/5 p-6 transition-all duration-300 ${
      hover ? 'hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] cursor-pointer' : ''
    } ${className}`}
  >
    {children}
  </div>
);

export const StatusPulse = ({ status }: { status: 'online' | 'offline' | 'busy' }) => {
  const color = status === 'online' ? 'bg-emerald-500' : status === 'busy' ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="relative flex h-3 w-3">
      {status !== 'offline' && <span className={`animate-pulse-ring absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>}
      <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`}></span>
    </div>
  );
};