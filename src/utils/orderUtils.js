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
        const { DocNum, CardName, FechaEntrega, Terminal, ItemCode, OpenQty, Tipo } = order;

        if (!groupedOrders[DocNum]) {
            groupedOrders[DocNum] = {
                DocNum,
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