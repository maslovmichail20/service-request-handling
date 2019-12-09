import {ChartConfiguration} from 'chart.js'

export const createTimeWaitPriorityRelationChartConfig = (maxPriority: number): ChartConfiguration => ({
  type: 'line',
  data: {
    labels: new Array(maxPriority).fill(null).map((_, i) => i + 1).map(String),
    datasets: [{
      label: 'Dataset',
      backgroundColor: 'red',
      borderColor: 'red',
      data: [],
      fill: false,
    }]
  },
  options: {
    responsive: true,
    title: {
      display: true,
      text: 'Relation between average time wait of request and priority of request to processor'
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
            labelString: 'Priority'
          }
        }
      ]
    }
  }
})
