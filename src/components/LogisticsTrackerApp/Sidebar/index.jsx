'use client';
import React from 'react';

export const Sidebar = ({
  currentSection,
  currentSubsection,
  onSectionChange,
  onSubsectionChange
}) => {
  return (
    <div className="w-64 bg-gray-800 text-white">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-6">Logistics Tracker</h1>
        <div className="space-y-2">
          <div>
            <button 
              className={`w-full text-left p-2 rounded ${
                currentSection === 'Logictracker' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
              onClick={() => {
                onSectionChange('Logictracker');
                onSubsectionChange('Armado de viajes');
              }}
            >
              Logictracker
            </button>
            {currentSection === 'Logictracker' && (
              <div className="ml-4 mt-2 space-y-1">
                <button 
                  className={`w-full text-left p-2 rounded ${
                    currentSubsection === 'Armado de viajes' ? 'bg-blue-500' : 'hover:bg-gray-700'
                  }`}
                  onClick={() => onSubsectionChange('Armado de viajes')}
                >
                  Armado de viajes
                </button>
                <button 
                  className={`w-full text-left p-2 rounded ${
                    currentSubsection === 'Histórico de viajes' ? 'bg-blue-500' : 'hover:bg-gray-700'
                  }`}
                  onClick={() => onSubsectionChange('Histórico de viajes')}
                >
                  Histórico de viajes
                </button>
              </div>
            )}
          </div>
          <button 
            className={`w-full text-left p-2 rounded ${
              currentSection === 'COT' ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
            onClick={() => {
              onSectionChange('COT');
              onSubsectionChange('');
            }}
          >
            COT
          </button>
        </div>
      </div>
    </div>
  );
};
