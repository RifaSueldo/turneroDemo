// netlify/functions/proxy.js

export async function handler(event, context) {
  // URL de tu Google Apps Script
  const targetUrl = "https://script.google.com/macros/s/AKfycbwEALHzjz_Okk9GIzEX0rqGhS2KV6y1AgMTBmKilraHEoC6ojH0mKrrQZepWw6Zrw/exec";

  try {
    // Forward del request al Apps Script
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: {
        "Content-Type": "application/json",
      },
      body: event.body,
    });

    const data = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Permite todas las orígenes
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      body: data,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

