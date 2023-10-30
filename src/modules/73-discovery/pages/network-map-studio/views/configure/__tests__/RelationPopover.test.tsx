/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, modulePathProps, networkMapPathProps, projectPathProps } from '@common/utils/routeUtils'
import { mockNetworkMap } from './mocks'
import RelationPopover from '../RelationPopover'

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
const openNewRelation = jest.fn()
const closeNewRelation = jest.fn()

describe('<RelationPopover /> tests with data', () => {
  beforeEach(() => jest.clearAllMocks())

  test('should render component and click on submit', async () => {
    const { container, getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <RelationPopover
          networkMap={mockNetworkMap}
          updateNetworkMap={updateNetworkMap}
          isOpen={true}
          open={openNewRelation}
          close={closeNewRelation}
          initialValues={{
            source: '64c229096fb4bc8feefc933b',
            target: '64c229096fb4bc8feefc933d',
            properties: { type: 'TCP', port: '3000', tag: 'hello' }
          }}
        >
          <div className="button"></div>
        </RelationPopover>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    act(() => {
      fireEvent.click(getByText('saveChanges'))
    })
  })

  test('should render component show error and click on cancel', async () => {
    const { container, getByText } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <RelationPopover
          networkMap={mockNetworkMap}
          updateNetworkMap={updateNetworkMap}
          isOpen={true}
          open={openNewRelation}
          close={closeNewRelation}
          initialValues={{
            source: '64c229096fb4bc8feefc933b',
            target: '64c229096fb4bc8feefc933d',
            properties: { type: 'notTCP', port: '30wd00', tag: 'hello' }
          }}
        >
          <div className="button"></div>
        </RelationPopover>
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('saveChanges'))
    })

    act(() => {
      fireEvent.click(getByText('cancel'))
    })

    expect(container).toMatchSnapshot()
  })
})
