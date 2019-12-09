import { Simulator, SimulatorConfig } from './simulator'
import { Analizer } from './analizer'
import {
  ChartsController,
  createTimeWaitIntensityRelationChartConfig,
  createProcessortIdleTimeIntesityRelationChartConfig,
  createTimeWaitPriorityRelationChartConfig
} from './charts'

export class App {
  private analizer: Analizer
  private simulator: Simulator
  private chartsController: ChartsController

  public constructor() {
    const simulatorConfig = this.getSimulatorConfig()

    this.simulator = new Simulator(simulatorConfig)
    this.analizer = new Analizer(this.simulator)

    this.chartsController = new ChartsController({
      timeWaitIntensityRelation: {
        config: createTimeWaitIntensityRelationChartConfig(simulatorConfig.intensities),
        getData: this.analizer.getAverageTimeWaitByIntensity
      },
      processorIdleTimeIntensityRelation: {
        config: createProcessortIdleTimeIntesityRelationChartConfig(simulatorConfig.intensities),
        getData: this.analizer.getProcessorIdleTimeByIntensity
      },
      timeWaitPriorityRelation: {
        config: createTimeWaitPriorityRelationChartConfig(simulatorConfig.maxProcessPriority),
        getData: this.analizer.getAverageTimeWaitByPriority
      }
    })
  }

  public async init() {
    await this.chartsController.ready
    this.analizer.startAnalizeSimulation(this.chartsController.updateCharts, 200)
      .then(() => console.log('finish'))
  }

  private getSimulatorConfig = (): SimulatorConfig => ({
    tick: 35,
    maxProcessPriority: 16,
    intensities: new Array(10).fill(null).map((_, i) => (i + 1) / 10),
    process: {
      count: 10000,
      minDuration: 1,
      maxDuration: 5
    }
  })
}
