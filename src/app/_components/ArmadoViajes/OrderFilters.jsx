"use client";
import React from 'react';

export const OrderFilters = ({ orders, filters, onFilterChange }) => {
  // Obtener valores únicos para los filtros
  const uniqueTerminals = [...new Set(orders.map(order => order.Terminal))].sort();
  const uniqueDates = [...new Set(orders.map(order => order.FechaEntrega))].sort();
  const tiposViaje = ["CIF", "FOB"];

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Terminal
        </label>
        <select
          value={filters.terminal || ''}
          onChange={(e) => onFilterChange('terminal', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Todas las terminales</option>
          {uniqueTerminals.map((terminal) => (
            <option key={terminal} value={terminal}>
              {terminal}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de Entrega
        </label>
        <select
          value={filters.fechaEntrega || ''}
          onChange={(e) => onFilterChange('fechaEntrega', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Todas las fechas</option>
          {uniqueDates.map((fecha) => (
            <option key={fecha} value={fecha}>
              {new Date(fecha).toLocaleDateString('es-AR')}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Viaje
        </label>
        <select
          value={filters.tipoViaje || ''}
          onChange={(e) => onFilterChange('tipoViaje', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Todos los tipos</option>
          {tiposViaje.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}; 