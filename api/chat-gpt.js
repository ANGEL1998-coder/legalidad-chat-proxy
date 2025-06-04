// api/api/chat-gpt.js

import fetch from "node-fetch";

export default async function handler(req, res) {
  // Solo aceptar POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { mensaje } = req.body || {};
  if (!mensaje || typeof mensaje !== "string") {
    return res.status(400).json({ error: "Falta el campo 'mensaje' en el JSON" });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "Clave API OpenAI no configurada" });
  }

  try {
    const respuesta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        // ← IMPORTANTE: aquí el único modelo válido es "gpt-3.5-turbo"
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Eres un asistente muy útil." },
          { role: "user", content: mensaje }
        ]
      }),
    });

    if (!respuesta.ok) {
      const errorJson = await respuesta.json();
      console.error("Error en la petición a OpenAI:", errorJson);
      return res.status(502).json({ error: "Error en la API de OpenAI", detalle: errorJson });
    }

    const datos = await respuesta.json();
    const textoGenerado = datos.choices?.[0]?.message?.content ?? "";
    return res.status(200).json({ respuesta: textoGenerado });
  } catch (err) {
    console.error("Excepción al llamar a OpenAI:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
