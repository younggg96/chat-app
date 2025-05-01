import React, { useState, useEffect, useRef } from 'react';
import { useThemeStore, colorSchemes } from '../../store/themeStore';
import ollamaService from '../../services/ollamaService';
import { FiChevronDown, FiCpu, FiCheckCircle, FiSearch } from 'react-icons/fi';
import { Spinner } from "./Spinner";

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (model: string) => void;
  className?: string;
  compact?: boolean;
}

type ModelInfo = {
  family: string;
  size: string | null;
  fullName: string;
};

function parseModelInfo(modelName: string): ModelInfo {
  const parts = modelName.split(':');
  const fullName = parts[0];
  
  // 常见模型家族和尺寸的识别模式
  const sizeMatches = fullName.match(/([\w-]+)-([\w]+)$/);
  
  if (sizeMatches) {
    return {
      family: sizeMatches[1],
      size: sizeMatches[2],
      fullName
    };
  }
  
  return {
    family: fullName,
    size: null,
    fullName
  };
}

// 获取模型家族首字母
function getModelInitials(family: string): string {
  return family
    .split('-')
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

// 根据模型族获取背景颜色
function getModelColor(family: string): string {
  const modelColors: Record<string, string> = {
    'llama': 'from-blue-500 to-blue-600',
    'mistral': 'from-purple-500 to-purple-600',
    'gemma': 'from-green-500 to-green-600',
    'phi': 'from-yellow-500 to-yellow-600',
    'qwen': 'from-red-500 to-red-600',
    'yi': 'from-indigo-500 to-indigo-600',
    'codellama': 'from-blue-600 to-blue-700',
  };

  for (const key in modelColors) {
    if (family.toLowerCase().includes(key)) {
      return modelColors[key];
    }
  }

  return 'from-gray-500 to-gray-600';
}

// 获取用于标签的尺寸类名
function getSizeClass(size: string | null): string {
  if (!size) return '';
  
  const sizeToClass: Record<string, string> = {
    '7b': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    '13b': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    '34b': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    '70b': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };
  
  for (const key in sizeToClass) {
    if (size.includes(key)) {
      return sizeToClass[key];
    }
  }
  
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onSelectModel,
  className = '',
  compact = false,
}) => {
  const [models, setModels] = useState<string[]>([]);
  const [filteredModels, setFilteredModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const { mode, colorScheme } = useThemeStore();
  const isDarkMode = mode === 'dark';
  const colors = colorSchemes[colorScheme];
  
  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch("http://localhost:11434/api/tags");
        const data = await response.json();
        const modelList = data.models.map((model: { name: string }) => model.name);
        setModels(modelList);
        setFilteredModels(modelList);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch models:", error);
        setLoading(false);
      }
    }

    fetchModels();
  }, []);
  
  useEffect(() => {
    // 点击外部关闭下拉菜单
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // 当搜索词变化时过滤模型
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredModels(models);
      return;
    }
    
    const filtered = models.filter(model => 
      model.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredModels(filtered);
  }, [searchTerm, models]);
  
  // 当下拉菜单打开时，自动聚焦搜索框
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  const selectedInfo = parseModelInfo(selectedModel);
  const modelColor = getModelColor(selectedInfo.family);
  const sizeClass = getSizeClass(selectedInfo.size);
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between ${compact ? 'px-2 py-1.5' : 'p-2.5'} text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${compact ? 'w-auto' : 'w-full'}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          <div className={`flex items-center justify-center ${compact ? 'w-6 h-6' : 'w-8 h-8'} bg-gradient-to-br ${modelColor} rounded-md text-white mr-2 shadow-sm`}>
            {loading ? (
              <Spinner className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
            ) : (
              <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-bold`}>{getModelInitials(selectedInfo.family)}</span>
            )}
          </div>
          <div className="flex flex-col items-start">
            <span className="font-medium">{selectedInfo.family}</span>
            {selectedInfo.size && !compact && (
              <div className="flex items-center mt-0.5">
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${sizeClass}`}>
                  {selectedInfo.size}
                </span>
              </div>
            )}
            {selectedInfo.size && compact && (
              <span className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {selectedInfo.size}
              </span>
            )}
          </div>
        </div>
        <FiChevronDown className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''} ${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-20 w-64 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-72 overflow-hidden flex flex-col animate-fadeIn right-0">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search models..."
                className="w-full py-1.5 pl-8 pr-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <FiSearch className="absolute left-2.5 top-2.5 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          
          <div className="overflow-auto custom-scrollbar max-h-60">
            {loading ? (
              <div className="flex justify-center items-center p-4">
                <Spinner className="w-5 h-5" />
              </div>
            ) : filteredModels.length > 0 ? (
              <ul className="py-1" role="listbox">
                {filteredModels.map((model) => {
                  const info = parseModelInfo(model);
                  const isSelected = model === selectedModel;
                  const modelColor = getModelColor(info.family);
                  const sizeClass = getSizeClass(info.size);
                  
                  return (
                    <li 
                      key={model}
                      onClick={() => {
                        onSelectModel(model);
                        setIsOpen(false);
                      }}
                      className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 bg-gradient-to-br ${modelColor} rounded-md text-white mr-2 shadow-sm`}>
                        <span className="text-xs font-bold">{getModelInitials(info.family)}</span>
                      </div>
                      <div className="flex flex-col items-start flex-grow">
                        <span className="font-medium">{info.family}</span>
                        {info.size && (
                          <div className="flex items-center mt-0.5">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${sizeClass}`}>
                              {info.size}
                            </span>
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <FiCheckCircle className="text-green-500 dark:text-green-400 ml-2" />
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No models found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector; 