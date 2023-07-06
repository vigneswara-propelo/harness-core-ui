/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Form, Formik } from 'formik'
import { act, getByText, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper, findPopoverContainer } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { triggerPathProps } from '@common/utils/routeUtils'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { response } from '@triggers/pages/triggers/__tests__/webhookMockResponses'

import StageSelection from '../StageSelection'

const PATH = routes.toTriggersWizardPage(triggerPathProps)
const PATH_PARAMS = {
  pipelineIdentifier: 'stage1',
  accountId: 'accountId',
  orgIdentifier: 'CV',
  projectIdentifier: 'default',
  module: 'cd'
}

const commonQueryParams = {
  triggerType: 'Webhook',
  sourceRepo: 'Github'
}

const TestComponent: React.FC<{
  initialValues: any
  onSubmit: (values: any) => void
  queryParams?: GitQueryParams
  triggerIdentifier?: string
}> = ({ initialValues, onSubmit, queryParams, triggerIdentifier = 'testTrigger' }) => {
  return (
    <TestWrapper
      path={PATH}
      pathParams={{ ...PATH_PARAMS, triggerIdentifier }}
      queryParams={{ ...commonQueryParams, ...(queryParams ? queryParams : {}) }}
    >
      <Formik initialValues={initialValues} onSubmit={values => onSubmit(values)}>
        {formikProps => (
          <Form>
            <StageSelection formikProps={formikProps} />
            <button type="submit" data-testid="submit">
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </TestWrapper>
  )
}

const testId = 'stage-select'
const getStagesExecutionListData = response.data.data

jest.mock('services/pipeline-ng', () => ({
  useGetStagesExecutionList: jest.fn().mockReturnValue({
    data: {
      data: response.data.data
    }
  }),
  useGetMergeInputSetFromPipelineTemplateWithListInput: jest.fn().mockReturnValue({
    data: {
      data: {
        pipelineYaml:
          'pipeline:\n  identifier: Remote\n  stages:\n    - stage:\n        identifier: S1\n        type: Custom\n        spec:\n          execution:\n            steps:\n              - step:\n                  identifier: ShellScript_1\n                  type: ShellScript\n                  timeout: ""\n',
        completePipelineYaml: '',
        errorResponse: false
      }
    }
  })
}))

describe('StageSelection', () => {
  test('Select Stages button should be disabled if allowStageExecutions: false', () => {
    const pipeline: PipelineInfoConfig = {
      name: 'testPipeline',
      identifier: 'testPipeline',
      allowStageExecutions: false
    }
    const initialValues = {
      stagesToExecute: [],
      resolvedPipeline: pipeline,
      originalPipeline: pipeline,
      inputSetRefs: [],
      pipeline
    }
    const onSubmit = jest.fn()

    const { getByTestId } = render(
      <TestComponent onSubmit={onSubmit} initialValues={initialValues} triggerIdentifier="new" />
    )
    // Testing for the this as the element is disabled via the pointer-event: none using the css class name.
    expect(getByTestId(testId).parentElement?.parentElement?.classList.contains('MultiSelectDropDown--disabled')).toBe(
      true
    )
    // expect(mockUseGetStagesExecutionList).not.toHaveBeenCalled()
  })

  test('User is able to select the stages', async () => {
    const pipeline: PipelineInfoConfig = {
      name: 'testPipeline',
      identifier: 'testPipeline',
      allowStageExecutions: true
    }
    const initialValues = {
      stagesToExecute: [],
      resolvedPipeline: pipeline,
      originalPipeline: pipeline,
      inputSetRefs: ['InputSet1', 'InputSet2'],
      pipeline
    }
    const onSubmit = jest.fn()

    const { getByTestId } = render(<TestComponent onSubmit={onSubmit} initialValues={initialValues} />)
    const selectStagesButton = getByTestId(testId)

    await userEvent.click(selectStagesButton)
    const popoverContainer = findPopoverContainer()
    expect(popoverContainer).toBeInTheDocument()
    expect(popoverContainer?.querySelectorAll('label.bp3-checkbox')).toHaveLength(getStagesExecutionListData.length + 1)

    await userEvent.click(getByText(popoverContainer!, 'S2'))

    await userEvent.click(getByText(popoverContainer!, 'S3'))
    const submitButton = getByTestId('submit')

    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          stagesToExecute: ['S2', 'S3']
        })
      )
    })

    getStagesExecutionListData.forEach(stage => {
      act(() => {
        userEvent.click(getByText(popoverContainer!, stage.stageIdentifier))
      })
    })

    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          stagesToExecute: ['S2', 'S3']
        })
      )
    })
  })
  test('All stages selected', async () => {
    const pipeline: PipelineInfoConfig = {
      name: 'testPipeline',
      identifier: 'testPipeline',
      allowStageExecutions: true
    }
    const initialValues = {
      stagesToExecute: [],
      resolvedPipeline: pipeline,
      originalPipeline: pipeline,
      inputSetRefs: [],
      pipeline
    }
    const onSubmit = jest.fn()

    const { getByTestId } = render(<TestComponent onSubmit={onSubmit} initialValues={initialValues} />)
    const selectStagesButton = getByTestId(testId)
    await userEvent.click(selectStagesButton)

    const popoverContainer = findPopoverContainer()
    expect(popoverContainer).toBeInTheDocument()
    expect(popoverContainer?.querySelectorAll('label.bp3-checkbox')).toHaveLength(getStagesExecutionListData.length + 1)
    await userEvent.click(getByText(popoverContainer!, 'S1'))

    await userEvent.click(getByText(popoverContainer!, 'S2'))

    await userEvent.click(getByText(popoverContainer!, 'S3'))
    await userEvent.click(getByText(popoverContainer!, 'S4'))

    const submitButton = getByTestId('submit')

    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          stagesToExecute: []
        })
      )
    })
  })

  test('Pre Selected Stages', async () => {
    const pipeline: PipelineInfoConfig = {
      name: 'testPipeline',
      identifier: 'testPipeline',
      allowStageExecutions: true
    }
    const initialValues = {
      stagesToExecute: ['S2', 'S3'],
      resolvedPipeline: pipeline,
      originalPipeline: pipeline,
      inputSetRefs: ['InputSet1', 'InputSet2'],
      pipeline
    }
    const onSubmit = jest.fn()

    const { getByTestId } = render(<TestComponent onSubmit={onSubmit} initialValues={initialValues} />)
    const selectStagesButton = getByTestId(testId)
    await userEvent.click(selectStagesButton)

    const popoverContainer = findPopoverContainer()
    expect(popoverContainer).toBeInTheDocument()
    expect(popoverContainer?.querySelectorAll('label.bp3-checkbox')).toHaveLength(getStagesExecutionListData.length + 1)

    expect(getByText(popoverContainer!, 'S2').firstChild as HTMLInputElement).toBeChecked()
    expect(getByText(popoverContainer!, 'S3').firstChild as HTMLInputElement).toBeChecked()
  })
})
