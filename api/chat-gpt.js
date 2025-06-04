// api/chat-gpt.js

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
    return res.status(500).json({ error: "OpenAI API key no configurada" });
  }

  try {
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: "Eres un asistente jurídico que responde en español y con precisión." },
            { role: "user", content: mensaje }
          ],
          max_tokens: 400,
          temperature: 0.7
        })
      }
    );

    const data = await openaiResponse.json();
    if (data.error) {
      console.error("Error desde OpenAI:", data.error);
      return res.status(502).json({ error: "Error en la API de OpenAI" });
    }

    const respuestaChatGpt = data.choices[0]?.message?.content || "";
    return res.status(200).json({ respuesta: respuestaChatGpt });
  } catch (err) {
    console.error("Error interno del servidor:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
