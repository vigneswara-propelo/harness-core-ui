/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, RenderResult, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { FailureStrategyProps } from '@pipeline/components/PipelineStudio/FailureStrategy/FailureStrategy'
import type { StepCommandsRef } from '@pipeline/components/PipelineStudio/StepCommands/StepCommands'
import type { ManualInterventionFailureActionConfig } from 'services/cd-ng'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import * as useValidationErrors from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import { PipelineStageAdvancedSpecifications } from '../PipelineStageAdvancedSpecifications'
import { errorContextProvider, getDummyPipelineContextValue, getMockFor_delegateSelectors } from './PipelineStageHelper'

const mockGetCallFunction = jest.fn()
const pipelineContextMockValue = getDummyPipelineContextValue()

jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return []
  }),
  useGetDelegateSelectorsUpTheHierarchyV2: jest.fn(() => getMockFor_delegateSelectors())
}))
jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as Record<string, any>),
  debounce: jest.fn(fn => {
    fn.cancel = jest.fn()
    return fn
  })
}))

const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null
})
window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

jest.mock('@pipeline/components/PipelineStudio/FailureStrategy/FailureStrategy', () => ({
  ...(jest.requireActual('@pipeline/components/PipelineStudio/FailureStrategy/FailureStrategy') as any),
  // eslint-disable-next-line react/display-name
  FailureStrategyWithRef: React.forwardRef(({ onUpdate }: FailureStrategyProps, _ref: StepCommandsRef) => {
    return (
      <div className="failure-strategy-mock">
        <button
          name={'updateFailureStrategy'}
          onClick={() => {
            onUpdate({
              failureStrategies: [
                {
                  onFailure: {
                    errors: ['AllErrors'],
                    action: {
                      type: 'ManualIntervention'
                    } as ManualInterventionFailureActionConfig
                  }
                }
              ]
            })
          }}
        >
          Failure Strategy button
        </button>
      </div>
    )
  })
}))

// eslint-disable-next-line react/display-name
jest.mock('@pipeline/components/PipelineStudio/ConditionalExecution/ConditionalExecution', () => (props: any) => (
  <div className="conditional-execution-mock">
    <button
      name={'updateConditionalExecution'}
      onClick={() => {
        props.onUpdate({ pipelineStatus: 'Success' })
      }}
    >
      Conditional Execution button
    </button>
  </div>
))

const renderComponent = (value?: PipelineContextInterface): RenderResult => {
  const pipelineContextValue = value ?? {
    ...pipelineContextMockValue,
    state: {
      ...pipelineContextMockValue.state,
      selectionState: {
        selectedSectionId: 'ADVANCED',
        selectedStageId: 'parStage1',
        selectedStepId: undefined
      }
    }
  }
  return render(
    <TestWrapper>
      <PipelineContext.Provider value={pipelineContextValue}>
        <StageErrorContext.Provider value={errorContextProvider}>
          <PipelineStageAdvancedSpecifications
            conditionalExecutionTooltipId="conditionalExecutionCustomStage"
            failureStrategyTooltipId="failureStrategyCustomStage"
          />
        </StageErrorContext.Provider>
      </PipelineContext.Provider>
    </TestWrapper>
  )
}

describe('Pipeline Stage advanced specifications test', () => {
  test(`should Delegate Selector, Failure Strategy & Conditional Execution section be present`, () => {
    expect.assertions(3)
    renderComponent()

    expect(screen.getByText('pipeline.delegate.DelegateSelectorOptional')).toBeInTheDocument()
    expect(screen.getByText(/failure strategy/i)).toBeInTheDocument()
    expect(screen.getByText(/conditional execution/i)).toBeInTheDocument()
  })

  test('should onUpdate DelegateSelector be called', async () => {
    renderComponent()

    const button = await screen.findByPlaceholderText('delegate.Delegate_Selector_placeholder')
    userEvent.click(button as HTMLElement)

    const delegateSelectorResourceElem = await screen.findByText('qa-stress-delegate')
    userEvent.click(delegateSelectorResourceElem)

    expect(pipelineContextMockValue.getStageFromPipeline).toBeCalled()
    expect(pipelineContextMockValue.getStageFromPipeline).toBeCalledWith(
      pipelineContextMockValue.state.selectionState.selectedStageId
    )
    expect(pipelineContextMockValue.updateStage).toBeCalled()
  })

  test('should onUpdate ConditionalExecution be called', async () => {
    renderComponent()

    const button = await screen.findByText('Conditional Execution button')
    await userEvent.click(button as HTMLElement)

    expect(pipelineContextMockValue.getStageFromPipeline).toBeCalled()
    expect(pipelineContextMockValue.getStageFromPipeline).toBeCalledWith(
      pipelineContextMockValue.state.selectionState.selectedStageId
    )
    expect(pipelineContextMockValue.updateStage).toBeCalled()

    const conditionalExecutionHeader = screen.getByTestId('conditionalExecutionHeader')
    const multiTypeButton = within(conditionalExecutionHeader).getByRole('button')
    userEvent.click(multiTypeButton)
    const runtimeInputText = await screen.findByText('Runtime input')
    expect(runtimeInputText).toBeInTheDocument()
    userEvent.click(runtimeInputText)
    expect(pipelineContextMockValue.updateStage).toBeCalled()

    userEvent.click(multiTypeButton)
    const fixedValueText = await screen.findByText('Fixed value')
    expect(fixedValueText).toBeInTheDocument()
    userEvent.click(fixedValueText)
    expect(pipelineContextMockValue.updateStage).toBeCalled()
  })

  test('should onUpdate FailureStrategies be called', async () => {
    renderComponent()

    const button = await screen.findByText('Failure Strategy button')
    userEvent.click(button as HTMLElement)

    expect(pipelineContextMockValue.getStageFromPipeline).toBeCalled()
    expect(pipelineContextMockValue.getStageFromPipeline).toBeCalledWith(
      pipelineContextMockValue.state.selectionState.selectedStageId
    )
    expect(pipelineContextMockValue.updateStage).toBeCalled()

    const failureStrategyHeader = screen.getByTestId('failureStrategyHeader')
    const multiTypeButton = within(failureStrategyHeader).getByRole('button')
    userEvent.click(multiTypeButton)
    const runtimeInputText = await screen.findByText('Runtime input')
    expect(runtimeInputText).toBeInTheDocument()
    userEvent.click(runtimeInputText)
    expect(pipelineContextMockValue.updateStage).toBeCalled()

    userEvent.click(multiTypeButton)
    const fixedValueText = await screen.findByText('Fixed value')
    expect(fixedValueText).toBeInTheDocument()
    userEvent.click(fixedValueText)
    expect(pipelineContextMockValue.updateStage).toBeCalled()
  })

  test('should onUpdate be called with undefined stage', async () => {
    renderComponent({
      ...pipelineContextMockValue,
      getStageFromPipeline: jest.fn(() => {
        return { stage: { stage: undefined }, parent: undefined }
      }),
      state: {
        ...pipelineContextMockValue.state,
        selectionState: {
          selectedSectionId: 'ADVANCED',
          selectedStageId: 'parStage1',
          selectedStepId: undefined
        }
      }
    })

    const delegateSelectorButton = await screen.findByPlaceholderText('delegate.Delegate_Selector_placeholder')
    userEvent.click(delegateSelectorButton as HTMLElement)
    const delegateSelectorResourceElem = await screen.findByText('qa-stress-delegate')
    userEvent.click(delegateSelectorResourceElem)
    expect(pipelineContextMockValue.getStageFromPipeline).toBeCalledWith(
      pipelineContextMockValue.state.selectionState.selectedStageId
    )

    const conditionalExecutionButton = await screen.findByText('Conditional Execution button')
    userEvent.click(conditionalExecutionButton as HTMLElement)
    expect(pipelineContextMockValue.getStageFromPipeline).toBeCalledWith(
      pipelineContextMockValue.state.selectionState.selectedStageId
    )

    const failureStrategyButton = await screen.findByText('Failure Strategy button')
    userEvent.click(failureStrategyButton as HTMLElement)
    expect(pipelineContextMockValue.getStageFromPipeline).toBeCalledWith(
      pipelineContextMockValue.state.selectionState.selectedStageId
    )
  })

  test('should call submitFormsForTab when errorMap is not empty', async () => {
    jest.spyOn(useValidationErrors, 'useValidationErrors').mockReturnValue({ errorMap: new Map([['error', []]]) })
    renderComponent()

    expect(errorContextProvider.submitFormsForTab).toBeCalled()
  })
})
