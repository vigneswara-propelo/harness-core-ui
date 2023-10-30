import { IDBActions } from './IDBTypes'

interface IInitializingAction {
  type: IDBActions.initializing
  payload?: void
}
const setInitializing = (): IInitializingAction => ({
  type: IDBActions.initializing
})

interface IInitializedAction {
  type: IDBActions.initialized
  payload?: void
}
const setInitialized = (): IInitializedAction => ({
  type: IDBActions.initialized
})

interface IInitializationFailedAction {
  type: IDBActions.initializationFail
  payload: boolean
}
const setInitializationFailed = (initializationFailed: boolean): IInitializationFailedAction => ({
  type: IDBActions.initializationFail,
  payload: initializationFailed
})

interface IErrorAction {
  type: IDBActions.error
  payload: string
}
const setError = (error: string): IErrorAction => ({
  type: IDBActions.error,
  payload: error
})

export type IDBActionType = IInitializedAction | IInitializationFailedAction | IInitializingAction | IErrorAction

export const IDBContextAction = {
  setInitializing,
  setInitialized,
  setInitializationFailed,
  setError
}
