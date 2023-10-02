/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, act, waitFor, RenderResult } from '@testing-library/react'
import * as pipelineService from 'services/pipeline-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { JsonNode } from 'services/cd-ng'
import type { Module } from '@common/interfaces/RouteInterfaces'
import preflightSuccessMock from './mock/preflightSuccessMock.json'
import preflightFailureMock from './mock/preflightFailureMock.json'
import preflightProgressMock from './mock/preflightProgressMock.json'
import { PreFlightCheckModal } from '../PreFlightCheckModal'
import { getPipelinePayload, pipeline, pipelinePayloadWithInputSetSelected } from './mock/helper'
import { InputSetValue } from '../../InputSetSelector/utils'

const timeoutSpy = jest.spyOn(window, 'setTimeout')
const startPreflightCheckPromiseSpy = jest.spyOn(pipelineService, 'startPreflightCheckPromise')
startPreflightCheckPromiseSpy.mockReturnValue(Promise.resolve({}))

const setupPreFlightCheckModal = (
  preflightDataMock: JsonNode,
  onCloseButtonClickMock: () => void,
  onContinueButtonClickMock: () => void,
  selectedInputSets?: InputSetValue[],
  pipelineData?: pipelineService.PipelineInfoConfig,
  module = 'ci'
): RenderResult => {
  const mockRefetch = jest.fn()
  const useGetPreflightCheckResponseSpy = jest.spyOn(pipelineService, 'useGetPreflightCheckResponse')
  useGetPreflightCheckResponseSpy.mockReturnValue({
    data: preflightDataMock,
    refetch: mockRefetch as any
  } as any)

  const renderObj = render(
    <TestWrapper>
      <PreFlightCheckModal
        {...(pipelineData ? { pipeline: pipelineData } : {})}
        accountId="accId"
        module={module as unknown as Module}
        projectIdentifier="projId"
        orgIdentifier="orgId"
        pipelineIdentifier="pipId"
        onCloseButtonClick={onCloseButtonClickMock}
        onContinuePipelineClick={onContinueButtonClickMock}
        selectedInputSets={selectedInputSets}
      />
    </TestWrapper>
  )

  return renderObj
}

describe('PreflightCheck', () => {
  test('renders property when return all success checks', async () => {
    const closeButtonClickMock = jest.fn()
    const continueButtonClickMock = jest.fn()
    const { container, getByText } = setupPreFlightCheckModal(
      preflightSuccessMock,
      closeButtonClickMock,
      continueButtonClickMock
    )

    act(() => {
      fireEvent.click(getByText('close'))
    })
    await waitFor(() => expect(closeButtonClickMock).toBeCalled())

    act(() => {
      fireEvent.click(getByText('pre-flight-check.continueToRunPipeline'))
    })
    await waitFor(() => expect(continueButtonClickMock).toBeCalled())

    expect(container).toMatchSnapshot()
  })

  test('see if RETRY works', () => {
    startPreflightCheckPromiseSpy.mockResolvedValue({
      status: 'SUCCESS',
      data: 'idafterretry'
    })

    const closeButtonClickMock = jest.fn()
    const continueButtonClickMock = jest.fn()
    const { container, getByText } = setupPreFlightCheckModal(
      preflightSuccessMock,
      closeButtonClickMock,
      continueButtonClickMock
    )

    act(() => {
      fireEvent.click(getByText('retry'))
    })

    expect(container).toMatchSnapshot('loading state after retry click')
    expect(timeoutSpy).toBeCalled()
  })

  test('renders property when has failed checks', async () => {
    const closeButtonClickMock = jest.fn()
    const continueButtonClickMock = jest.fn()
    const { container, getAllByText } = setupPreFlightCheckModal(
      preflightFailureMock,
      closeButtonClickMock,
      continueButtonClickMock
    )

    expect(container).toMatchSnapshot('before opening the error description panel')

    // Click on accordion heading
    act(() => {
      fireEvent.click(getAllByText('org.orgConnectorId')[0])
    })

    expect(container).toMatchSnapshot('after opening the error panel')
  })

  test('renders property when has in progress checks', async () => {
    const closeButtonClickMock = jest.fn()
    const continueButtonClickMock = jest.fn()
    const { container } = setupPreFlightCheckModal(preflightProgressMock, closeButtonClickMock, continueButtonClickMock)

    expect(container).toMatchSnapshot()
  })

  test('click on section title open correct section', async () => {
    const closeButtonClickMock = jest.fn()
    const continueButtonClickMock = jest.fn()
    const { container, getByText } = setupPreFlightCheckModal(
      preflightProgressMock,
      closeButtonClickMock,
      continueButtonClickMock
    )

    const connectorsSectionTitle = getByText('pre-flight-check.verifyingPipelineInputs')
    act(() => {
      fireEvent.click(connectorsSectionTitle)
    })
    expect(container).toMatchSnapshot('opened pipeline inputs section')

    const inputsSectionTitle = getByText('pre-flight-check.verifyingConnectors')
    act(() => {
      fireEvent.click(inputsSectionTitle)
    })
    expect(container).toMatchSnapshot('opened connectors section')
  })

  test('run pipeline form with no input set should - pipeline payload "" should not be transformed to <+input>', () => {
    const closeButtonClickMock = jest.fn()
    const continueButtonClickMock = jest.fn()
    const { getByText } = setupPreFlightCheckModal(
      preflightSuccessMock,
      closeButtonClickMock,
      continueButtonClickMock,
      [],
      pipeline,
      'cd'
    )

    fireEvent.click(getByText('retry'))
    expect(pipelineService.startPreflightCheckPromise).toHaveBeenCalledWith(getPipelinePayload(pipeline))
  })

  test('run pipeline form with input set should - pipeline payload "" should be transformed to <+input>', () => {
    const closeButtonClickMock = jest.fn()
    const continueButtonClickMock = jest.fn()
    const { getByText } = setupPreFlightCheckModal(
      preflightSuccessMock,
      closeButtonClickMock,
      continueButtonClickMock,
      [
        {
          label: 'IP1',
          value: 'IP1',
          type: 'INPUT_SET',
          gitDetails: {}
        }
      ],
      pipeline,
      'cd'
    )

    fireEvent.click(getByText('retry'))
    expect(pipelineService.startPreflightCheckPromise).toHaveBeenCalledWith(
      getPipelinePayload(pipelinePayloadWithInputSetSelected)
    )
  })
})
