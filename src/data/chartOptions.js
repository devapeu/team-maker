export const chartOptions = { 
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