export const sortOrders = (items, config) => {
    if (!config?.key) return items;

    return [...items].sort((a, b) => {
        const key = config.key;
        const direction = config.direction === "ascending" ? 1 : -1;

        const aValue = a[key] ?? "";
        const bValue = b[key] ?? "";

        if (typeof aValue === "number" && typeof bValue === "number") {
            return direction * (aValue - bValue);
        }

        return direction * String(aValue).localeCompare(String(bValue));
    });
};

export const transformSAPOrders = (orders) => {
    const productMapping = {
        C001: "GO2",
        C003: "GO3",
        C004: "NS",
        C005: "NP",
    };

    const groupedOrders = {};

    orders.forEach((order) => {
        const { DocNum, Estado, CardCode, CardName, FechaEntrega, Terminal, ItemCode, OpenQty, Tipo } = order;

        if (!groupedOrders[DocNum]) {
            groupedOrders[DocNum] = {
                DocNum,
                Estado,
                CardCode,
                CardName,
                FechaEntrega,
                Terminal,
                Tipo: Tipo || 'CIF', // Valor por defecto si no viene
                GO2: 0,
                GO3: 0,
                NS: 0,
                NP: 0,
            };
        }

        const productKey = productMapping[ItemCode];
        if (productKey) {
            groupedOrders[DocNum][productKey] += Math.round(OpenQty / 1000);
        }
    });

    return Object.values(groupedOrders);
};

export const formatFecha = (fechaISO) => {
    if (!fechaISO) return '';
    
    const [year, month, day] = fechaISO.split('-'); // Divide la fecha "YYYY-MM-DD"
    return `${day}-${month}-${year}`; // Devuelve "DD-MM-YYYY"
};

export const sendOrdersToSAP = async (orders) => {
    try {
        // Agrupar órdenes por cliente y fecha de entrega
        const groupedOrders = orders.reduce((acc, order) => {
            const key = `${order.CardCode}_${order.FechaEntrega}`;
            if (!acc[key]) {
                acc[key] = {
                    CardCode: order.CardCode,
                    DocDate: new Date().toISOString().split('T')[0],
                    DocDueDate: order.FechaEntrega,
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
                        Quantity: product.quantity * 1000, // Convertir de m3 a litros
                        //BaseEntry: order.DocNum,
                        //BaseLine: index
                    });
                }
            });

            return acc;
        }, {});

        // Enviar cada grupo de órdenes como un remito separado
        const results = await Promise.all(
            Object.values(groupedOrders).map(async (orderGroup) => {
                const response = await fetch('/api/sap/Orders', {
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
