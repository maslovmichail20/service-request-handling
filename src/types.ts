export type Process = {
  id: string
  duration: number
  priority: number
}

export type Reporters = {
  reportProcessCapture: (processId: string, time: Date) => void
  reportProcessExecution: (processId: string, time: Date) => void
  reportIdleStart: (time: Date) => void
  reportIdleEnd: (time: Date) => void
}
