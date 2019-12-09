import {ChartConfiguration} from 'chart.js'

export const createTimeWaitIntensityRelationChartConfig = (intensities: number[]): ChartConfiguration => ({
  type: 'line',
  data: {
    labels: intensities.map(String),
    datasets: [{
      label: 'Dataset',
      backgroundColor: 'orange',
      borderColor: 'orange',
      data: [],
      fill: false,
    }]
  },
  options: {
    responsive: true,
    title: {
      display: true,
      text: 'Relation between average time wait of request and intensity of requests to processor'
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
