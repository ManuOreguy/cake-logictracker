"use client";
import { loginSAP } from "./loginSAP";
import { transformSAPOrders } from "./orderUtils";

// Caché del lado del cliente
const clientCache = new Map();

export const getOrdersSAP = async (view, options = {}) => {
    const { setLoading, forceRefresh = false } = options;

    try {
        if (setLoading) setLoading(true);

        // Verificar caché del cliente
        if (!forceRefresh && clientCache.has(view)) {
            console.log(`📦 Usando datos en caché para: ${view}`);
            return clientCache.get(view);
        }

        const session = await loginSAP();
        const baseUrl = "http://localhost:5000/api/orders/";
        let url = `${baseUrl}${view}${forceRefresh ? '?refresh=true' : ''}`;

        console.log("📌 Solicitando datos a:", url);
        const response = await fetch(url, {
            method: "GET",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": session 
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error obteniendo datos: ${errorText}`);
        }

        const data = await response.json();
        const transformedData = transformSAPOrders(data);

        // Guardar en caché del cliente
        clientCache.set(view, transformedData);
        clearClientCacheAfterDelay(view);

        return transformedData;
    } catch (error) {
        console.error("❌ Error en getOrdersSAP:", error);
        throw error;
    } finally {
        if (setLoading) setLoading(false);
    }
};

// Limpiar caché del cliente después de cierto tiempo
const clearClientCacheAfterDelay = (view) => {
    setTimeout(() => {
        clientCache.delete(view);
        console.log(`🗑️ Caché del cliente limpiada para: ${view}`);
    }, 5 * 60 * 1000); // 5 minutos
};
