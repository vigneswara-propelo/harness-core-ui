import React, { useContext } from 'react'
import * as idb from 'idb'
import { render } from '@testing-library/react'
import { IDBContext, IDBProvider } from '../IDBContext'

function TestComponent(): JSX.Element {
  const { initializationFailed, initialized, initializing, error } = useContext(IDBContext)

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

  test('should initialize if openDB resolve', async () => {
    jest.spyOn(idb, 'openDB').mockImplementation(() => Promise.resolve({} as idb.IDBPDatabase))

    const { getByText, findByText } = render(
      <IDBProvider dbName="testDB" storeName="testStoreName" keyPath="identifier">
        <TestComponent />
      </IDBProvider>
    )

    expect(getByText('initializing')).toBeTruthy()
    expect(await findByText('initialized')).toBeTruthy()
  })

  test('should fail if openDB reject', async () => {
    jest.spyOn(idb, 'openDB').mockImplementation(() => Promise.reject())

    const { findByText } = render(
      <IDBProvider dbName="testDB" storeName="testStoreName" keyPath="identifier">
        <TestComponent />
      </IDBProvider>
    )

    expect(await findByText('initializationFailed')).toBeTruthy()
    expect(await findByText('error')).toBeTruthy()
  })
})
