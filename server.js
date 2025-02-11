import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

let sapSession = null;

// Caché para almacenar los datos de SAP
const sapCache = new Map();

// Función para limpiar la caché después de cierto tiempo
const clearCacheAfterDelay = (view) => {
  setTimeout(() => {
    sapCache.delete(view);
    console.log(`🗑️ Caché limpiada para la vista: ${view}`);
  }, 5 * 60 * 1000); // 5 minutos
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

// 📌 **GET universal con caché**
app.get("/api/orders/:view", async (req, res) => {
  try {
    const { view } = req.params;
    const { refresh } = req.query; // Parámetro opcional para forzar recarga
    const baseUrl = `${process.env.SAP_SERVER}/b1s/v2/sml.svc/`;
    let url = `${baseUrl}${view}`;

    if (!sapSession) {
      throw new Error("No hay sesión de SAP activa. Inicia sesión primero.");
    }

    // Verificar si los datos están en caché y no se solicita refresh
    if (!refresh && sapCache.has(view)) {
      console.log(`📦 Retornando datos desde caché para: ${view}`);
      return res.json(sapCache.get(view));
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
    console.log(`📌 Total de registros obtenidos: ${allData.length}`);

    // Guardar en caché
    sapCache.set(view, allData);
    clearCacheAfterDelay(view);

    res.json(allData);
  } catch (error) {
    console.error("❌ Error obteniendo órdenes:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => console.log("🚀 Servidor backend corriendo en http://localhost:5000"));
