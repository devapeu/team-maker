export const eloChartOptions = {
  parsing: {
    xAxisKey: 'startgametime',
    yAxisKey: 'elo'
  },

  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    tooltip: {
      callbacks: {
        title(items) {
          const date = new Date(items[0].parsed.x)

          return date.toLocaleDateString('es-ES', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })
        }
      }
    }
  },
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'day',
        tooltipFormat: 'yyyy-MM-dd HH:mm',
        displayFormats: {
          day: 'MMM d',
        },
      },
    },
  },
}