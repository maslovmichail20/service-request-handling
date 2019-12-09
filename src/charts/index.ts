import Chart, { ChartConfiguration } from 'chart.js'

type ChartType = 'timeWaitIntensityRelation' | 'processorIdleTimeIntensityRelation' | 'timeWaitPriorityRelation'

export type ChartsControllerConfig = Record<ChartType, {
  config: ChartConfiguration
  getData: () => Array<{ x: number, y: number }>
}>

export class ChartsController {
  private config: ChartsControllerConfig
  private charts!: Record<ChartType, Chart>
  public ready: Promise<void>

  public constructor(config: ChartsControllerConfig) {
    this.config = config
    this.charts = {} as Record<ChartType, Chart>

    this.ready = new Promise(resolve => {
      window.onload = () => {
        Object.entries(this.config).forEach(([type, { config }]) => {
          const ctx = (document.getElementById(type) as HTMLCanvasElement).getContext('2d')!
          this.charts[type as ChartType] = new Chart(ctx, config)
        })
        resolve()
      }
    })
  }

  public updateCharts = () => {
    Object.values(this.config).forEach(({ config, getData }) => {
      config.data!.datasets![0].data = getData()
    })
    Object.values(this.charts).forEach(chart => chart.update())
  }
}

export * from './config-creators'
