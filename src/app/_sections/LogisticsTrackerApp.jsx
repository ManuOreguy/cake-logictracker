"use client";
import { SECTIONS, SUBSECTIONS } from "@/src/constants";
import React, { useState } from "react";
import { Sidebar } from "../_components/Sidebar";
import { ArmadoViajes } from "../_components/ArmadoViajes";
import { HistoricoViajes } from "../_components/HistoricoViajes";
import { COT } from "../_components/COT";
import { sortOrders } from "@/src/utils/orderUtils";
import { getOrdersSAP } from "@/src/utils/getOrdersSAP";
import { postDeliveryNotesSAP } from "@/src/utils/postDeliveryNotesSAP";
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

  // Nuevo estado para manejar el envío a SAP
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);

  const handleFetchOpenOrders = async (preloadedData) => {
    try {
      if (preloadedData) {
        setSapOrders(preloadedData);
      } else {
        const data = await getOrdersSAP('DP_PEDIDOS_ABIERTOS');
        setSapOrders(data);
      }
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

  const handleSendToSAP = async () => {
    try {
      setIsSending(true);
      setSendError(null);

      // Enviar remitos a SAP usando la nueva función
      await postDeliveryNotesSAP(travelOrders);

      // Si el envío fue exitoso, crear el nuevo viaje
      const newTrip = {
        tripNumber: tripCounter,
        sentDate: new Date().toISOString().split("T")[0],
        totalAmount: travelOrders.reduce((sum, order) => sum + order.DocTotal, 0),
        orders: travelOrders,
        status: "Active",
      };

      setHistoricTravels((prev) => [...prev, newTrip]);
      setTripCounter((prev) => prev + 1);
      setTravelOrders([]);
      setShowSAPConfirmation(true);

      setTimeout(() => {
        setShowSAPConfirmation(false);
      }, 3000);
    } catch (error) {
      console.error('Error al enviar a SAP:', error);
      setSendError(error.message);
    } finally {
      setIsSending(false);
    }
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
