"use client";

export const postDeliveryNotesSAP = async (orders) => {
    try {
        // Agrupar órdenes por cliente y fecha de entrega
        const groupedOrders = orders.reduce((acc, order) => {
            const key = `${order.CardCode}_${order.FechaEntrega}`;
            if (!acc[key]) {
                acc[key] = {
                    CardCode: order.CardCode,
                    DocDate: new Date().toISOString().split('T')[0], // Fecha actual
                    DocDueDate: order.FechaEntrega, // Fecha de entrega
                    DocumentLines: []
                };
            }

            // Agregar líneas de productos
            const products = [
                { code: 'C001', quantity: order.GO2 },
                { code: 'C003', quantity: order.GO3 },
                { code: 'C004', quantity: order.NS },
                { code: 'C005', quantity: order.NP }
            ];

            products.forEach((product, index) => {
                if (product.quantity > 0) {
                    acc[key].DocumentLines.push({
                        ItemCode: product.code,
                        Quantity: product.quantity * 1000, // Convertir de m³ a litros
                        BaseEntry: order.DocNum,
                        BaseLine: index
                    });
                }
            });

            return acc;
        }, {});

        // Enviar cada grupo de órdenes como un remito separado
        const results = await Promise.all(
            Object.values(groupedOrders).map(async (orderGroup) => {
                console.log("📌 Enviando remito a SAP:", JSON.stringify(orderGroup, null, 2));

                const response = await fetch('http://localhost:5000/api/sap/DeliveryNotes', {  // ✅ URL fija al backend
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderGroup)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Error enviando remito: ${errorText}`);
                }

                return response.json();
            })
        );

        return results;
    } catch (error) {
        console.error('❌ Error enviando remitos a SAP:', error);
        throw error;
    }
};
