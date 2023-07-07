/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, screen, findByRole, getByRole, within, RenderResult, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, projectPathProps } from '@common/utils/routeUtils'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import * as PipelineVariablesContext from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import {
  errorContextProvider,
  getDummyPipelineContextValue,
  getMockFor_useGetPipeline,
  getModuleParams
} from './PipelineStageHelper'
import { PipelineStageOutputSection } from '../PipelineStageOutputSection/PipelineStageOutputSection'
import { VariableOutputPanel } from '../PipelineStageOutputSection/VariableOutputPanel'
import variablesPipeline from './variablesPipeline.json'
import metadataMap from './metadataMap.json'

jest.mock('services/pipeline-ng', () => ({
  useCreateVariablesV2: jest.fn(() => ({
    mutate: jest.fn(() =>
      Promise.resolve({
        data: {
          yaml: yamlStringify({ pipeline: variablesPipeline }),
          metadataMap
        }
      })
    ),
    loading: false,
    cancel: jest.fn()
  })),
  useGetPipeline: jest.fn(() => getMockFor_useGetPipeline())
}))

jest.mock('@harness/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))

jest.mock('@common/components/MonacoEditor/MonacoEditor')
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as Record<string, any>),
  debounce: jest.fn(fn => {
    fn.cancel = jest.fn()
    return fn
  }),
  noop: jest.fn()
}))

jest.useFakeTimers({ advanceTimers: true })
jest.mock('resize-observer-polyfill', () => {
  class ResizeObserver {
    static default = ResizeObserver
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    observe() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    unobserve() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    disconnect() {
      // do nothing
    }
  }
  return ResizeObserver
})

jest.spyOn(PipelineVariablesContext, 'usePipelineVariables').mockImplementation((): any => {
  return {
    variablesPipeline: { pipeline: variablesPipeline },
    metadataMap
  }
})

const renderOutputSectionComponent = (value?: PipelineContextInterface): RenderResult => {
  const pipelineContextMockValue = getDummyPipelineContextValue()
  const pipelineContextValue = value ?? pipelineContextMockValue

  return render(
    <TestWrapper path={TEST_PATH} pathParams={getModuleParams('chainedPipeline', 'cd')}>
      <PipelineContext.Provider value={pipelineContextValue}>
        <StageErrorContext.Provider value={errorContextProvider}>
          <PipelineStageOutputSection />
        </StageErrorContext.Provider>
      </PipelineContext.Provider>
    </TestWrapper>
  )
}

const TEST_PATH = routes.toPipelines({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })

describe('PipelineStageOutputSection Test', () => {
  test('Empty Output view', async () => {
    const { container } = renderOutputSectionComponent()
    expect(await screen.findByText('pipeline.pipelineChaining.pipelineOutputs')).toBeDefined()
    expect(screen.queryByTestId('output-row-0')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot('PipelineStageOutputSection - No Output')
  })

  test('Filled Outputs view', async () => {
    const pipelineContextMockValue = getDummyPipelineContextValue()
    renderOutputSectionComponent({
      ...pipelineContextMockValue,
      state: {
        ...pipelineContextMockValue.state,
        selectionState: {
          selectedSectionId: 'OUTPUTS',
          selectedStageId: 'parStage2',
          selectedStepId: undefined
        }
      },
      getStageFromPipeline: jest.fn(() => {
        return { stage: pipelineContextMockValue.state.pipeline.stages?.[1], parent: undefined }
      })
    } as any)

    expect(await screen.findByText('pipeline.pipelineChaining.pipelineOutputs')).toBeDefined()

    // Configure Option Test
    const configureButton = screen.getByRole('button', {
      name: /cog/i
    })
    await userEvent.click(configureButton)
    const configureOptionsDialog = findDialogContainer() as HTMLElement
    expect(
      await findByRole(configureOptionsDialog, 'heading', {
        name: 'common.configureOptions.configureOptions'
      })
    )
    userEvent.type(getByRole(configureOptionsDialog, 'textbox'), '12')
    userEvent.click(
      getByRole(configureOptionsDialog, 'button', {
        name: /submit/i
      })
    )

    // Delete button test
    const deleteOutputButton = await screen.findByTestId('delete-output-2')
    await userEvent.click(deleteOutputButton)
    expect(screen.queryByTestId('output-row-2')).not.toBeInTheDocument()

    // Add Output button test
    const newOutputAddButton = screen.getByRole('button', {
      name: 'pipeline.pipelineChaining.newOutput'
    })
    userEvent.click(newOutputAddButton)
    const thirdOutputRow = await screen.findByTestId('output-row-2')
    expect(thirdOutputRow).toBeInTheDocument()

    // Check Onchange - multi type button
    const multiTypeButton = within(thirdOutputRow).getByTestId('multi-type-button')
    userEvent.click(multiTypeButton)
    const runtimeInputText = await screen.findByText('Runtime input')
    expect(runtimeInputText).toBeInTheDocument()
    userEvent.click(runtimeInputText)
    expect(await within(thirdOutputRow).findByPlaceholderText(RUNTIME_INPUT_VALUE)).toBeInTheDocument()
  })

  test('validate duplicate outputs name', async () => {
    const pipelineContextMockValue = getDummyPipelineContextValue()
    const formikRef = React.createRef<FormikProps<unknown>>()

    render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams('chainedPipeline', 'cd')}>
        <PipelineContext.Provider value={pipelineContextMockValue}>
          <StageErrorContext.Provider value={errorContextProvider}>
            <VariableOutputPanel formikRef={formikRef} />
          </StageErrorContext.Provider>
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Add Outputs
    const newOutputAddButton = screen.getByRole('button', {
      name: 'pipeline.pipelineChaining.newOutput'
    })
    await userEvent.click(newOutputAddButton)
    const firstOutputRow = await screen.findByTestId('output-row-0')
    const firstOutputNameInput = await within(firstOutputRow).findByPlaceholderText(
      'pipeline.pipelineChaining.enterOutputName'
    )
    await userEvent.type(firstOutputNameInput, 'output1')

    await userEvent.click(newOutputAddButton)
    const secondOutputRow = await screen.findByTestId('output-row-1')
    const secondOutputNameInput = await within(secondOutputRow).findByPlaceholderText(
      'pipeline.pipelineChaining.enterOutputName'
    )
    await userEvent.type(secondOutputNameInput, 'output1')
    act(() => {
      formikRef.current?.submitForm()
    })
    expect(await screen.findAllByText('pipeline.pipelineChaining.outputAlreadyExists')).toHaveLength(2)
    expect(formikRef.current?.errors).toEqual({
      outputs: [
        {
          name: 'pipeline.pipelineChaining.outputAlreadyExists',
          value: 'common.validation.valueIsRequired'
        },
        {
          name: 'pipeline.pipelineChaining.outputAlreadyExists',
          value: 'common.validation.valueIsRequired'
        }
      ]
    })

    userEvent.clear(secondOutputNameInput)
    userEvent.type(secondOutputNameInput, 'output2')
    await waitFor(() =>
      expect(
        within(firstOutputRow).queryByText('pipeline.pipelineChaining.outputAlreadyExists')
      ).not.toBeInTheDocument()
    )
  })

  test('Readonly view', async () => {
    const pipelineContextMockValue = getDummyPipelineContextValue()
    renderOutputSectionComponent({
      ...pipelineContextMockValue,
      state: {
        ...pipelineContextMockValue.state,
        selectionState: {
          selectedSectionId: 'OUTPUTS',
          selectedStageId: 'parStage2',
          selectedStepId: undefined
        }
      },
      getStageFromPipeline: jest.fn(() => {
        return { stage: pipelineContextMockValue.state.pipeline.stages?.[1], parent: undefined }
      }),
      isReadonly: true
    } as any)

    expect(await screen.findByDisplayValue('<+pipeline.name>')).toHaveAttribute('disabled')
    expect(screen.queryByTestId('delete-output-0')).not.toBeInTheDocument()
  })

  test('Render correct fqn and local name of chained pipeline outputs', async () => {
    const pipelineContextMockValue = getDummyPipelineContextValue()
    renderOutputSectionComponent({
      ...pipelineContextMockValue,
      state: {
        ...pipelineContextMockValue.state,
        selectionState: {
          selectedSectionId: 'OUTPUTS',
          selectedStageId: 'parStage2',
          selectedStepId: undefined
        }
      },
      getStageFromPipeline: jest.fn(() => {
        return { stage: variablesPipeline.stages?.[1], parent: undefined }
      })
    } as any)

    expect(await screen.findByText('pipeline.pipelineChaining.pipelineOutputs')).toBeDefined()
    const firstOutputRow = await screen.findByTestId('output-row-0')
    const localFQNCopyButton = firstOutputRow.querySelector('span[data-icon="copy-alt"]')
    await userEvent.click(localFQNCopyButton as HTMLElement)

    const usedWithinStageText = await screen.findByText('common.usedWithinStage')
    expect(usedWithinStageText).toBeInTheDocument()
    const localName = screen.getByText('stages.parStage2.output.output1')
    const fqn = screen.getByText('pipeline.stages.parStage2.output.output1')
    expect(localName).toBeInTheDocument()
    expect(fqn).toBeInTheDocument()
  })
})
