import html2canvas from 'html2canvas'

// You may want to move these to a config file if used elsewhere
const API_BASE = 'https://comix.fluffygangcomic.com/aomstats';
//const API_BASE = 'http://localhost:3000';
const API_KEY = '1e7a2a92-83c2-43e0-b092-f63b39e33da0';

export function useDiscord(team1Ref, team2Ref, showToast) {
  async function sendPlannerToDiscord() {
    try {
      const el = document.querySelector('.teams__wrapper')
      if (!el) {
        showToast('No se encontró el elemento de equipos.', 'error', 3000)
        return
      }

      if (team1Ref.value.length === 0 || team2Ref.value.length === 0) {
        showToast('Pon al menos un jugador en cada equipo.', 'error', 3000)
        return
      }

      // Increase scale for acceptable resolution (but watch file size)
      const canvas = await html2canvas(el, { backgroundColor: '#0f0f0f', scale: 2 })
      const dataUrl = canvas.toDataURL('image/png')
      if (!dataUrl) throw new Error('No se pudo generar la imagen')

      // dataUrl is like: data:image/png;base64,AAAA...
      const imageBase64 = dataUrl.split(',')[1]
      if (!imageBase64) throw new Error('No se pudo extraer base64 de la imagen')

      const payload = {
        message: 'Distribución de equipos',
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
