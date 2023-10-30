export interface IDBReducerState {
  initialized: boolean
  initializationFailed: boolean
  initializing: boolean
  error?: string
}

export enum IDBActions {
  initialized = 'IDB/initialized',
  initializationFail = 'IDB/initializationFail',
  initializing = 'IDB/initializing',
  error = 'IDB/error'
}
