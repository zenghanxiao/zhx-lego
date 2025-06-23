export interface ActionPayload {
  urlParams?: { [key: string]: any }
  data?: any
  searchParams?: { [key: string]: any }
}

export interface RespData<T = object> {
  errno: number
  data: T
  message?: string
  payload?: ActionPayload
}

export interface UploadData {
  urls: string[]
}

export type RespUploadData = RespData<UploadData>
