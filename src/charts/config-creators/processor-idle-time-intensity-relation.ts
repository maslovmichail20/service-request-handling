import { ChartConfiguration } from 'chart.js'

export const createProcessortIdleTimeIntesityRelationChartConfig = (intensities: number[]): ChartConfiguration => ({
  type: 'line',
  data: {
    labels: intensities.map(String),
    datasets: [{
      label: 'Dataset',
      backgroundColor: 'green',
      borderColor: 'green',
      data: [],
      fill: false,
    }]
  },
  options: {
    responsive: true,
    title: {
      display: true,
      text: 'Relation between processor idle time and intensity of requests to processor'
    },
    scales: {
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Idle time'
        }
      }],
      xAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Intensity'
          }
        }
      ]
    }
  }
})
