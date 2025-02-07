'use client';

let sapSession = null;
let lastLoginTime = null;

export const loginSAP = async () => {
  // Si la sesión aún es válida, reutilizarla
  if (sapSession && lastLoginTime && (Date.now() - lastLoginTime < 5 * 60 * 1000)) {
    console.log(`Usando sesión SAP existente. Último login: ${new Date(lastLoginTime).toISOString()}`);
    return sapSession;
  }

  console.log("Iniciando sesión en SAP...");

  try {
    const response = await fetch('http://localhost:5000/api/loginSAP', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) { 
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al conectar con SAP');
    }

    const data = await response.json();
    
    if (data.success && data.session) {
      sapSession = data.session;
      lastLoginTime = Date.now();
      console.log(`Nueva sesión SAP creada: ${sapSession}`);
      return sapSession;
    } else {
      throw new Error('No se pudo obtener la sesión de SAP');
    }
  } catch (error) {
    console.error("Error al conectar con SAP:", error);
    throw error;
  }
};
