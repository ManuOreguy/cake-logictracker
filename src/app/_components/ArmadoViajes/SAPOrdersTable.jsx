"use client";
import React from "react";

export const SAPOrdersTable = ({ orders, selectedOrders, onToggleSelection, sortConfig, onSort }) => {
    return (
        <div className="max-h-96 overflow-y-auto">
            <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-100">
                    <tr>
                        <th className="border-b border-gray-200 p-2">Select</th>
                        <th className="border-b border-gray-200 p-2 cursor-pointer" onClick={() => onSort("DocNum")}>
                            Número de Pedido {sortConfig.key === "DocNum" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
                        </th>
                        <th className="border-b border-gray-200 p-2 cursor-pointer" onClick={() => onSort("CardName")}>
                            Cliente {sortConfig.key === "CardName" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
                        </th>
                        <th className="border-b border-gray-200 p-2 cursor-pointer" onClick={() => onSort("FechaEntrega")}>
                            Fecha de Entrega {sortConfig.key === "FechaEntrega" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
                        </th>
                        <th className="border-b border-gray-200 p-2 cursor-pointer" onClick={() => onSort("Terminal")}>
                            Terminal {sortConfig.key === "Terminal" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
                        </th>
                        <th className="border-b border-gray-200 p-2 cursor-pointer" onClick={() => onSort("GO2")}>
                            GO2 {sortConfig.key === "GO2" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
                        </th>
                        <th className="border-b border-gray-200 p-2 cursor-pointer" onClick={() => onSort("GO3")}>
                            GO3 {sortConfig.key === "GO3" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
                        </th>
                        <th className="border-b border-gray-200 p-2 cursor-pointer" onClick={() => onSort("NS")}>
                            NS {sortConfig.key === "NS" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
                        </th>
                        <th className="border-b border-gray-200 p-2 cursor-pointer" onClick={() => onSort("NP")}>
                            NP {sortConfig.key === "NP" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.DocNum} className="hover:bg-gray-50">
                            <td className="border-b border-gray-200 p-2 text-center">
                                <input
                                    type="checkbox"
                                    checked={selectedOrders.includes(order.DocNum)}
                                    onChange={() => onToggleSelection(order.DocNum)}
                                    className="form-checkbox w-5 h-5"
                                />
                            </td>
                            <td className="border-b border-gray-200 p-2">{order.DocNum}</td>
                            <td className="border-b border-gray-200 p-2">{order.CardName}</td>
                            <td className="border-b border-gray-200 p-2">{order.FechaEntrega}</td>
                            <td className="border-b border-gray-200 p-2">{order.Terminal}</td>
                            <td className="border-b border-gray-200 p-2">{order.GO2}</td>
                            <td className="border-b border-gray-200 p-2">{order.GO3}</td>
                            <td className="border-b border-gray-200 p-2">{order.NS}</td>
                            <td className="border-b border-gray-200 p-2">{order.NP}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
