/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { Drawer, Position } from '@blueprintjs/core'
import { Button } from '@harness/uicore'
import * as servicediscovery from 'services/servicediscovery'
import { TestWrapper } from '@common/utils/testUtils'
import { useCreateAgent } from 'services/servicediscovery'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps, modulePathProps } from '@common/utils/routeUtils'
import CreateDAgent from '../CreateDAgent'

const handleSubmit = jest.fn()
const infraMutate = jest.fn()

jest.useFakeTimers({ advanceTimers: true })

jest.mock('@common/components/SchedulePanel/SchedulePanel', () => ({
  ...jest.requireActual('@common/components/SchedulePanel/SchedulePanel'),
  __esModule: true,
  default: () => {
    return <div className={'schedule-panel'}>Schedule Panel</div>
  }
}))

const defaultProps = {
  setDrawerOpen: () => void 0
}

const PATH = routes.toDiscovery({ ...accountPathProps, ...projectPathProps, ...modulePathProps })
const PATH_PARAMS = {
  accountId: 'accountId',
  orgIdentifier: 'default',
  projectIdentifier: 'Discovery_Test',
  module: 'chaos'
}

function WrapperComponentWithDrawerState(): React.ReactElement {
  const [isOpen, setDrawerOpen] = useState<boolean>(false)

  return (
    <div>
      <Button text={'create'} minimal icon="cross" withoutBoxShadow onClick={() => setDrawerOpen(true)} />
      <p>Create Discovery Agent</p>
      <Drawer position={Position.RIGHT} isOpen={isOpen} isCloseButtonShown={true} size={'86%'}>
        <CreateDAgent {...defaultProps} />
      </Drawer>
    </div>
  )
}

function WrapperComponent(): React.ReactElement {
  return (
    <TestWrapper>
      <Drawer position={Position.RIGHT} isOpen={true} isCloseButtonShown={true} size={'86%'}>
        <CreateDAgent {...defaultProps} />
      </Drawer>
    </TestWrapper>
  )
}

jest.mock('services/servicediscovery', () => ({
  useCreateAgent: jest.fn().mockImplementation(() => ({ mutate: infraMutate }))
}))

describe('Define Discovery Agent Creation Step', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('open drawer on empty state click', async () => {
    const { getByText } = render(
      <TestWrapper>
        <WrapperComponentWithDrawerState />
      </TestWrapper>
    )
    expect(getByText('Create Discovery Agent')).toBeInTheDocument()
    const createBtn = await getByText('create')

    act(() => {
      fireEvent.click(createBtn)
    })
    await waitFor(() => expect(getByText('discovery.createNewDiscoveryAgent')).toBeInTheDocument())
  })
  test('should render dAgent creation step', async () => {
    const { container, getByTestId } = render(<WrapperComponent />)
    expect(getByTestId('input')).toBeInTheDocument()
    const identifierField = getByTestId('input').firstChild as HTMLInputElement
    expect(identifierField).toHaveTextContent('discovery.dAgentName')

    const name = document.querySelector('input[name="discoveryAgentName"]') as HTMLInputElement
    fireEvent.change(name, { target: { value: 'testTemp' } })
    expect(name).toHaveValue('testTemp')
    fireEvent.change(name, { target: { value: 'test1' } })
    expect(name).toHaveValue('test1')

    const networkTraceSwitch = document.querySelector('input[name="detectNetworkTrace"]') as HTMLInputElement
    fireEvent.change(networkTraceSwitch, { target: { value: true } })
    expect(networkTraceSwitch).toBeTruthy()

    expect(container).toBeDefined()
  })

  test('should submit form data', async () => {
    const { findByText } = render(<WrapperComponent />)
    const submitBtn = await findByText('discovery.createNewDiscoveryAgent')
    act(() => {
      fireEvent.click(submitBtn)
    })

    waitFor(() => expect(handleSubmit).toHaveBeenCalled())
    expect(useCreateAgent).toBeCalled()
  })

  test('should have the correct text content', async () => {
    const { getByText } = render(<WrapperComponent />)

    expect(getByText('common.networkMap')).toBeInTheDocument()
    expect(getByText('discovery.whatIsNetworkMap')).toBeInTheDocument()
    expect(getByText('discovery.howToCreateNetworkMap')).toBeInTheDocument()
    expect(getByText('discovery.whatIsServiceDiscovery')).toBeInTheDocument()
  })

  test('should render loading view correctly', async () => {
    jest.spyOn(servicediscovery, 'useCreateAgent').mockImplementation((): any => {
      return {
        data: undefined,
        loading: true
      }
    })

    const { container } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
        <CreateDAgent {...defaultProps} />
      </TestWrapper>
    )
    expect(servicediscovery.useCreateAgent).toBeCalled()

    expect(container).toMatchSnapshot()
  })

  test('should render error view correctly', async () => {
    jest.spyOn(servicediscovery, 'useCreateAgent').mockImplementation((): any => {
      return {
        data: undefined,
        loading: false,
        error: {
          message: 'some error'
        }
      }
    })

    const { findByText } = render(<WrapperComponent />)
    const submitBtn = await findByText('discovery.createNewDiscoveryAgent')
    act(() => {
      fireEvent.click(submitBtn)
    })

    waitFor(() => expect(handleSubmit).toHaveBeenCalled())
    expect(useCreateAgent).toBeCalled()
  })
})
