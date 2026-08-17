import React from 'react';

export const LoadingSpinner: React.FC<{ label?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  label = 'Loading NIRNAY system data...',
  size = 'md'
}) => {
  const spinnerSizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div
        className={`${spinnerSizes[size]} border-blue-500 border-t-transparent rounded-full animate-spin mb-3 shadow-lg shadow-blue-500/20`}
      />
      {label && <p className="text-sm text-slate-400 font-medium animate-pulse">{label}</p>}
    </div>
  );
};
