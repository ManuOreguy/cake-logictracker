"use client";
import { SECTIONS, SUBSECTIONS } from "@/src/constants";
import React, { useState } from "react";
import { Sidebar } from "../_components/Sidebar";
import { ArmadoViajes } from "../_components/ArmadoViajes";
import { HistoricoViajes } from "../_components/HistoricoViajes";
import { COT } from "../_components/COT";
import { sortOrders } from "@/src/utils/orderUtils";
import { getOrdersSAP } from "@/src/utils/getOrdersSAP";
import { TravelPreparationTable } from "../_components/ArmadoViajes/TravelPreparationTable";

export const LogisticsTrackerApp = () => {
  // Navigation state
  const [currentSection, setCurrentSection] = useState(SECTIONS.LOGICTRACKER);
  const [currentSubsection, setCurrentSubsection] = useState(
    SUBSECTIONS.ARMADO_VIAJES
  );

  // Orders state
  const [sapOrders, setSapOrders] = useState([]);
  const [travelOrders, setTravelOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showSAPConfirmation, setShowSAPConfirmation] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  // Historic travels state
  const [historicTravels, setHistoricTravels] = useState([]);
  const [tripCounter, setTripCounter] = useState(1);
  const [expandedTripIds, setExpandedTripIds] = useState([]);

  const handleFetchOpenOrders = async () => {
    try {
      const data = await getOrdersSAP('DP_PEDIDOS_ABIERTOS');
      setSapOrders(data);
      setSelectedOrders([]);
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
    }
  };

  const handlePrepareTravel = () => {
    const ordersToMove = sapOrders.filter((order) =>
      selectedOrders.includes(order.DocNum)
    );
    setTravelOrders([...travelOrders, ...ordersToMove]);
    setSapOrders(
      sapOrders.filter((order) => !selectedOrders.includes(order.DocNum))
    );
    setSelectedOrders([]);
  };

  const handleSendToSAP = () => {
    setShowSAPConfirmation(true);

    const newTrip = {
      tripNumber: tripCounter,
      sentDate: new Date().toISOString().split("T")[0],
      totalAmount: travelOrders.reduce((sum, order) => sum + order.DocTotal, 0),
      orders: travelOrders,
      status: "Active",
    };

    setTimeout(() => {
      setHistoricTravels((prev) => [...prev, newTrip]);
      setTripCounter((prev) => prev + 1);
      setTravelOrders([]);
      setShowSAPConfirmation(false);
    }, 3000);
  };

  const handleClearTravels = () => {
    setSapOrders([...sapOrders, ...travelOrders]);
    setTravelOrders([]);
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSort = (key) => {
    setSortConfig((config) => ({
      key,
      direction:
        config.key === key && config.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  const toggleTripExpansion = (tripNumber) => {
    setExpandedTripIds((prev) =>
      prev.includes(tripNumber)
        ? prev.filter((id) => id !== tripNumber)
        : [...prev, tripNumber]
    );
  };

  const handleTripCancellation = (tripNumber) => {
    setHistoricTravels((prev) =>
      prev.map((trip) =>
        trip.tripNumber === tripNumber ? { ...trip, status: "Cancelled" } : trip
      )
    );
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        currentSection={currentSection}
        currentSubsection={currentSubsection}
        onSectionChange={setCurrentSection}
        onSubsectionChange={setCurrentSubsection}
      />

      <div className="flex-1 p-4 overflow-y-auto">
        {currentSection === SECTIONS.LOGICTRACKER ? (
          currentSubsection === SUBSECTIONS.ARMADO_VIAJES ? (
            <ArmadoViajes
              sapOrders={sortOrders(sapOrders, sortConfig)}
              selectedOrders={selectedOrders}
              travelOrders={travelOrders}
              showSAPConfirmation={showSAPConfirmation}
              sortConfig={sortConfig}
              onFetchOpenOrders={handleFetchOpenOrders}
              onPrepareTravel={handlePrepareTravel}
              onSendToSAP={handleSendToSAP}
              onClearTravels={handleClearTravels}
              onToggleOrderSelection={toggleOrderSelection}
              onSort={handleSort}
            >
              <TravelPreparationTable 
                orders={sortOrders(travelOrders, sortConfig)} 
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </ArmadoViajes>
          ) : (
            <HistoricoViajes
              trips={historicTravels}
              expandedTripIds={expandedTripIds}
              onToggleExpansion={toggleTripExpansion}
              onCancelTrip={handleTripCancellation}
            />
          )
        ) : (
          <COT />
        )}
      </div>
    </div>
  );
};
