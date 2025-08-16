import fetch from "node-fetch";

export async function handler(event, context) {
  console.log("Función proxy multi-cliente arrancó");
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
    const { accion, cantidad, cliente } = JSON.parse(event.body);

    if (!accion || !cantidad || !cliente) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "Faltan parámetros" })
      };
    }

    // Map de clientes a sus URLs de Apps Script
    const urlsAppsScript = {
      "cliente1": "https://script.google.com/macros/s/AKfycbynvfWxVLQKACZp5mAaXeE-QXEd-BjTmucmH8zuDU-3rdWKf1wmNNgcJrEm2x8Q3r19/exec",
      "cliente2": "https://script.google.com/macros/s/AKfycbynvfWxVLQKACZp5mAaXeE-QXEd-BjTmucmH8zuDU-3rdWKf1wmNNgcJrEm2x8Q3r19/exec",
      "cliente3": "https://script.google.com/macros/s/AKfycbynvfWxVLQKACZp5mAaXeE-QXEd-BjTmucmH8zuDU-3rdWKf1wmNNgcJrEm2x8Q3r19/exec"
      // agregá más clientes aquí
    };

    const url = urlsAppsScript[cliente];
    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "Cliente no encontrado" })
      };
    }

    // Hacer POST al Apps Script correspondiente
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ accion, cantidad })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, cliente, data })
    };

  } catch (error) {
    console.error("Error en proxy:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.toString() })
    };
  }
}


