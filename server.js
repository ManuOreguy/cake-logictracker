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

// Función para cargar datos de una vista SAP
const loadSAPView = async (view) => {
  try {
    if (!sapSession) {
      console.log('📌 No hay sesión activa. Iniciando sesión en SAP...');
      await loginToSAP();
    }

    const baseUrl = `${process.env.SAP_SERVER}/b1s/v2/sml.svc/`;
    let url = `${baseUrl}${view}`;
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
        //console.log("📌 Cargando siguiente página:", nextPageUrl);
        await fetchData(nextPageUrl);
      }
    };

    await fetchData(url);
    console.log(`📌 Total de registros obtenidos para ${view}: ${allData.length}`);
    
    // Guardar en caché
    sapCache.set(view, allData);
    clearCacheAfterDelay(view);
    
    return allData;
  } catch (error) {
    console.error(`❌ Error cargando vista ${view}:`, error);
    throw error;
  }
};

// Función para iniciar sesión en SAP
const loginToSAP = async () => {
  try {
    const url = `${process.env.SAP_SERVER}/b1s/v2/Login`;
    const payload = {
      CompanyDB: process.env.SAP_DATABASE,
      UserName: process.env.SAP_USER,
      Password: process.env.SAP_PASSWORD
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error en login SAP: ${errorData.error?.message || response.statusText}`);
    }

    const cookies = response.headers.raw()['set-cookie'];
    sapSession = cookies ? cookies.map(cookie => cookie.split(';')[0]).join('; ') : null;

    console.log("📌 Sesión SAP iniciada correctamente");
    return sapSession;
  } catch (error) {
    console.error("❌ Error en login SAP:", error);
    throw error;
  }
};

// 📌 **Login SAP**
app.post("/api/loginSAP", async (req, res) => {
  try {
    const session = await loginToSAP();
    res.json({ success: true, session });
  } catch (error) {
    console.error("❌ Error en login SAP:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 📌 **GET Universal para vistas SAP**
app.get("/api/sap/:view", async (req, res) => {
  try {
    const { view } = req.params;
    const { refresh } = req.query;

    // Verificar si los datos están en caché y no se solicita actualización
    if (!refresh && sapCache.has(view)) {
      console.log(`📌 Retornando datos en caché para: ${view}`);
      return res.json(sapCache.get(view));
    }

    const data = await loadSAPView(view);
    res.json(data);
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

    console.log("📌 Enviando datos a SAP:", url);
    console.log("📌 Payload:", JSON.stringify(payload, null, 2));

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

// Cargar datos iniciales al arrancar el servidor
const initializeServer = async () => {
  try {
    console.log('🚀 Iniciando servidor...');
    
    // Iniciar sesión en SAP
    await loginToSAP();
    
    // Cargar datos de operaciones
    console.log('📌 Cargando datos iniciales de operaciones...');
    await loadSAPView('DP_OPERACIONES_DIRECCIONES');
    
    console.log('✅ Datos iniciales cargados correctamente');
  } catch (error) {
    console.error('❌ Error durante la inicialización del servidor:', error);
  }
};

// Iniciar el servidor y cargar datos
initializeServer().then(() => {
  app.listen(5000, () => console.log("🚀 Servidor backend corriendo en http://localhost:5000"));
});
