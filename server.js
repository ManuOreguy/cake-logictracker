import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

let sapSession = null;
// Caché para almacenar datos de SAP
const sapCache = new Map();

// Función para limpiar la caché después de un tiempo
const clearCacheAfterDelay = (key, delay = 1800000) => { // 30 minutos por defecto
  setTimeout(() => {
    sapCache.delete(key);
    console.log(`🗑️ Caché limpiada para: ${key}`);
  }, delay);
};

// 📌 **Login SAP**
app.post("/api/loginSAP", async (req, res) => {
  try {
    const url = `${process.env.SAP_SERVER}/b1s/v2/Login`;
    const payload = JSON.stringify({
      CompanyDB: process.env.SAP_DATABASE,
      UserName: process.env.SAP_USER,
      Password: process.env.SAP_PASSWORD
    });

    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: payload
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error en login SAP: ${errorData.error?.message || response.statusText}`);
    }

    const cookies = response.headers.raw()['set-cookie'];
    sapSession = cookies ? cookies.map(cookie => cookie.split(';')[0]).join('; ') : null;

    console.log("📌 Sesión guardada en backend:", sapSession);

    res.json({ success: true, session: sapSession });
  } catch (error) {
    console.error("❌ Error en login SAP:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 📌 **GET Universal para vistas SAP**
app.get("/api/sap/:view", async (req, res) => {
  try {
    const { view } = req.params;
    const { refresh } = req.query; // Parámetro opcional para forzar actualización
    const baseUrl = `${process.env.SAP_SERVER}/b1s/v2/sml.svc/`;
    let url = `${baseUrl}${view}`;

    // Verificar si los datos están en caché y no se solicita actualización
    if (!refresh && sapCache.has(view)) {
      console.log(`📌 Retornando datos en caché para: ${view}`);
      return res.json(sapCache.get(view));
    }

    if (!sapSession) {
      throw new Error("No hay sesión de SAP activa. Inicia sesión primero.");
    }

    let allData = [];

    const fetchData = async (url) => {
      console.log("📌 Solicitando datos a:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Cookie": sapSession
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error obteniendo datos: ${errorText}`);
      }

      const data = await response.json();
      allData = allData.concat(data.value || []);

      if (data["@odata.nextLink"]) {
        const nextPageUrl = `${baseUrl}${data["@odata.nextLink"]}`;
        console.log("📌 Cargando siguiente página:", nextPageUrl);
        await fetchData(nextPageUrl);
      }
    };

    await fetchData(url);
    console.log(`📌 Total de registros obtenidos para ${view}: ${allData.length}`);
    
    // Guardar en caché
    sapCache.set(view, allData);
    clearCacheAfterDelay(view);
    
    res.json(allData);
  } catch (error) {
    console.error(`❌ Error obteniendo datos de ${req.params.view}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// 📌 **POST Universal para enviar datos a SAP**
app.post("/api/sap/:endpoint", async (req, res) => {
  try {
    const { endpoint } = req.params;
    const payload = req.body;
    const baseUrl = `${process.env.SAP_SERVER}/b1s/v2/`;
    const url = `${baseUrl}${endpoint}`;

    if (!sapSession) {
      throw new Error("No hay sesión de SAP activa. Inicia sesión primero.");
    }

    // Validar que payload tiene la estructura correcta
    if (!payload || typeof payload !== "object") {
      throw new Error("El payload enviado no es válido.");
    }

    console.log("📌 Recibí un POST a:", endpoint);
    console.log("📌 URL de SAP:", url);
    console.log("📌 Payload enviado:", JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Cookie": sapSession
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🚨 Error en la respuesta de SAP:", errorText);
      throw new Error(`Error enviando datos a SAP: ${errorText}`);
    }

    const responseData = await response.json();
    console.log("📌 Respuesta de SAP:", responseData);
    
    res.json(responseData);
  } catch (error) {
    console.error(`❌ Error en POST a ${req.params.endpoint}:`, error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => console.log("🚀 Servidor backend corriendo en http://localhost:5000"));
