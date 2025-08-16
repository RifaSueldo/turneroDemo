// Node 18+ en Netlify ya trae fetch global; no importes node-fetch.

const VENDORS_URL =
  process.env.VENDORS_URL ||
  "https://script.google.com/macros/s/AKfycbz7VNWutWsDPlc0BSvzPxCRY3wyQ-Hzjj1ynl1gFWoVB7BKFPd-zjw7xfaBqXI-UUEM/exec";

// Map de clientes -> URL de su Apps Script (esto NO va en el HTML)
const CLIENT_SCRIPTS = {
  cliente1: "https://script.google.com/macros/s/AKfycbynvfWxVLQKACZp5mAaXeE-QXEd-BjTmucmH8zuDU-3rdWKf1wmNNgcJrEm2x8Q3r19/exec",
  Cliente2: "https://script.google.com/macros/s/AKfycbznPQ29QBLxkFnbf396OfpdqcbZ-QBsbZ8CWw8BMMPopnXHHcxoPDAYkA6HSP1yt_uAcg/exec",
  cliente3: "",
};

async function getJSON(url) {
  const r = await fetch(url, { method: "GET" });
  // Si Apps Script devolviera HTML por error, esto previene el crash:
  const text = await r.text();
  try { return JSON.parse(text); } catch {
    return { success: false, error: "Respuesta no JSON del servidor externo", raw: text };
  }
}

async function postForm(url, paramsObj) {
  const body = new URLSearchParams(paramsObj);
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const text = await r.text();
  try { return JSON.parse(text); } catch {
    return { success: false, error: "Respuesta no JSON del servidor externo", raw: text };
  }
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ success:false, error:"Method Not Allowed" }) };
  }

  try {
    const { accion, usuario, clave, cliente, cantidad } = JSON.parse(event.body || "{}");

    // 1) Mostrar saldo (login/consulta)
    if (accion === "obtenerSaldo") {
      const url = `${VENDORS_URL}?action=obtenerSaldo&usuario=${encodeURIComponent(usuario)}&clave=${encodeURIComponent(clave)}`;
      const data = await getJSON(url);
      return { statusCode: 200, body: JSON.stringify(data) };
    }

    // 2) Cargar créditos a un cliente descontando saldo de vendedor (con rollback si falla)
    if (accion === "cargarCreditos") {
      if (!cliente || !CLIENT_SCRIPTS[cliente]) {
        return { statusCode: 400, body: JSON.stringify({ success:false, error:"Cliente no encontrado" }) };
      }
      const cant = Number(cantidad || 0);
      if (cant <= 0) {
        return { statusCode: 400, body: JSON.stringify({ success:false, error:"Cantidad inválida" }) };
      }

      // 2.a) Descontar saldo en Vendedores
      const descontarUrl = `${VENDORS_URL}?action=descontarSaldo&usuario=${encodeURIComponent(usuario)}&clave=${encodeURIComponent(clave)}&cantidad=${cant}`;
      const desc = await getJSON(descontarUrl);
      if (!desc.success) {
        return { statusCode: 200, body: JSON.stringify(desc) };
      }

      // 2.b) Llamar al Apps Script del cliente para cargar créditos
      const clienteUrl = CLIENT_SCRIPTS[cliente];
      const carga = await postForm(clienteUrl, { accion: "cargarCreditos", cantidad: String(cant) });

      // 2.c) Si falla la carga al cliente, hacemos rollback (devolverSaldo)
      if (!carga || !carga.success) {
        const rollbackUrl = `${VENDORS_URL}?action=devolverSaldo&usuario=${encodeURIComponent(usuario)}&clave=${encodeURIComponent(clave)}&cantidad=${cant}`;
        await getJSON(rollbackUrl);
        return { statusCode: 200, body: JSON.stringify({ success:false, error: carga?.error || "No se pudo cargar en cliente", detalle: carga }) };
      }

      // 2.d) Éxito total
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          cliente,
          nuevoSaldo: desc.saldo,
          detalleCliente: carga
        })
      };
    }

    return { statusCode: 400, body: JSON.stringify({ success:false, error:"Acción no reconocida" }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success:false, error: String(err) }) };
  }
}



