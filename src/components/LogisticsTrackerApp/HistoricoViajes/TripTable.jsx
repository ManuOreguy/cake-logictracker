'use client';
import React from 'react';
import { TripDetails } from './TripDetails';

export const TripTable = ({
  trips,
  expandedTripIds,
  onToggleExpansion,
  onCancelTrip
}) => {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th className="border-b border-gray-200 p-2"></th>
          <th className="border-b border-gray-200 p-2">Número de viaje</th>
          <th className="border-b border-gray-200 p-2">Fecha de envío</th>
          <th className="border-b border-gray-200 p-2">Total</th>
          <th className="border-b border-gray-200 p-2">Estado</th>
          <th className="border-b border-gray-200 p-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {trips.map(trip => (
          <React.Fragment key={trip.tripNumber}>
            <tr className="hover:bg-gray-50">
              <td className="border-b border-gray-200 p-2 text-center">
                <button
                  onClick={() => onToggleExpansion(trip.tripNumber)}
                  className="hover:bg-gray-200 p-1 rounded"
                >
                  {expandedTripIds.includes(trip.tripNumber) ? '▼' : '▶'}
                </button>
              </td>
              <td className="border-b border-gray-200 p-2">{trip.tripNumber}</td>
              <td className="border-b border-gray-200 p-2">{trip.sentDate}</td>
              <td className="border-b border-gray-200 p-2">${trip.totalAmount.toFixed(2)}</td>
              <td className="border-b border-gray-200 p-2">
                <span className={`px-2 py-1 rounded ${
                  trip.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {trip.status}
                </span>
              </td>
              <td className="border-b border-gray-200 p-2">
                {trip.status === 'Active' && (
                  <button
                    onClick={() => onCancelTrip(trip.tripNumber)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Anular
                  </button>
                )}
              </td>
            </tr>
            {expandedTripIds.includes(trip.tripNumber) && (
              <tr>
                <td colSpan={6} className="border-b border-gray-200 p-2 bg-gray-50">
                  <TripDetails orders={trip.orders} />
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};
