 'use client';
import React from 'react';
import { SAPOrdersTable } from './SAPOrdersTable';
import { TravelPreparationTable } from './TravelPreparationTable';

export const ArmadoViajes = ({
  sapOrders,
  selectedOrders,
  travelOrders,
  showSAPConfirmation,
  sortConfig,
  onFetchOpenOrders,
  onPrepareTravel,
  onSendToSAP,
  onClearTravels,
  onToggleOrderSelection,
  onSort
}) => {
  return (
    <div className="space-y-4">
      {showSAPConfirmation && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center z-50">
          <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          El viaje se ha enviado correctamente a SAP
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">SAP Orders</h2>
        <button 
          onClick={onFetchOpenOrders}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Traer pedidos abiertos
        </button>
        
        <SAPOrdersTable 
          orders={sapOrders}
          selectedOrders={selectedOrders}
          onToggleSelection={onToggleOrderSelection}
          sortConfig={sortConfig}
          onSort={onSort}
        />

        <button 
          onClick={onPrepareTravel}
          disabled={selectedOrders.length === 0}
          className={`mt-4 px-4 py-2 rounded ${
            selectedOrders.length === 0 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          Viaje a armar
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Travel Preparation</h2>
        <TravelPreparationTable orders={travelOrders} />
        <div className="flex gap-4 mt-4">
          <button 
            onClick={onSendToSAP}
            disabled={travelOrders.length === 0}
            className={`px-4 py-2 rounded ${
              travelOrders.length === 0 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Enviar a SAP
          </button>
          <button 
            onClick={onClearTravels}
            disabled={travelOrders.length === 0}
            className={`px-4 py-2 rounded ${
              travelOrders.length === 0 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            Limpiar viajes
          </button>
        </div>
      </div>
    </div>
  );
};
