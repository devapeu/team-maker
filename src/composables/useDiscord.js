import html2canvas from 'html2canvas'

// You may want to move these to a config file if used elsewhere
const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export function useDiscord(showToast) {
  async function sendPlannerToDiscord(teamData) {
    try {
      const el = document.querySelector('#saved-configurations')
      if (!el) {
        showToast('No se encontró el elemento de equipos.', 'error', 3000)
        return
      }

      const canvas = await html2canvas(el, { backgroundColor: '#0f0f0f', scale: 2.5 })
      const dataUrl = canvas.toDataURL('image/png')
      if (!dataUrl) throw new Error('No se pudo generar la imagen')

      // dataUrl is like: data:image/png;base64,AAAA...
      const imageBase64 = dataUrl.split(',')[1]
      if (!imageBase64) throw new Error('No se pudo extraer base64 de la imagen')

      const payload = {
        message: `Distribución de Equipos`,
        imageBase64
      }

      const res = await fetch(`${API_BASE}/send-planner-to-discord`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(`API request failed: ${res.status} ${txt}`)
      }

      const json = await res.json()
      if (json && json.code && json.code >= 200 && json.code < 300) {
        showToast('Enviado a Discord correctamente.', 'success', 3000)
      } else {
        const msg = (json && json.message) ? json.message : 'Respuesta inesperada del servidor'
        throw new Error(msg)
      }
    } catch (err) {
      console.error(err)
      showToast('Error al enviar a Discord: ' + (err.message || err), 'error', 4000)
    }
  }

  return {
    sendPlannerToDiscord
  }
}
