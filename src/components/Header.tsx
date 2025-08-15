import React from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-slate-800 border-b border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-400" />
              <BarChart3 className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">{title}</h1>
              <p className="text-sm text-slate-400">Advanced Financial Data Analysis</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-slate-300">FRED API Integration</p>
              <p className="text-xs text-slate-500">Real-time Economic Data</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};




