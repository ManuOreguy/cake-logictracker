import React from 'react';

export const TravelPreparationTable = ({ orders }) => (
  <table className="w-full border-collapse">
    <thead>
      <tr className="bg-gray-100">
        <th className="border-b border-gray-200 p-2">Order Number</th>
        <th className="border-b border-gray-200 p-2">Customer</th>
        <th className="border-b border-gray-200 p-2">Date</th>
        <th className="border-b border-gray-200 p-2">Amount</th>
      </tr>
    </thead>
    <tbody>
      {orders.map(order => (
        <tr key={order.id} className="hover:bg-gray-50">
          <td className="border-b border-gray-200 p-2">{order.orderNumber}</td>
          <td className="border-b border-gray-200 p-2">{order.customer}</td>
          <td className="border-b border-gray-200 p-2">{order.date}</td>
          <td className="border-b border-gray-200 p-2">${order.amount.toFixed(2)}</td>
        </tr>
      ))}
    </tbody>
  </table>
); 