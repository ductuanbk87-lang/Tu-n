
import React from 'react';
import { CONCEPTS } from '../constants';

interface ConceptSelectorProps {
  selectedConcept: string | null;
  onSelectConcept: (conceptKey: string) => void;
}

const ConceptSelector: React.FC<ConceptSelectorProps> = ({ selectedConcept, onSelectConcept }) => {
  return (
    <div className="glass-card p-6 rounded-3xl shadow-xl border-pink-100">
      <h2 className="text-xl font-playfair font-bold text-rose-600 mb-4">2. Concept nàng muốn nhập vai</h2>
      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {CONCEPTS.map((concept) => (
          <button
            key={concept.key}
            onClick={() => onSelectConcept(concept.key)}
            className={`px-4 py-2 text-xs font-bold rounded-full border-2 transition-all duration-300
              ${selectedConcept === concept.key 
                ? 'bg-rose-500 border-rose-500 text-white shadow-rose-200 shadow-lg scale-105' 
                : 'bg-white border-pink-100 text-rose-300 hover:border-rose-300 hover:text-rose-400'
              }`}
          >
            {concept.label}
          </button>
        ))}
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fecdd3;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default ConceptSelector;
