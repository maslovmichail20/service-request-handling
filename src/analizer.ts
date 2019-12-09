import { Simulator, ProcessorIdleStatistic } from './simulator'

const calcProcessWaitTime = (
  { captureTime, executionTime, duration }:
  { captureTime?: Date, executionTime?: Date, duration: number }
): number | null => {
  if (captureTime && executionTime) {
    return executionTime.getTime() - captureTime.getTime() - duration
  }
  return null
}

const calcProcessorIdleTime = (
  {idleEndTime, idleStartTime}: ProcessorIdleStatistic
): number | null => {
  if(idleStartTime && idleEndTime) {
    return idleEndTime.getTime() - idleStartTime.getTime()
  }
  return null
}

const notNull = <T>(data: T | null) => data !== null

export class Analizer {
  private simulator: Simulator
  private statistic?: ReturnType<Simulator['getStatistic']>

  public constructor(simulator: Simulator) {
    this.simulator = simulator
  }

  public startAnalizeSimulation = (notifier: () => void, interval: number) => {
    const timer = setInterval(() => {
      this.loadStatistic()
      notifier()
    }, interval)

    return this.simulator.simulate().then(() => {
      clearInterval(timer)
      this.loadStatistic()
      notifier()
    })
  }

  private loadStatistic = () => {
    this.statistic = this.simulator.getStatistic()
  }

  public getAverageTimeWaitByIntensity = () => {
    if (!this.statistic) this.loadStatistic()

    const timeWaitByIntensity = this.statistic!
      .map(({ intensity, processHandling }) => ({
        x: intensity,
        y: processHandling.map(calcProcessWaitTime).filter(notNull) as number[]
      }))

    return timeWaitByIntensity
      .filter(({ y }) => y.length > 0)
      .map(({ x, y }) => ({ x, y: y.reduce((acc, value) => acc + value, 0) / y.length }))
  }

  public getProcessorIdleTimeByIntensity = () => {
    if (!this.statistic) this.loadStatistic()

    return this.statistic!
      .map(({ intensity, lifecicle }) => ({
        x: intensity,
        y: lifecicle
          .map(calcProcessorIdleTime)
          .filter(notNull)
          .reduce<number>((acc, y) => acc + (y as number), 0)
      }))
  }

  public getAverageTimeWaitByPriority = () => {
    if (!this.statistic) this.loadStatistic()

    const waitByPriority: Record<number, number[]> = {}

    this.statistic!
      .forEach(({ processHandling }) => processHandling
        .forEach(({ priority, ...rest }) => {
          const waitTime = calcProcessWaitTime(rest)
          if (waitTime !== null) {
            if (!waitByPriority[priority]) waitByPriority[priority] = []
            waitByPriority[priority].push(waitTime)
          }
        })
      )

    return Object.entries(waitByPriority)
      .map(([ x, waitTime ]) => ({
        x: Number(x),
        y: waitTime.reduce((acc, y) => acc + y, 0) / waitTime.length
      }))
      .filter(({ y }) => y > 0)
  }
}
