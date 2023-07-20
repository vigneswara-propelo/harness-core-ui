/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { TestWrapper } from '@common/utils/testUtils'
import { StepGroupTemplateDiagram } from '@templates-library/components/TemplateStudio/StepGroupTemplateCanvas/StepGroupTemplateDiagram/StepGroupTemplateDiagram'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { ExecutionGraphProp } from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { getTemplateContextMock } from '@templates-library/components/TemplateStudio/__tests__/stateMock'
import { NodeMetadataProvider } from '@pipeline/components/PipelineDiagram/Nodes/NodeMetadataContext'
import { StepGroupEventMock, EditEventMock } from './mock'

const stepGroupTemplateContextMock = getTemplateContextMock(TemplateType.StepGroup)

jest.mock('@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph', () => {
  // eslint-disable-next-line react/display-name
  return (props: ExecutionGraphProp<any>) => {
    const { onAddStep, onEditStep } = props
    const { setSelection } = usePipelineContext()
    return (
      <div className="step-group-template-executiongraph-mock">
        <button
          onClick={() => {
            onAddStep(StepGroupEventMock)
            setSelection({ stageId: 'stage_name', stepId: 'step_id', sectionId: undefined })
          }}
        >
          Add Step
        </button>
        <button
          onClick={() => {
            onEditStep(EditEventMock as any)
          }}
        >
          Edit Step
        </button>
      </div>
    )
  }
})

describe('<StepGroupTemplateDiagram /> ', () => {
  test('should work on add step', async () => {
    const { getByText } = render(
      <TestWrapper>
        <TemplateContext.Provider value={stepGroupTemplateContextMock}>
          <NodeMetadataProvider>
            <StepGroupTemplateDiagram />
          </NodeMetadataProvider>
        </TemplateContext.Provider>
      </TestWrapper>
    )
    const addStepButton = getByText('Add Step')
    fireEvent.click(addStepButton)
    const editStepButton = getByText('Edit Step')
    fireEvent.click(editStepButton)
    expect(stepGroupTemplateContextMock.updateTemplate).not.toHaveBeenCalled()
  })
})
