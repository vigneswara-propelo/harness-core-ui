/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  render,
  fireEvent,
  act,
  waitFor,
  queryByAttribute,
  getByText as getByTextGlobal,
  findAllByText
} from '@testing-library/react'
import { set } from 'lodash-es'
import produce from 'immer'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'

import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import pipelineContextMock from '@pipeline/components/PipelineStudio/RightDrawer/__tests__/stateMock'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import type { AdvancedStepsProps } from '@pipeline/components/PipelineSteps/AdvancedSteps/AdvancedSteps'

import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import {
  getTemplateContextMock,
  stepGroupTemplateMock
} from '@templates-library/components/TemplateStudio/__tests__/stateMock'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { StepGroupTemplateFormWithRef } from '../StepGroupTemplateForm'

jest.mock('@pipeline/components/PipelineSteps/AdvancedSteps/AdvancedSteps', () => ({
  ...(jest.requireActual('@pipeline/components/PipelineSteps/AdvancedSteps/AdvancedSteps') as any),
  AdvancedStepsWithRef: React.forwardRef(({ onChange }: AdvancedStepsProps, _ref: StepFormikFowardRef) => {
    return (
      <div className="step-group-advancedstep-mock">
        <button
          onClick={() => {
            onChange?.({ when: { stageStatus: 'All' }, delegateSelectors: ['test1'] })
          }}
        >
          onChange Button
        </button>
        <button
          onClick={() => {
            onChange?.({ when: { stageStatus: 'All' }, delegateSelectors: ['test3'] })
          }}
        >
          onChange no tab
        </button>
      </div>
    )
  })
}))

jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as Record<string, any>),
  debounce: jest.fn(fn => {
    fn.cancel = jest.fn()
    return fn
  })
}))

const pipelineContext = produce(pipelineContextMock, draft => {
  set(draft, 'contextType', 'Template')
})

describe('<StepGroupTemplateForm /> tests', () => {
  beforeEach(() => jest.clearAllMocks())
  const stepGroupTemplateContextMock = getTemplateContextMock(TemplateType.StepGroup)

  test('should call renderPipelineStage with correct arguments', async () => {
    const { container, getByText, findByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContext}>
          <TemplateContext.Provider value={stepGroupTemplateContextMock}>
            <StepGroupTemplateFormWithRef />
          </TemplateContext.Provider>
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const changeButton = getByText('onChange Button')
    fireEvent.click(changeButton as HTMLElement)
    expect(container).toBeDefined()
    expect(stepGroupTemplateContextMock.updateTemplate).toBeCalledWith({
      ...stepGroupTemplateMock,
      spec: {
        ...stepGroupTemplateMock.spec,
        when: { stageStatus: 'All' },
        delegateSelectors: ['test1']
      }
    })
    const changeButtonNoTab = getByText('onChange no tab')
    fireEvent.click(changeButtonNoTab as HTMLElement)
    expect(stepGroupTemplateContextMock.updateTemplate).toBeCalledWith({
      ...stepGroupTemplateMock
    })
    const advancedTab = document.body.querySelector('[class*="bp3-tab-list"] [data-tab-id="Advanced"]') as Element
    expect(advancedTab).toBeInTheDocument()
    fireEvent.click(advancedTab)
    expect(() => getByText('common.variables')).toBeDefined()

    // Addition of new variable flow
    const add = await findByText('platform.variables.newVariable')
    act(() => {
      fireEvent.click(add)
    })
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => findAllByText(dialog, 'platform.variables.newVariable'))
    const nameField = queryByAttribute('name', dialog, 'name')
    const valueField = queryByAttribute('name', dialog, 'value')
    fireEvent.change(nameField!, { target: { value: 'stringNewVariable' } })
    fireEvent.change(valueField!, { target: { value: 'stringNewVariableValue' } })
    const submitBtn = getByTextGlobal(dialog, 'save')
    fireEvent.click(submitBtn!)
    // Validate new variable
    expect(container.querySelector('input[name="variables[0].name"]')).toHaveValue('stringNewVariable')
    expect(container.querySelector('input[name="variables[0].value"]')).toHaveValue('stringNewVariableValue')
  })
})
