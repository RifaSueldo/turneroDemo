export async function handler(event, context) {
  console.log("Headers recibidos:", event.headers);
  console.log("Body recibido:", event.body);
  console.log("Process.env.APP_SECRET:", process.env.APP_SECRET);
import fetch from "node-fetch";

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // Validar clave secreta
    const secret = event.headers["x-app-secret"];
    if (secret !== process.env.APP_SECRET) {
      return { statusCode: 403, body: "Forbidden" };
    }

    // Parsear datos enviados desde el panel HTML
    const { accion, cantidad } = JSON.parse(event.body);

    if (!accion || !cantidad) {
      return { statusCode: 400, body: "Faltan parámetros" };
    }

    // URL de tu Apps Script publicado como Web App
    const url = "https://script.google.com/macros/s/AKfycbynvfWxVLQKACZp5mAaXeE-QXEd-BjTmucmH8zuDU-3rdWKf1wmNNgcJrEm2x8Q3r19/exec";

    // Hacer POST al Apps Script
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ accion, cantidad })
    });

    const data = await response.json();

    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
}
