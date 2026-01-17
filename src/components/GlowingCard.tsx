import React from 'react';

interface GlowingCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: "low" | "medium" | "high";
}

const GlowingCard: React.FC<GlowingCardProps> = ({ children, className = "", intensity = "medium" }) => {
  const glowClass = {
    low: "shadow-lg hover:shadow-xl",
    medium: "shadow-xl hover:shadow-2xl hover:shadow-blue-500/20",
    high: "shadow-2xl hover:shadow-3xl hover:shadow-purple-500/30"
  }[intensity];

  return (
    <div className={`transform transition-all duration-500 hover:-translate-y-1 ${glowClass} ${className}`}>
      {children}
    </div>
  );
};

export default GlowingCard;