import {Simulator, SimulatorConfig} from './simulator'
import {Analizer} from './analizer'
import {
  ChartsController,
  createTimeWaitIntensityRelationChartConfig,
  createProcessortIdleTimeIntesityRelationChartConfig,
  createTimeWaitPriorityRelationChartConfig
} from './charts'

export class App {
  private analizer!: Analizer
  private simulator!: Simulator
  private chartsController: ChartsController
  private isProcessing: boolean

  public constructor() {
    const config = this.getSimulatorConfig()
    this.isProcessing = false
    this.initDeps(config)
    this.chartsController = new ChartsController({
      timeWaitIntensityRelation: {
        config: createTimeWaitIntensityRelationChartConfig(config.intensities),
        getData: this.analizer.getAverageTimeWaitByIntensity
      },
      processorIdleTimeIntensityRelation: {
        config: createProcessortIdleTimeIntesityRelationChartConfig(config.intensities),
        getData: this.analizer.getProcessorIdleTimeByIntensity
      },
      timeWaitPriorityRelation: {
        config: createTimeWaitPriorityRelationChartConfig(config.maxProcessPriority),
        getData: this.analizer.getAverageTimeWaitByPriority
      }
    })
  }

  public init = async () => {
    await this.chartsController.ready
    this.listenStart()
    this.listenPriorityChange()
    this.listenIntensityChange()
  }

  private initDeps = (config: SimulatorConfig) => {
    this.simulator = new Simulator(config)
    this.analizer = new Analizer(this.simulator)
  }

  private listenStart = () => {
    const button = document.getElementById('start-button')!
    const loader = document.getElementById('loader')!

    const startSimulation = () => {
      this.isProcessing = true
      button.style.display = 'none'
      loader.style.display = 'block'
    }

    const finishSimulation = () => {
      this.isProcessing = false
      button.style.display = 'initial'
      loader.style.display = 'none'
    }

    button.addEventListener('click', () => {
      this.initDeps(this.getSimulatorConfig())
      this.chartsController.updateDataGetters({
        timeWaitIntensityRelation: this.analizer.getAverageTimeWaitByIntensity,
        processorIdleTimeIntensityRelation: this.analizer.getProcessorIdleTimeByIntensity,
        timeWaitPriorityRelation: this.analizer.getAverageTimeWaitByPriority
      })

      startSimulation()
      this.analizer.startAnalizeSimulation(this.chartsController.updateCharts, 200)
        .then(finishSimulation)
    })
  }

  private listenPriorityChange = () => {
    const input = document.getElementById('max-priority') as HTMLInputElement
    input.addEventListener('change', this.updateChartLables)
  }

  private listenIntensityChange = () => {
    const inputs = Array.from(document.getElementsByName('intensity'))
    inputs.forEach(input => input.addEventListener('change', this.updateChartLables))
  }

  private updateChartLables = () => {
    if (this.isProcessing) return
    const {intensities, maxProcessPriority} = this.getSimulatorConfig()
    this.chartsController.updateChartLables(intensities, maxProcessPriority)
  }

  private getSimulatorConfig = (): SimulatorConfig => {
    const maxProcessPriority = this.getMaxPriority()
    const requestCount = this.getRequestCount()
    const intensityRate = this.getIntensityRate()
    const intensities = new Array(Math.round(1 / intensityRate))
      .fill(null)
      .map((_, i) => Math.round((i + 1) * intensityRate * 1000) / 1000)

    return {
      tick: 50,
      maxProcessPriority,
      intensities,
      process: {
        count: Math.round(requestCount / intensities.length),
        minDuration: 1,
        maxDuration: 5
      }
    }
  }

  private getMaxPriority = () => parseInt((document.getElementById('max-priority') as HTMLInputElement).value);
  private getRequestCount = () => parseInt((document.getElementById('request-count') as HTMLInputElement).value);
  private getIntensityRate = () => parseFloat((document.querySelector('input[name="intensity"]:checked') as HTMLInputElement).value)
}
