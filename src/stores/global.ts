export interface GlobalStatus {
  opNames: { [key: string]: boolean }
  requestNumber: number
  error: {
    status: boolean
    message?: string
  }
}
