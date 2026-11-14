/**
 * app.js - Cliente JavaScript para desplegar como Static Site en Render
 * y consumir una API de Python en Hugging Face Spaces.
 */

// ============================================================================
// CONFIGURACIÓN:
// Reemplaza esta URL por la URL directa de tu Hugging Face Space.
// El formato suele ser: https://<tu-usuario>-<nombre-del-espacio>.hf.space/<ruta>
// Ejemplo: "https://juan-mi-modelo.hf.space/predict"
// ============================================================================
const HF_SPACE_URL = "https://TU_USUARIO-TU_ESPACIO.hf.space/predict";

// Si tu Space es privado, necesitarás un token de Hugging Face (hf_...).
// Si es público, déjalo vacío ("").
const HF_TOKEN = ""; 

// Referencias a los elementos del DOM
const promptInput = document.getElementById("promptInput");
const sendBtn = document.getElementById("sendBtn");
const output = document.getElementById("output");

/**
 * Función para enviar los datos a Hugging Face Space vía POST
 */
async function sendDataToHF() {
  const inputValue = promptInput.value.trim();

  if (!inputValue) {
    alert("Por favor, escribe algo en el campo de texto.");
    return;
  }

  // Actualizar estado de la interfaz
  sendBtn.disabled = true;
  output.textContent = "⏳ Enviando petición y esperando respuesta de Python...\n(Nota: Si el Space estaba 'dormido', puede tardar unos 20-40s en despertar)";
  output.classList.remove("error");

  try {
    // 1. Preparar cabeceras (Headers)
    const headers = {
      "Content-Type": "application/json",
    };

    if (HF_TOKEN) {
      headers["Authorization"] = `Bearer ${HF_TOKEN}`;
    }

    // 2. Preparar el cuerpo (Payload)
    // - Si tu backend en HF es FastAPI / Flask: Envías un objeto JSON normal:
    const payload = {
      prompt: inputValue
    };

    // NOTA PARA GRADIO:
    // Si tu Space usa Gradio en vez de FastAPI nativo, el formato suele requerir un array "data":
    // const payload = { data: [inputValue] };

    // 3. Realizar la petición HTTP con fetch
    const response = await fetch(HF_SPACE_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload)
    });

    // 4. Manejo de errores HTTP
    if (!response.ok) {
      throw new Error(`Error del servidor (${response.status}): ${response.statusText}`);
    }

    // 5. Procesar la respuesta JSON devuelta por Python
    const data = await response.json();

    // Mostrar el resultado en pantalla
    output.textContent = JSON.stringify(data, null, 2);

  } catch (error) {
    console.error("Error al conectar con Hugging Face Spaces:", error);
    output.classList.add("error");
    output.textContent = `❌ Falló la petición:\n${error.message}\n\nPosibles causas:\n1. La URL de HF_SPACE_URL aún no ha sido configurada.\n2. Problema de CORS en el script de Python.\n3. El Space está pausado o en construcción.`;
  } finally {
    sendBtn.disabled = false;
  }
}

// Escuchar el evento clic del botón
sendBtn.addEventListener("click", sendDataToHF);

// Permitir enviar con la tecla Enter en el input
promptInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendDataToHF();
  }
});
