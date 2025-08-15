import React, { useState, useEffect } from 'react';
import { MacroVariable } from '../types';
import { DataLoader } from '../utils/dataLoader';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';

interface VariableSelectorProps {
  selectedVariables: MacroVariable[];
  onVariablesChange: (variables: MacroVariable[]) => void;
  maxVariables?: number;
}

export const VariableSelector: React.FC<VariableSelectorProps> = ({
  selectedVariables,
  onVariablesChange,
  maxVariables = 10
}) => {
  const [categories, setCategories] = useState<Record<string, MacroVariable[]>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVariables();
  }, []);

  const loadVariables = async () => {
    try {
      setIsLoading(true);
      const loadedVariables = await DataLoader.loadMacroVariables();
      const categorizedVariables = DataLoader.groupVariablesByCategory(loadedVariables);
      
      setCategories(categorizedVariables);
      
      // Expand all categories by default
      setExpandedCategories(new Set(Object.keys(categorizedVariables)));
    } catch (error) {
      console.error('Error loading variables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const addVariable = (variable: MacroVariable) => {
    if (selectedVariables.length >= maxVariables) {
      alert(`You can only select up to ${maxVariables} variables.`);
      return;
    }
    
    if (!selectedVariables.find(v => v.fredTicker === variable.fredTicker)) {
      onVariablesChange([...selectedVariables, variable]);
    }
  };

  const removeVariable = (variable: MacroVariable) => {
    onVariablesChange(selectedVariables.filter(v => v.fredTicker !== variable.fredTicker));
  };

  const filteredCategories = Object.entries(categories).reduce((acc, [category, vars]) => {
    const filteredVars = vars.filter(variable =>
      variable.series.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variable.fredTicker.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filteredVars.length > 0) {
      acc[category] = filteredVars;
    }
    
    return acc;
  }, {} as Record<string, MacroVariable[]>);

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selected Variables */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Selected Variables ({selectedVariables.length}/{maxVariables})
        </h3>
        
        {selectedVariables.length === 0 ? (
          <p className="text-gray-500 text-sm">No variables selected. Choose up to {maxVariables} variables from the list below.</p>
        ) : (
          <div className="space-y-2">
            {selectedVariables.map((variable) => (
              <div
                key={variable.fredTicker}
                className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{variable.series}</p>
                  <p className="text-sm text-gray-500">{variable.fredTicker}</p>
                </div>
                <button
                  onClick={() => removeVariable(variable)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variable Search and Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Variables</h3>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search variables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Categories */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {Object.entries(filteredCategories).map(([category, vars]) => (
            <div key={category} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{category}</span>
                <span className="text-sm text-gray-500 mr-2">{vars.length} variables</span>
                {expandedCategories.has(category) ? (
                  <ChevronUp size={20} className="text-gray-400" />
                ) : (
                  <ChevronDown size={20} className="text-gray-400" />
                )}
              </button>
              
              {expandedCategories.has(category) && (
                <div className="border-t border-gray-200 p-3 space-y-2">
                  {vars.map((variable) => {
                    const isSelected = selectedVariables.some(v => v.fredTicker === variable.fredTicker);
                    const isDisabled = selectedVariables.length >= maxVariables && !isSelected;
                    
                    return (
                      <button
                        key={variable.fredTicker}
                        onClick={() => isSelected ? removeVariable(variable) : addVariable(variable)}
                        disabled={isDisabled}
                        className={`w-full text-left p-2 rounded-md transition-colors ${
                          isSelected
                            ? 'bg-primary-100 text-primary-900 border border-primary-300'
                            : isDisabled
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{variable.series}</p>
                            <p className="text-sm text-gray-500">{variable.fredTicker}</p>
                          </div>
                          {isSelected && (
                            <div className="w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
