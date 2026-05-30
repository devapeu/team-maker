export const skillChartOptions = {
  responsive: true, 
  maintainAspectRatio: true, 
  plugins: {
    legend: {
      labels: {
        color: 'white'
      }
    },
    tooltip: {
      bodyColor: 'white',  
      backgroundColor: 'rgba(0, 0, 0, 0.7)' 
    },
  },
  scales: { 
    r: { 
      suggestedMax: 100,
      suggestedMin: 0,
      ticks: {
        color: 'white',
        backdropColor: 'transparent',
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.2)',
      }
    }
  },
  elements: {
    line: {
      borderColor: 'white',
    },
  },
  layout: {
    padding: 20,
  },
  backgroundColor: 'rgba(0,0,0,0.1)', 
}

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