"use client";
import React, { useRef, useEffect, useState } from "react";
import { SAPOrdersTable } from "./SAPOrdersTable";
import { TravelPreparationTable } from "./TravelPreparationTable";
import { OrderFilters } from "./OrderFilters";

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
  const travelTableRef = useRef(null);
  const [filters, setFilters] = useState({
    terminal: '',
    fechaEntrega: '',
    tipoViaje: ''
  });

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const filteredOrders = sapOrders.filter(order => {
    return (
      (!filters.terminal || order.Terminal === filters.terminal) &&
      (!filters.fechaEntrega || order.FechaEntrega === filters.fechaEntrega) &&
      (!filters.tipoViaje || order.Tipo === filters.tipoViaje)
    );
  });

  useEffect(() => {
    if (travelOrders.length > 0 && travelTableRef.current) {
      travelTableRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      });
    }
  }, [travelOrders.length]);

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
        <h2 className="text-xl font-semibold mb-4">Pedidos SAP</h2>
        <div className="flex justify-between mb-4">
          <button 
            onClick={onFetchOpenOrders}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Traer pedidos abiertos
          </button>
          
          <button 
            onClick={onPrepareTravel}
            disabled={selectedOrders.length === 0}
            className={`px-4 py-2 rounded ${
              selectedOrders.length === 0 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            Preparar Viaje
          </button>
        </div>

        <OrderFilters 
          orders={sapOrders}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        
        <SAPOrdersTable 
          orders={filteredOrders}
          selectedOrders={selectedOrders}
          onToggleSelection={onToggleOrderSelection}
          sortConfig={sortConfig}
          onSort={onSort}
        />
      </div>

      {travelOrders.length > 0 && (
        <div ref={travelTableRef} className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Preparación del Viaje</h2>
          <TravelPreparationTable 
            orders={travelOrders} 
            sortConfig={sortConfig}
            onSort={onSort}
          />
          <div className="flex gap-4 mt-4">
            <button 
              onClick={onSendToSAP}
              className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Enviar a SAP
            </button>
            <button 
              onClick={onClearTravels}
              className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
            >
              Limpiar viajes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
