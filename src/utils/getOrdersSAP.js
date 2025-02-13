"use client";
import { loginSAP } from "./loginSAP";
import { transformSAPOrders } from "./orderUtils";

export const getOrdersSAP = async (view) => {
    const session = await loginSAP();
    const baseUrl = "http://localhost:5000/api/orders/";
    let url = `${baseUrl}${view}`;
    let allData = [];

    const fetchData = async (url) => {
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

        const responseData = await response.json();
        const dataToAdd = responseData.value || responseData;

        if (Array.isArray(dataToAdd)) {
            allData = allData.concat(dataToAdd);
        }

        // 📌 **Corrección de paginación: Construcción correcta de URL**
        if (responseData["@odata.nextLink"]) {
            const nextPagePath = responseData["@odata.nextLink"]; // "DP_PEDIDOS_ABIERTOS?$skip=20"
            const nextUrl = `http://localhost:5000/api/orders/${nextPagePath}`; 

            if (nextUrl !== url) {
                console.log("📌 Cargando siguiente página:", nextUrl);
                await fetchData(nextUrl);
            } else {
                console.warn("⚠️ Deteniendo loop: @odata.nextLink es igual a la URL actual.");
            }
        }
    };

    try {
        await fetchData(url);
        console.log(`📌 Total de registros obtenidos: ${allData.length}`);

        // 📌 **Transformar y devolver los datos**
        const transformedData = transformSAPOrders(allData);
        return transformedData;
    } catch (error) {
        console.error("❌ Error en getOrdersSAP:", error);
        throw error;
    }
};
