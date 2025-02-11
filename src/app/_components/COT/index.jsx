'use client';
import React from 'react';
import { sortOrders } from '@/src/utils/orderUtils';

export const COT = ({ remitosData, sortConfig, onSort }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Remitos Abiertos</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th 
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                onClick={() => onSort('DocNum')}
              >
                Número Doc
                {sortConfig.key === 'DocNum' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                onClick={() => onSort('CardName')}
              >
                Cliente
                {sortConfig.key === 'CardName' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                onClick={() => onSort('FechaEntrega')}
              >
                Fecha Entrega
                {sortConfig.key === 'FechaEntrega' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className="px-4 py-2">GO2</th>
              <th className="px-4 py-2">GO3</th>
              <th className="px-4 py-2">NS</th>
              <th className="px-4 py-2">NP</th>
            </tr>
          </thead>
          <tbody>
            {sortOrders(remitosData, sortConfig).map((remito) => (
              <tr 
                key={remito.DocNum}
                className="border-t hover:bg-gray-50"
              >
                <td className="px-4 py-2">{remito.DocNum}</td>
                <td className="px-4 py-2">{remito.CardName}</td>
                <td className="px-4 py-2">{remito.FechaEntrega}</td>
                <td className="px-4 py-2 text-center">{remito.GO2}</td>
                <td className="px-4 py-2 text-center">{remito.GO3}</td>
                <td className="px-4 py-2 text-center">{remito.NS}</td>
                <td className="px-4 py-2 text-center">{remito.NP}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
