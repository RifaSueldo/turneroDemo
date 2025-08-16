import fetch from "node-fetch";

export async function handler(event, context) {
  console.log("Función proxy arrancó");
  console.log("Headers recibidos:", event.headers);
  console.log("Body recibido:", event.body);

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: "Method Not Allowed" })
    };
  }

  try {
    // Parsear datos enviados desde el HTML
    const { accion, cantidad } = JSON.parse(event.body);

    if (!accion || !cantidad) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "Faltan parámetros" })
      };
    }

    // URL de tu Apps Script publicado como Web App
    const url = "https://script.google.com/macros/s/TU_ID_DEL_SCRIPT/exec";

    // Hacer POST al Apps Script
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ accion, cantidad })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data })
    };

  } catch (error) {
    console.error("Error en proxy:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.toString() })
    };
  }
}
