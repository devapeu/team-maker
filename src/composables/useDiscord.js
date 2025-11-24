import html2canvas from 'html2canvas'

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
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('No se pudo generar la imagen')

      const form = new FormData()
      form.append('file', blob, 'teams.png')
      form.append('content', 'Distribución de equipos')

      const webhookUrl = 'https://discord.com/api/webhooks/1442274909819633704/6a830IBy5CyuqOfP859belG5habkJDHMP8tCd8MkTH9aZKRg_D_3coGI8W8jyV0l80kk'

      const res = await fetch(webhookUrl, { method: 'POST', body: form })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Discord webhook failed: ${res.status} ${txt}`)
      }

      showToast('Enviado a Discord correctamente.', 'success', 3000)
    } catch (err) {
      console.error(err)
      showToast('Error al enviar a Discord: ' + (err.message || err), 'error', 4000)
    }
  }

  return {
    sendPlannerToDiscord
  }
}
