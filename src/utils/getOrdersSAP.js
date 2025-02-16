    "use client";
    import { loginSAP } from "./loginSAP";
    import { transformSAPOrders } from "./orderUtils";

    // Caché local para datos de SAP
    const localCache = new Map();

    export const getOrdersSAP = async (view, { forceRefresh = false, setLoading } = {}) => {
        try {
            if (setLoading) setLoading(true);

            // Verificar caché local si no se fuerza actualización
            if (!forceRefresh && localCache.has(view)) {
                console.log(`📌 Usando datos en caché local para: ${view}`);
                return localCache.get(view);
            }

            const session = await loginSAP();
            const baseUrl = "http://localhost:5000/api/sap/";
            const url = `${baseUrl}${view}${forceRefresh ? '?refresh=true' : ''}`;
            
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
            
            // Guardar en caché local
            localCache.set(view, transformedData);
            
            console.log(`📌 Total de registros obtenidos: ${transformedData.length}`);
            return transformedData;
        } catch (error) {
            console.error("❌ Error en getOrdersSAP:", error);
            throw error;
        } finally {
            if (setLoading) setLoading(false);
        }
    };
