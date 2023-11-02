import React, { useEffect } from 'react'
import * as idbModule from 'idb'
import { render, waitFor } from '@testing-library/react'
import { IDBProvider, useIDBContext } from '../IDBContext'

function TestComponent({ callIdb }: { callIdb?: boolean }): JSX.Element {
  const { initializationFailed, initialized, initializing, error, idb } = useIDBContext()

  useEffect(() => {
    if (callIdb) {
      idb.del('testId')
      idb.get('testId')
      idb.put({ identifier: 'testId' })
    }
  }, [callIdb, idb])

  return (
    <>
      <div>{initializationFailed && 'initializationFailed'}</div>
      <div>{initializing && 'initializing'}</div>
      <div>{initialized && 'initialized'}</div>
      <div>{error && 'error'}</div>
    </>
  )
}

describe('IDBContext test', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should reject get, put, del if no handle is set', () => {
    jest
      .spyOn(idbModule, 'openDB')
      .mockImplementation(() =>
        Promise.resolve({ objectStoreNames: { contains: (_key: string) => true } } as idbModule.IDBPDatabase)
      )
    const logSpy = jest.spyOn(global.console, 'info')

    render(
      <IDBProvider dbName="testDB" storeName="testStoreName" keyPath="identifier">
        <TestComponent callIdb />
      </IDBProvider>
    )

    waitFor(() => {
      expect(logSpy).toBeCalledTimes(3)
      expect(logSpy).toBeCalledWith('There was no DB found')
    })

    logSpy.mockClear()
  })

  test('should initialize if openDB resolve', async () => {
    jest.spyOn(idbModule, 'openDB').mockImplementation(() => Promise.resolve({} as idbModule.IDBPDatabase))

    const { findByText } = render(
      <IDBProvider dbName="testDB" storeName="testStoreName" keyPath="identifier">
        <TestComponent />
      </IDBProvider>
    )

    expect(await findByText('initializing')).toBeTruthy()
    expect(await findByText('initialized')).toBeTruthy()
  })

  test('should fail if openDB reject', async () => {
    jest.spyOn(idbModule, 'openDB').mockImplementation(() => Promise.reject())

    const { findByText } = render(
      <IDBProvider dbName="testDB" storeName="testStoreName" keyPath="identifier">
        <TestComponent />
      </IDBProvider>
    )

    expect(await findByText('initializationFailed')).toBeTruthy()
    expect(await findByText('error')).toBeTruthy()
  })

  test('should call get, put, delete', () => {
    const getMock = jest.fn() as idbModule.IDBPDatabase['get']
    const putMock = jest.fn() as idbModule.IDBPDatabase['put']
    const delMock = jest.fn() as idbModule.IDBPDatabase['delete']

    jest.spyOn(idbModule, 'openDB').mockImplementation(() =>
      Promise.resolve({
        get: getMock,
        put: putMock,
        delete: delMock,
        objectStoreNames: { contains: (_key: string) => true },
        close: () => undefined
      } as idbModule.IDBPDatabase)
    )

    render(
      <IDBProvider dbName="testDB" storeName="testStoreName" keyPath="identifier">
        <TestComponent callIdb />
      </IDBProvider>
    )

    waitFor(() => {
      expect(getMock).toBeCalled()
      expect(putMock).toBeCalled()
      expect(delMock).toBeCalled()
    })
  })
})
