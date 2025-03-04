"use client";

// Caché local para datos de operaciones
const operationsCache = {
    data: null,
    timestamp: null,
    expirationTime: 30 * 60 * 1000 // 30 minutos
};

export const getOperationsSAP = async ({ setLoading } = {}) => {
    try {
        if (setLoading) setLoading(true);

        // Verificar si hay datos en caché y si no han expirado
        const now = Date.now();
        if (operationsCache.data && operationsCache.timestamp && 
            (now - operationsCache.timestamp) < operationsCache.expirationTime) {
            console.log('📌 Usando datos de operaciones en caché local');
            return operationsCache.data;
        }

        console.log('📌 Solicitando datos de operaciones al backend');
        const response = await fetch('http://localhost:5000/api/sap/DP_OPERACIONES_DIRECCIONES');

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error obteniendo operaciones: ${errorText}`);
        }

        const data = await response.json();
        
        // Guardar en caché local
        operationsCache.data = data;
        operationsCache.timestamp = now;

        console.log(`📌 Total de operaciones obtenidas: ${data.length}`);
        return data;
    } catch (error) {
        console.error('❌ Error en getOperationsSAP:', error);
        throw error;
    } finally {
        if (setLoading) setLoading(false);
    }
}; 