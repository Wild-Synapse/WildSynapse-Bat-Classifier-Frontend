import React from 'react';
import { TrendingUp } from 'lucide-react';
import GlowingCard from './GlowingCard';

interface StatCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string | number;
  trend?: { value: number, isPositive: boolean };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, trend, className = "" }) => (
  <GlowingCard className={`p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
      {trend && (
        <div className={`flex items-center space-x-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
          <TrendingUp className={`w-4 h-4 ${!trend.isPositive && 'transform rotate-180'}`} />
          <span className="text-sm font-medium">{trend.value}%</span>
        </div>
      )}
    </div>
  </GlowingCard>
);

export default StatCard;