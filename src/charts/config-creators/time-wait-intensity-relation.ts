import { ChartConfiguration } from 'chart.js'

export const createTimeWaitIntensityRelationChartConfig = (intensities: number[]): ChartConfiguration => ({
  type: 'line',
  data: {
    labels: intensities.map(String),
    datasets: [{
      label: 'Dataset',
      backgroundColor: 'blue',
      borderColor: 'blue',
      data: [],
      fill: false,
    }]
  },
  options: {
    responsive: true,
    title: {
      display: true,
      text: 'Relation between average time wait and intensity of requests to processor'
    },
    scales: {
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Average time wait'
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
