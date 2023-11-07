/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useReducer, useRef } from 'react'
import { deleteDB, IDBPDatabase, openDB } from 'idb'
import SessionToken from 'framework/utils/SessionToken'
import { ModuleName } from 'framework/types/ModuleName'
import { loggerFor } from 'framework/logging/logging'
import { IDBReducerState } from './IDBTypes'
import { idbReducer, initialState } from './IDBReducer'
import { IDBContextAction } from './IDBActions'

const logger = loggerFor(ModuleName.CD)

const DBInitializationFailed = 'DB Creation retry exceeded.'
const DBNotFoundErrorMessage = 'There was no DB found'

const DefaultKeyPath = 'identifier'
export interface IDBPayload extends Record<string, unknown> {
  identifier: string
}

export interface IDB<T> {
  idb?: IDBPDatabase<T>
  get: (id: string) => Promise<T | undefined>
  put: (payload: IDBPayload & T) => Promise<unknown>
  del: (id: string) => Promise<unknown>
}
export interface IDBContextInterface<T = unknown> extends IDBReducerState {
  idb: IDB<T>
}

interface IDBProviderProps {
  storeName: string
  dbName: string
  keyPath?: string
  children: React.ReactNode
}

export const IDBContext = React.createContext<IDBContextInterface>({
  initializationFailed: false,
  initialized: false,
  initializing: false,
  idb: {
    get: (_id: string) => Promise.resolve(undefined),
    put: (_payload: IDBPayload) => Promise.resolve(undefined),
    del: (_id: string) => Promise.resolve(undefined)
  }
})

export function IDBProvider(props: IDBProviderProps): React.ReactElement {
  const { storeName, dbName, keyPath = DefaultKeyPath, children } = props
  const [state, dispatch] = useReducer(idbReducer, initialState)
  const idbHandleRef = useRef<IDBPDatabase | undefined>()

  const cleanUpDBRefs = (): void => {
    if (idbHandleRef.current) {
      idbHandleRef.current.close()
      idbHandleRef.current = undefined
    }
  }

  const initializeDB = async (version: number, trial = 0): Promise<void> => {
    if (!idbHandleRef.current) {
      try {
        dispatch(IDBContextAction.setInitializing())
        const _idbHandle = await openDB(dbName, version, {
          upgrade(db) {
            if (db.objectStoreNames.contains(storeName)) {
              try {
                db.deleteObjectStore(storeName)
              } catch (_) {
                dispatch(IDBContextAction.setError(DBNotFoundErrorMessage))
              }
            }
            if (!db.objectStoreNames.contains(storeName)) {
              const objectStore = db.createObjectStore(storeName, { keyPath: keyPath, autoIncrement: false })
              objectStore.createIndex(keyPath, keyPath, { unique: true })
            }
          },
          async blocked() {
            cleanUpDBRefs()
          },
          async blocking() {
            cleanUpDBRefs()
          }
        })
        idbHandleRef.current = _idbHandle
        dispatch(IDBContextAction.setInitialized())
      } catch (e) {
        // DB downgraded, deleting and re creating the DB
        try {
          await deleteDB(dbName)
        } catch (_) {
          // ignore
        }
        idbHandleRef.current = undefined

        ++trial

        if (trial < 5) {
          await initializeDB(version, trial)
        } else {
          dispatch(IDBContextAction.setError(DBInitializationFailed))
          dispatch(IDBContextAction.setInitializationFailed(true))
        }
      }
    } else {
      dispatch(IDBContextAction.setInitialized())
    }
  }

  React.useEffect(() => {
    const time = SessionToken.getLastTokenSetTime()
    initializeDB(time || Date.now())

    return () => {
      cleanUpDBRefs()
    }
  }, [])

  const get = async (id: string): Promise<unknown> => {
    try {
      if (idbHandleRef.current?.objectStoreNames?.contains(storeName)) {
        return idbHandleRef.current?.get(storeName, id)
      }
    } catch (_) {
      logger.info(DBNotFoundErrorMessage)
    }
  }

  const put = async (payload: IDBPayload): Promise<unknown> => {
    try {
      return idbHandleRef.current?.put(storeName, payload)
    } catch (_) {
      logger.info(DBNotFoundErrorMessage)
    }
  }

  const del = async (id: string): Promise<unknown> => {
    try {
      return idbHandleRef.current?.delete(storeName, id)
    } catch (_) {
      logger.info(DBNotFoundErrorMessage)
    }
  }

  return (
    <IDBContext.Provider
      value={{
        idb: { idb: idbHandleRef.current, get, put, del },
        ...state
      }}
    >
      {children}
    </IDBContext.Provider>
  )
}

export function useIDBContext<T>(): IDBContextInterface<T> {
  // disabling this because this the definition of useIDBContext
  // eslint-disable-next-line no-restricted-syntax
  return React.useContext(IDBContext) as IDBContextInterface<T>
}
