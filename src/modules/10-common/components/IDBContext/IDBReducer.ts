import { IDBActionType } from './IDBActions'
import { IDBActions, IDBReducerState } from './IDBTypes'

export const initialState = { initialized: false, initializationFailed: false, initializing: false }

export const idbReducer = (state = initialState, data: IDBActionType): IDBReducerState => {
  const { type, payload } = data
  switch (type) {
    case IDBActions.initializing:
      return {
        ...state,
        initializing: true
      }
    case IDBActions.initialized:
      return {
        ...state,
        initialized: true,
        initializing: false
      }
    case IDBActions.initializationFail:
      return {
        ...state,
        initializationFailed: payload,
        initializing: false
      }
    case IDBActions.error:
      return { ...state, initializing: false, error: payload }
    default:
      return state
  }
}
