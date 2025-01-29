'use client';
import React from 'react';

export const SAPOrdersTable = ({ 
  orders, 
  selectedOrders, 
  onToggleSelection, 
  sortConfig, 
  onSort 
}) => {
  return (
    <div className="max-h-96 overflow-y-auto">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-gray-100">
          <tr>
            <th className="border-b border-gray-200 p-2">Select</th>
            <th 
              className="border-b border-gray-200 p-2 cursor-pointer hover:bg-gray-200"
              onDoubleClick={() => onSort('orderNumber')}
            >
              Order Number
              {sortConfig.key === 'orderNumber' && (
                <span className="ml-1">
                  {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                </span>
              )}
            </th>
            <th 
              className="border-b border-gray-200 p-2 cursor-pointer hover:bg-gray-200"
              onDoubleClick={() => onSort('customer')}
            >
              Customer
              {sortConfig.key === 'customer' && (
                <span className="ml-1">
                  {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                </span>
              )}
            </th>
            <th 
              className="border-b border-gray-200 p-2 cursor-pointer hover:bg-gray-200"
              onDoubleClick={() => onSort('date')}
            >
              Date
              {sortConfig.key === 'date' && (
                <span className="ml-1">
                  {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                </span>
              )}
            </th>
            <th 
              className="border-b border-gray-200 p-2 cursor-pointer hover:bg-gray-200"
              onDoubleClick={() => onSort('amount')}
            >
              Amount
              {sortConfig.key === 'amount' && (
                <span className="ml-1">
                  {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                </span>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="border-b border-gray-200 p-2 text-center">
                <input
                  type="checkbox"
                  checked={selectedOrders.includes(order.id)}
                  onChange={() => onToggleSelection(order.id)}
                  className="form-checkbox"
                />
              </td>
              <td className="border-b border-gray-200 p-2">{order.orderNumber}</td>
              <td className="border-b border-gray-200 p-2">{order.customer}</td>
              <td className="border-b border-gray-200 p-2">{order.date}</td>
              <td className="border-b border-gray-200 p-2">${order.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
