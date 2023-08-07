/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { Form, Formik } from 'formik'
import userEvent from '@testing-library/user-event'
import { render, waitFor, within, fireEvent } from '@testing-library/react'
import { TestWrapper, findPopoverContainer } from '@common/utils/testUtils'
import * as pipelineNg from 'services/pipeline-ng'
import { StoreType } from '@common/constants/GitSyncTypes'
import { gitConfigs, sourceCodeManagers } from '@platform/connectors/mocks/mock'
import { connectorListResponse } from '@platform/connectors/components/ConnectorConfigureOptions/__tests__/mocks'
import PipelineInputPanel from '../PipelineInputPanel'

jest.mock('services/pipeline-ng', () => ({
  useGetTemplateFromPipeline: jest.fn(() => ({
    mutate: jest.fn()
  })),
  useCreateVariablesV2: jest.fn(() => ({
    mutate: jest.fn(() => Promise.resolve({ data: { yaml: '' } }))
  })),
  useGetMergeInputSetFromPipelineTemplateWithListInput: jest.fn(() => ({
    mutate: jest.fn(() =>
      Promise.resolve({
        data: {
          pipelineYaml:
            'pipeline:\n  identifier: Pipeline_for_Pipeline_Input_Panel_UT\n  stages:\n    - stage:\n        identifier: S1\n        type: Custom\n        spec:\n          execution:\n            steps:\n              - step:\n                  identifier: ShellScript_1\n                  type: ShellScript\n                  timeout: 5m\n'
        }
      })
    )
  })),
  useGetInputSetsListForPipeline: jest.fn(() => ({
    refetch: jest.fn(),
    data: {
      data: {
        content: [
          {
            identifier: 'Input_Set_1',
            name: 'Input Set 1'
          }
        ]
      }
    }
  }))
}))

jest.mock('services/cd-ng', () => ({
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: jest.fn() }
  }),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorListResponse.data.content[1], refetch: jest.fn(), loading: false }
  })
}))

jest.mock('services/cd-ng-rq', () => ({
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

const TestComponent = ({
  initialValues,
  storeType = StoreType.INLINE,
  submitForm
}: {
  initialValues: any
  storeType?: StoreType
  submitForm?: (values: any) => void
}): ReactElement => {
  return (
    <TestWrapper queryParams={{ storeType }}>
      <Formik
        initialValues={initialValues}
        onSubmit={values => {
          submitForm && submitForm(values)
        }}
      >
        {formikProps => (
          <Form>
            <PipelineInputPanel formikProps={formikProps} isEdit={true}></PipelineInputPanel>
            <button type="submit" data-testid="submit">
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </TestWrapper>
  )
}

const testInitialValue = {
  triggerType: 'Scheduled',
  pipeline: {
    identifier: 'Pipeline_for_Pipeline_Input_Panel_UT',
    stages: [
      {
        stage: {
          identifier: 'S1',
          type: 'Custom',
          spec: {
            execution: {
              steps: [
                {
                  step: {
                    identifier: 'ShellScript_1',
                    type: 'ShellScript',
                    timeout: ''
                  }
                }
              ]
            }
          }
        }
      }
    ]
  },
  resolvedPipeline: {
    name: 'Pipeline for Pipeline Input Panel UT',
    identifier: 'Pipeline_for_Pipeline_Input_Panel_UT',
    projectIdentifier: 'Pankaj',
    orgIdentifier: 'default',
    tags: {},
    stages: [
      {
        stage: {
          name: 'S1',
          identifier: 'S1',
          description: '',
          type: 'Custom',
          spec: {
            execution: {
              steps: [
                {
                  step: {
                    type: 'ShellScript',
                    name: 'ShellScript_1',
                    identifier: 'ShellScript_1',
                    spec: {
                      shell: 'Bash',
                      onDelegate: true,
                      source: {
                        type: 'Inline',
                        spec: {
                          script: 'echo Hello World'
                        }
                      },
                      environmentVariables: [],
                      outputVariables: []
                    },
                    timeout: '<+input>'
                  }
                }
              ]
            }
          },
          tags: {}
        }
      }
    ]
  }
}

const useGetTemplateFromPipelineMockData = {
  mutate: () => ({
    status: 'SUCCESS',
    data: {
      inputSetTemplateYaml:
        'pipeline:\n  identifier: Pipeline_for_Pipeline_Input_Panel_UT\n  stages:\n    - stage:\n        identifier: S1\n        type: Custom\n        spec:\n          execution:\n            steps:\n              - step:\n                  identifier: ShellScript_1\n                  type: ShellScript\n                  timeout: <+input>\n',
      modules: ['pms'],
      hasInputSets: true
    }
  }),
  loading: false
}

describe('PipelineInputPanel', () => {
  test('Show loading while useGetTemplateFromPipeline API data loading', async () => {
    jest.spyOn(pipelineNg, 'useGetTemplateFromPipeline').mockReturnValue({ loading: true } as any)
    const { getByTestId, findByText } = render(
      <TestComponent
        initialValues={{
          triggerType: 'Artifact'
        }}
      />
    )

    await findByText('Loading, please wait...')

    expect(getByTestId('page-spinner')).toBeInTheDocument()
  })

  test('Show No Pipeline Input for inline Pipeline if there is no pipeline input', async () => {
    jest.spyOn(pipelineNg, 'useGetTemplateFromPipeline').mockReturnValue({ loading: false, data: { data: {} } } as any)
    const { getByText, findByText } = render(
      <TestComponent
        initialValues={{
          triggerType: 'Artifact'
        }}
      />
    )

    await findByText('triggers.pipelineInputLabel')

    expect(getByText('pipeline.pipelineInputPanel.noRuntimeInputs')).toBeInTheDocument()
  })

  test('Webhook Trigger: Show only Pipeline Branch Name field for remote Pipeline if there is no pipeline input', async () => {
    jest.spyOn(pipelineNg, 'useGetTemplateFromPipeline').mockReturnValue({ loading: false, data: { data: {} } } as any)
    const { queryByText, findByText, getByPlaceholderText } = render(
      <TestComponent
        initialValues={{
          triggerType: 'Webhook'
        }}
        storeType={StoreType.REMOTE}
      />
    )

    await findByText('triggers.pipelineReferenceBranch')

    expect(getByPlaceholderText('<+trigger.branch>')).toBeInTheDocument()
    expect(queryByText('triggers.pipelineInputLabel')).toBeNull()
    expect(queryByText('pipeline.pipelineInputPanel.noRuntimeInputs')).toBeNull()
  })

  test('Non Webhook Trigger: Show only Pipeline Branch Name field for remote Pipeline if there is no pipeline input', async () => {
    jest.spyOn(pipelineNg, 'useGetTemplateFromPipeline').mockReturnValue({ loading: false, data: { data: {} } } as any)
    const { queryByText, findByText, getByPlaceholderText } = render(
      <TestComponent
        initialValues={{
          triggerType: 'Artifact'
        }}
        storeType={StoreType.REMOTE}
      />
    )

    await findByText('triggers.pipelineReferenceBranch')

    expect(getByPlaceholderText('common.branchName')).toBeInTheDocument()
    expect(queryByText('triggers.pipelineInputLabel')).toBeNull()
    expect(queryByText('pipeline.pipelineInputPanel.noRuntimeInputs')).toBeNull()
  })

  test('Pipeline Input for Inline Pipeline', async () => {
    jest.spyOn(pipelineNg, 'useGetTemplateFromPipeline').mockReturnValue(useGetTemplateFromPipelineMockData as any)
    const mockedSubmitForm = jest.fn()
    const { getByText, findByText, container, getByTestId } = render(
      <TestComponent initialValues={testInitialValue} submitForm={mockedSubmitForm} />
    )

    await findByText('triggers.pipelineInputLabel')

    expect(getByText('triggers.toast.payloadInfoBar')).toBeInTheDocument()
    expect(getByText('learnMore')).toBeInTheDocument()
    expect(getByText('pipeline.inputSets.selectPlaceholder')).toBeInTheDocument()
    expect(getByText(/Stage: S1/)).toBeInTheDocument()
    expect(getByText('executionText')).toBeInTheDocument()
    expect(getByText(/pipeline.execution.stepTitlePrefix/)).toBeInTheDocument()
    expect(getByText(/pipeline.stepLabel/)).toBeInTheDocument()
    expect(getByText('pipelineSteps.timeoutLabel')).toBeInTheDocument()

    const timeoutInputElement = container.querySelector(
      'input[name="pipeline.stages[0].stage.spec.execution.steps[0].step.timeout"]'
    )

    expect(timeoutInputElement).not.toBeDisabled()

    // Select Input Set
    userEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))

    const inputModalElem = await waitFor(() => {
      const inputModal = findPopoverContainer()
      expect(inputModal).toBeInTheDocument()

      return inputModal!
    })

    expect(within(inputModalElem).getByText('pipeline.inputSets.overlayISHelperText')).toBeInTheDocument()

    userEvent.click(within(inputModalElem).getByText(/Input Set 1/))

    await waitFor(() => {
      expect(within(inputModalElem).getByText('pipeline.inputSets.applyInputSet').parentElement).not.toBeDisabled()
    })

    userEvent.click(within(inputModalElem).getByText('pipeline.inputSets.applyInputSet'))

    await waitFor(() => {
      expect(getByText('Input Set 1')).toBeInTheDocument()
    })

    await waitFor(() => {
      const timeoutInput = container.querySelector(
        'input[name="pipeline.stages[0].stage.spec.execution.steps[0].step.timeout"]'
      )
      expect(timeoutInput).toBeDisabled()
      expect(timeoutInput).toHaveValue('5m')
    })

    fireEvent.click(getByTestId('submit'))

    await waitFor(() => {
      expect(mockedSubmitForm).toHaveBeenCalledWith(expect.objectContaining({ inputSetRefs: ['Input_Set_1'] }))
    })
  })

  test('Pipeline Input for Remote Pipeline', async () => {
    jest.spyOn(pipelineNg, 'useGetTemplateFromPipeline').mockReturnValue(useGetTemplateFromPipelineMockData as any)
    const mockedSubmitForm = jest.fn()
    const { getByText, findByText, container, getByTestId, queryByText } = render(
      <TestComponent storeType={StoreType.REMOTE} initialValues={testInitialValue} submitForm={mockedSubmitForm} />
    )

    await findByText('triggers.pipelineInputLabel')

    expect(getByText('triggers.toast.payloadInfoBar')).toBeInTheDocument()
    expect(getByText('learnMore')).toBeInTheDocument()
    expect(getByText('pipeline.inputSets.createNewInputSet')).toBeInTheDocument()
    expect(getByText('pipeline.inputSets.selectPlaceholder')).toBeInTheDocument()
    expect(getByText('triggers.pipelineReferenceBranch')).toBeInTheDocument()

    expect(queryByText(/Stage: S1/)).toBeNull()
    expect(queryByText('executionText')).toBeNull()
    expect(queryByText(/pipeline.execution.stepTitlePrefix/)).toBeNull()
    expect(queryByText(/pipeline.stepLabel/)).toBeNull()
    expect(queryByText('pipelineSteps.timeoutLabel')).toBeNull()

    const timeoutInputElement = container.querySelector(
      'input[name="pipeline.stages[0].stage.spec.execution.steps[0].step.timeout"]'
    )

    expect(timeoutInputElement).toBeNull()

    fireEvent.change(container.querySelector('input[name="pipelineBranchName"]')!, { target: { value: 'main-patch' } })

    // Select Input Set
    userEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))

    const inputModalElem = await waitFor(() => {
      const inputModal = findPopoverContainer()
      expect(inputModal).toBeInTheDocument()

      return inputModal!
    })

    expect(within(inputModalElem).getByText('pipeline.inputSets.overlayISHelperText')).toBeInTheDocument()

    userEvent.click(within(inputModalElem).getByText(/Input Set 1/))

    await waitFor(() => {
      expect(within(inputModalElem).getByText('pipeline.inputSets.applyInputSet').parentElement).not.toBeDisabled()
    })

    userEvent.click(within(inputModalElem).getByText('pipeline.inputSets.applyInputSet'))

    await waitFor(() => {
      expect(getByText('Input Set 1')).toBeInTheDocument()
    })

    await waitFor(() => {
      const timeoutInput = container.querySelector(
        'input[name="pipeline.stages[0].stage.spec.execution.steps[0].step.timeout"]'
      )
      expect(timeoutInput).toBeDisabled()
      expect(timeoutInput).toHaveValue('5m')
      expect(getByText(/Stage: S1/)).toBeInTheDocument()
      expect(getByText('executionText')).toBeInTheDocument()
      expect(getByText(/pipeline.execution.stepTitlePrefix/)).toBeInTheDocument()
      expect(getByText(/pipeline.stepLabel/)).toBeInTheDocument()
      expect(getByText('pipelineSteps.timeoutLabel')).toBeInTheDocument()
    })

    fireEvent.click(getByTestId('submit'))

    await waitFor(() => {
      expect(mockedSubmitForm).toHaveBeenCalledWith(
        expect.objectContaining({ inputSetRefs: ['Input_Set_1'], pipelineBranchName: 'main-patch' })
      )
    })
  })
})
