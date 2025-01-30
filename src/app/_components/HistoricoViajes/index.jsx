'use client';
import React from 'react';
import { TripTable } from './TripTable';

export const HistoricoViajes = ({
  trips,
  expandedTripIds,
  onToggleExpansion,
  onCancelTrip
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Histórico de viajes</h2>
      <TripTable 
        trips={trips}
        expandedTripIds={expandedTripIds}
        onToggleExpansion={onToggleExpansion}
        onCancelTrip={onCancelTrip}
      />
    </div>
  );
};
