import uuid from 'uuid'

import {Processor} from './processor'
import {Process, Reporters} from './types'
import {getRandom} from './utils'

export type ProcessStatistic = {
  processId: string
  captureTime?: Date
  executionTime?: Date
}

export type ProcessorIdleStatistic = {
  idleStartTime?: Date
  idleEndTime?: Date
}

export type ProcessorStatistic = {
  intensity: number
  lifecicle: ProcessorIdleStatistic[],
  processHandling: ProcessStatistic[]
}

export type SimulationProccessor = {
  processor: Processor
  intensity: number
  capturedProccessCount: number
}

export type SimulatorConfig = {
  intensities: number[]
  tick: number
  maxProcessPriority: number
  process: {
    count: number,
    minDuration: number,
    maxDuration: number
  }
}

export class Simulator {
  private config: SimulatorConfig
  private statistic = new Map<string, ProcessorStatistic>()
  private processors: Record<string, SimulationProccessor> = {}
  private processMap: Record<string, Process> = {}

  public constructor(config: SimulatorConfig) {
    this.config = config

    this.config.intensities.forEach(intensity => {
      const processorId = uuid()
      this.statistic.set(processorId, {intensity, lifecicle: [], processHandling: []})

      const processor = new Processor({maxPriority: config.maxProcessPriority}, {
        reportProcessCapture: this.createReportProcessCapture(processorId),
        reportProcessExecution: this.createReportProcessExecution(processorId),
        reportIdleStart: this.createReportIdleStart(processorId),
        reportIdleEnd: this.createReportIdleEnd(processorId)
      })

      this.processors[processorId] = {intensity, processor, capturedProccessCount: 0}
    })
  }

  public simulate = () => Promise.all(
    Object.values(this.processors).map(this.simulateExecution)
  )

  public getStatistic = () =>
    Array.from(this.statistic.values()).map(
      ({processHandling, ...rest}) => ({
        processHandling: processHandling.map(({processId, ...times}) => ({
          duration: this.processMap[processId].duration,
          priority: this.processMap[processId].priority,
          ...times
        })),
        ...rest
      })
    )

  private simulateExecution = (systemProccessor: SimulationProccessor) =>
    new Promise(resolve => {
      const interval = setInterval(() => {
        if (systemProccessor.capturedProccessCount >= this.config.process.count) {
          clearInterval(interval)
          systemProccessor.processor.bindExecutionEnd(resolve)
        }

        let processList = this.generateProcess(systemProccessor.intensity * 20)
        if (systemProccessor.capturedProccessCount + processList.length > this.config.process.count) {
          processList = processList.slice(0, this.config.process.count - systemProccessor.capturedProccessCount)
        }

        systemProccessor.processor.handleProcessRequests(processList)

        systemProccessor.capturedProccessCount += processList.length
        processList.forEach(process => this.processMap[process.id] = process)
      }, this.config.tick)
    })


  private generateProcess = (count: number): Process[] => new Array(count).fill(null)
    .map<Process>(() => ({
      id: uuid(),
      priority: getRandom(1, this.config.maxProcessPriority),
      duration: getRandom(this.config.process.minDuration, this.config.process.maxDuration)
    }))

  private createReportProcessCapture = (processorId: string): Reporters['reportProcessCapture'] =>
    (processId, captureTime) => {
      this.statistic.get(processorId)?.processHandling.push({processId, captureTime})
    }

  private createReportProcessExecution = (processorId: string): Reporters['reportProcessExecution'] =>
    (processId, executionTime) => {
      const statistic = this.statistic.get(processorId)?.processHandling
        .find(({processId: id}) => id === processId)

      if (statistic) {
        statistic.executionTime = executionTime
      } else {
        throw new Error('Unkown process execution')
      }
    }

  private createReportIdleStart = (processorId: string): Reporters['reportIdleStart'] =>
    idleStartTime => {
      this.statistic.get(processorId)?.lifecicle.push({idleStartTime})
    }

  private createReportIdleEnd = (processorId: string): Reporters['reportIdleEnd'] =>
    idleEndTime => {
      const lifecicle = this.statistic.get(processorId)?.lifecicle
      if (lifecicle) {
        lifecicle[lifecicle.length - 1].idleEndTime = idleEndTime
      } else {
        throw new Error('Unknown processor lifecicle')
      }
    }
}
