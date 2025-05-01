import React from 'react';

interface TabProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

const Tab: React.FC<TabProps> = ({ active, onClick, label, icon, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        py-3 text-center transition-colors
        ${active 
          ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}
        ${className}
      `}
    >
      <div className="flex items-center justify-center">
        {icon}
        <span>{label}</span>
      </div>
    </button>
  );
};

export default Tab;