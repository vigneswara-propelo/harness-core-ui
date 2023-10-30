/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import produce from 'immer'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, modulePathProps, networkMapPathProps, projectPathProps } from '@common/utils/routeUtils'
import { mockNetworkMap, mockRelation, mockSourceService } from './mocks'
import NodeConnectionsSideBar from '../NodeConnectionsSideBar'

const PATH = routes.toCreateNetworkMap({
  ...accountPathProps,
  ...projectPathProps,
  ...modulePathProps,
  ...networkMapPathProps
})
const PATH_PARAMS = {
  accountId: 'accountId',
  orgIdentifier: 'default',
  projectIdentifier: 'Discovery_Test',
  module: 'chaos',
  dAgentId: 'dAgent-1',
  networkMapId: 'testnetworkmap'
}

const updateNetworkMap = jest.fn()
const closeSideBar = jest.fn()

const getDeleteButton = (row: Element): Element | null => {
  const columns = row.querySelectorAll('[role="cell"]')
  const lastColumn = columns[columns.length - 1]
  return lastColumn
}

describe('<NodeConnectionsSideBar /> tests with data', () => {
  beforeEach(() => jest.clearAllMocks())

  test('should render component', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NodeConnectionsSideBar
          sourceService={mockSourceService}
          networkMap={mockNetworkMap}
          updateNetworkMap={updateNetworkMap}
          newRelation={mockRelation}
          closeSideBar={closeSideBar}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('test search', async () => {
    const { getByPlaceholderText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NodeConnectionsSideBar
          sourceService={mockSourceService}
          networkMap={mockNetworkMap}
          updateNetworkMap={updateNetworkMap}
          newRelation={mockRelation}
          closeSideBar={closeSideBar}
        />
      </TestWrapper>
    )

    const query = 'cartservice'
    const searchInput = getByPlaceholderText('discovery.searchService') as HTMLInputElement
    expect(searchInput).not.toBe(null)
    if (!searchInput) {
      throw Error('no search input')
    }
    await userEvent.type(searchInput, query)
    expect(searchInput?.value).toBe(query)
  })

  test('test row functions', async () => {
    const { container, getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NodeConnectionsSideBar
          sourceService={mockSourceService}
          networkMap={mockNetworkMap}
          updateNetworkMap={updateNetworkMap}
          closeSideBar={closeSideBar}
        />
      </TestWrapper>
    )

    const tableRows = Array.from(container.querySelectorAll('div[role="row"]'))
    tableRows.shift() // remove header row

    const testRow = async (row: Element): Promise<void> => {
      const serviceName = getByText('checkoutservice')
      // assert that a connected service exist
      expect(serviceName).toBeTruthy()

      act(() => {
        fireEvent.click(serviceName)
      })
      expect(container).toMatchSnapshot()
      // close popover
      act(() => {
        fireEvent.click(serviceName)
      })

      const deleteButton = getDeleteButton(row)
      // delete a connection
      act(() => {
        fireEvent.click(deleteButton!)
      })
      expect(container).toMatchSnapshot()
    }
    await testRow(tableRows[0])
  })

  test('should render empty table without connections', async () => {
    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NodeConnectionsSideBar
          sourceService={mockSourceService}
          networkMap={produce(mockNetworkMap, draft => {
            draft.connections = undefined
          })}
          updateNetworkMap={updateNetworkMap}
          closeSideBar={closeSideBar}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should test new relation and close button', async () => {
    const { container, getByText, getByTestId } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <NodeConnectionsSideBar
          sourceService={mockSourceService}
          networkMap={mockNetworkMap}
          updateNetworkMap={updateNetworkMap}
          closeSideBar={closeSideBar}
        />
      </TestWrapper>
    )

    // click on new relation button
    act(() => {
      fireEvent.click(getByText('discovery.newRelation'))
    })

    // click on close button
    act(() => {
      fireEvent.click(getByTestId('closeButton'))
    })

    expect(container).toMatchSnapshot()
  })
})
