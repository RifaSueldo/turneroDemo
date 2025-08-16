import fetch from "node-fetch";

export async function handler(event, context) {
  console.log("Headers recibidos:", event.headers);
  console.log("Body recibido:", event.body);
  console.log("Process.env.APP_SECRET:", process.env.APP_SECRET);

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ success: false, error: "Method Not Allowed" }) };
  }

  

    // Parsear datos enviados desde el panel HTML
    const { accion, cantidad } = JSON.parse(event.body);

    if (!accion || !cantidad) {
      return { statusCode: 400, body: JSON.stringify({ success: false, error: "Faltan parámetros" }) };
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
    console.error("Error en proxy:", error);
    return { statusCode: 500, body: JSON.stringify({ success: false, error: error.toString() }) };
  }
}
