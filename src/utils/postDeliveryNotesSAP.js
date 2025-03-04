"use client";

export const postDeliveryNotesSAP = async (orders) => {
    try {
        // Validar que las órdenes tengan los campos necesarios
        if (!orders || orders.length === 0) {
            throw new Error('No hay órdenes para procesar');
        }

        // Verificar que las órdenes tengan ShipToCode
        const ordenesSinShipToCode = orders.filter(order => !order.ShipToCode);
        if (ordenesSinShipToCode.length > 0) {
            console.error('❌ Órdenes sin ShipToCode:', ordenesSinShipToCode);
            throw new Error(`Hay ${ordenesSinShipToCode.length} órdenes sin ShipToCode. Verifica los datos de los pedidos.`);
        }

        // Obtener todas las operaciones una sola vez
        console.log('📌 Obteniendo datos de operaciones...');
        const operacionesResponse = await fetch('http://localhost:5000/api/sap/DP_OPERACIONES_DIRECCIONES');
        if (!operacionesResponse.ok) {
            throw new Error(`Error obteniendo operaciones: ${await operacionesResponse.text()}`);
        }
        const operaciones = await operacionesResponse.json();
        console.log(`📌 Se obtuvieron ${operaciones.length} operaciones`);

        // Agrupar órdenes por cliente y fecha de entrega
        const groupedOrders = orders.reduce((acc, order) => {
            const key = `${order.CardCode}_${order.FechaEntrega}`;
            if (!acc[key]) {
                acc[key] = {
                    // Cabecera del documento
                    CardCode: order.CardCode,
                    DocDate: new Date().toISOString().split('T')[0],
                    DocDueDate: order.FechaEntrega,
                    ShipToCode: order.ShipToCode,
                    DocumentLines: []
                };
            }

            // Agregar líneas de productos
            const products = [
                { code: 'C001', quantity: order.GO2, price: order.Price },
                { code: 'C003', quantity: order.GO3, price: order.Price },
                { code: 'C004', quantity: order.NS, price: order.Price },
                { code: 'C005', quantity: order.NP, price: order.Price }
            ];

            products.forEach(product => {
                if (product.quantity > 0) {
                    acc[key].DocumentLines.push({
                        ItemCode: product.code,
                        Quantity: product.quantity * 1000, // Convertir de m³ a litros
                        UnitPrice: product.price // Cambiado de Price a UnitPrice
                    });
                }
            });

            return acc;
        }, {});

        // Enviar cada grupo de órdenes como un remito separado
        const results = await Promise.all(
            Object.values(groupedOrders).map(async (orderGroup) => {
                try {
                    // Buscar la operación correspondiente
                    const operacion = operaciones.find(op => 
                        op.CardCode === orderGroup.CardCode && 
                        op.ShipToCode === orderGroup.ShipToCode
                    );

                    if (!operacion) {
                        console.error('❌ Operaciones disponibles para este CardCode:', 
                            operaciones.filter(op => op.CardCode === orderGroup.CardCode)
                        );
                        throw new Error(
                            `No se encontró operación para CardCode: ${orderGroup.CardCode} y ShipToCode: ${orderGroup.ShipToCode}. ` +
                            'Verifica que el ShipToCode corresponda a una dirección válida para este cliente.'
                        );
                    }

                    // Construir el payload ordenado
                    const payload = {
                        // 1. Datos de cabecera
                        CardCode: orderGroup.CardCode,
                        DocDate: orderGroup.DocDate,
                        DocDueDate: orderGroup.DocDueDate,
                        ShipToCode: orderGroup.ShipToCode,
                        PointOfIssueCode: operacion.PuntoRemito,
                        // 2. Líneas del documento
                        DocumentLines: orderGroup.DocumentLines
                    };

                    console.log("📌 Enviando remito a SAP:", JSON.stringify(payload, null, 2));

                    const response = await fetch('http://localhost:5000/api/sap/DeliveryNotes', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Error enviando remito: ${errorText}`);
                    }

                    return response.json();
                } catch (error) {
                    console.error(`❌ Error procesando remito para ${orderGroup.CardCode}:`, error);
                    throw error;
                }
            })
        );

        return results;
    } catch (error) {
        console.error('❌ Error enviando remitos a SAP:', error);
        throw error;
    }
};
