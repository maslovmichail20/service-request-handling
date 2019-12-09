import {Process, Reporters} from "./types"

type ProcessorConfig = {
  maxPriority: number
}

export class Processor {
  private queues: Process[][]
  private reporters: Reporters
  private isIdle: boolean
  private onExecutionEnd?: () => void

  public constructor(config: ProcessorConfig, reporters: Reporters) {
    this.queues = new Array(config.maxPriority).fill(null).map(() => [])
    this.reporters = reporters

    this.isIdle = true
    this.reporters.reportIdleStart(new Date())
  }

  public handleProcessRequests = (processList: Process[]) => {
    const captureTime = new Date()

    processList.forEach(process => {
      this.reporters.reportProcessCapture(process.id, captureTime)
      this.queues[process.priority - 1].unshift(process)
    })

    if (this.isIdle) {
      this.executeProcess(this.getNextProcess()!)
    }
  }

  public bindExecutionEnd = (notify: () => void) => {
    this.onExecutionEnd = notify
    if (this.queues.every(q => q.length === 0)) {
      this.isIdle = false
      this.reporters.reportIdleEnd(new Date)
      this.onExecutionEnd()
    }
  }

  private getNextProcess = () => {
    for (let i = this.queues.length - 1; i >= 0; i--) {
      const process = this.queues[i].pop()
      if (process) {
        return process
      }
    }
  }

  private executeProcess = (process: Process) => {
    if (this.isIdle) {
      this.isIdle = false
      this.reporters.reportIdleEnd(new Date())
    }

    setTimeout(() => {
      this.reporters.reportProcessExecution(process.id, new Date())
      const nextProcess = this.getNextProcess()

      if (nextProcess) {
        this.executeProcess(nextProcess)
      } else {
        if (this.onExecutionEnd) {
          this.onExecutionEnd()
        } else {
          this.isIdle = true
          this.reporters.reportIdleStart(new Date())
        }
      }
    }, process.duration)
  }
}
