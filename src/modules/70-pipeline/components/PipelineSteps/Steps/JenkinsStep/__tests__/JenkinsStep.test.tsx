/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, queryByAttribute, waitFor } from '@testing-library/react'
import { Formik, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { TestStepWidget, factory } from '../../__tests__/StepTestUtil'
import { JenkinsStep } from '../JenkinsStep'
import {
  getJenkinsStepEditModeProps,
  getJenkinsStepEditModePropsWithConnectorId,
  getJenkinsSteplEditModePropsWithValues,
  getJenkinsStepDeploymentModeProps,
  mockConnectorResponse,
  mockJobResponse,
  mockJobParamterResponse,
  getJenkinsStepInputVariableModeProps,
  getJenkinsStepTemplateUsageViewProps
} from './JenkinsStepTestHelper'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  useGetConnector: () => mockConnectorResponse,
  useGetJobDetailsForJenkins: () => mockJobResponse,
  useGetJobParametersForJenkins: () => mockJobParamterResponse
}))
describe('Jira Approval fetch projects', () => {
  beforeEach(() => {
    factory.registerStep(new JenkinsStep())
  })
  test('show error if failed to fetch projects', () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getJenkinsStepEditModePropsWithConnectorId()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JenkinsBuild}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )
    expect(container).toMatchSnapshot()
  })
})

describe('Jenkins step tests', () => {
  beforeEach(() => {
    factory.registerStep(new JenkinsStep())
  })

  test('Basic snapshot - inputset mode', async () => {
    const props = getJenkinsStepDeploymentModeProps()
    const { container, getByText, queryByText } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.JenkinsBuild}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )

    fireEvent.click(getByText('Submit'))
    await waitFor(() => queryByText('Errors'))
    expect(container).toMatchSnapshot()
  })

  test('Basic snapshot - deploymentform mode', async () => {
    const props = getJenkinsStepDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.JenkinsBuild}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={props.inputSetData}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('deploymentform mode - readonly', async () => {
    const props = getJenkinsStepDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.JenkinsBuild}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={{ ...props.inputSetData, path: props.inputSetData?.path || '', readonly: true }}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('Basic snapshot - inputset mode but no runtime values', async () => {
    const props = getJenkinsStepDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JenkinsBuild}
        template={props.inputSetData?.template}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('Basic snapshot - input variable view', () => {
    const props = getJenkinsStepInputVariableModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JenkinsBuild}
        stepViewType={StepViewType.InputVariable}
        customStepProps={props.customStepProps}
      />
    )

    expect(container).toMatchSnapshot('jira-approval-input variable view')
  })

  test('Basic functions - edit stage view validations', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getJenkinsStepEditModeProps()
    const { container, queryByText, getByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JenkinsBuild}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    // Submit with empty form
    await act(() => ref.current?.submitForm()!)
    expect(queryByText('pipelineSteps.stepNameRequired')).toBeTruthy()

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'jenkins step' } })

    act(() => {
      fireEvent.click(getByText('pipelineSteps.timeoutLabel'))
    })
    fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '' } })

    await act(() => ref.current?.submitForm()!)
    expect(queryByText('validation.timeout10SecMinimum')).toBeTruthy()

    await act(() => ref.current?.submitForm()!)

    await waitFor(() => {
      expect(queryByText('pipeline.jenkinsStep.validations.jobName')).toBeTruthy()
    })
  })

  test('Edit stage - readonly', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getJenkinsStepEditModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JenkinsBuild}
        stepViewType={StepViewType.Edit}
        ref={ref}
        readonly={true}
      />
    )

    expect(container).toMatchSnapshot('edit stage view readonly')
  })

  test('Open a saved jenkins step - edit stage view', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getJenkinsSteplEditModePropsWithValues()
    const { container, getByText, queryByDisplayValue } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JenkinsBuild}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={props.onUpdate}
      />
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'jenkins step' } })
    expect(queryByDisplayValue('10m')).toBeTruthy()

    expect(queryByDisplayValue('<+input>')).toBeTruthy()
    expect(queryByDisplayValue('x')).toBeTruthy()

    expect(queryByDisplayValue('10')).toBeTruthy()

    expect(getByText('pipeline.jenkinsStep.unstableStatusAsSuccess')).toBeTruthy()

    await act(() => ref.current?.submitForm()!)
    expect(props.onUpdate).toBeCalledWith({
      identifier: 'jenkins_step',
      timeout: '10m',
      type: StepType.JenkinsBuild,
      spec: {
        connectorRef: 'cid1',
        consoleLogPollFrequency: '5s',
        jobParameter: [
          {
            name: 'x',
            type: 'String',
            value: '10',
            id: 'f842f927-2ce7-41f5-8753-24f153eb3663'
          }
        ],
        delegateSelectors: [],
        unstableStatusAsSuccess: false,
        useConnectorUrlForJobExecution: false,
        jobName: '<+input>'
      },
      name: 'jenkins step'
    })
  })

  test('Minimum time cannot be less than 10s', () => {
    const response = new JenkinsStep().validateInputSet({
      data: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '1s',
        type: StepType.JenkinsBuild,
        spec: {
          connectorRef: '',
          jobName: '',
          jobParameter: [],
          delegateSelectors: []
        }
      },
      template: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '<+input>',
        type: StepType.JenkinsBuild,
        spec: {
          connectorRef: '',
          jobName: '',
          jobParameter: [],
          delegateSelectors: []
        }
      },
      viewType: StepViewType.TriggerForm
    })
    expect(response).toMatchSnapshot('Value must be greater than or equal to "10s"')
  })

  test('Minimum polling time cannot be less than 5s', () => {
    const response = new JenkinsStep().validateInputSet({
      data: {
        name: 'Test A',
        identifier: 'Test A',
        type: StepType.JenkinsBuild,
        spec: {
          connectorRef: '',
          jobName: '',
          jobParameter: [],
          delegateSelectors: [],
          consoleLogPollFrequency: '1s'
        }
      },
      template: {
        name: 'Test A',
        identifier: 'Test A',
        type: StepType.JenkinsBuild,
        spec: {
          connectorRef: '',
          jobName: '',
          jobParameter: [],
          delegateSelectors: [],
          consoleLogPollFrequency: '<+input>'
        }
      },
      getString: str => str,
      viewType: StepViewType.TriggerForm
    })
    expect(response.spec?.consoleLogPollFrequency).toBe('Value must be greater than or equal to "5s"')
  })

  test('Runtime Polling and Fixed Timeout: polling time must be greater than timeout', () => {
    const inputData = {
      data: {
        name: 'Test A',
        identifier: 'Test A',
        type: StepType.JenkinsBuild,
        spec: {
          connectorRef: '',
          jobName: '',
          jobParameter: [],
          delegateSelectors: [],
          consoleLogPollFrequency: '15s'
        }
      },
      template: {
        name: 'Test A',
        identifier: 'Test A',
        type: StepType.JenkinsBuild,
        spec: {
          connectorRef: '',
          jobName: '',
          jobParameter: [],
          delegateSelectors: [],
          consoleLogPollFrequency: '<+input>'
        }
      },
      getString: (str: string) => str,
      viewType: StepViewType.TriggerForm,
      allValues: {
        name: 'Test A',
        identifier: 'Test A',
        type: StepType.JenkinsBuild,
        timeout: '10s',
        spec: {
          connectorRef: '',
          jobName: '',
          jobParameter: [],
          delegateSelectors: []
        }
      }
    }
    const errorResponse = new JenkinsStep().validateInputSet(inputData)
    expect(errorResponse.spec?.consoleLogPollFrequency).toBe(
      'pipeline.jenkinsStep.validations.pollingFrequencyExceedingTimeout'
    )
    inputData.data.spec.consoleLogPollFrequency = '6s'
    const successResponse = new JenkinsStep().validateInputSet(inputData)
    expect(successResponse.spec?.consoleLogPollFrequency).toBeUndefined()
  })

  test('Fixed Polling and Runtime Timeout: polling time must be greater than timeout', () => {
    const inputData = {
      data: {
        name: 'Test A',
        identifier: 'Test A',
        type: StepType.JenkinsBuild,
        timeout: '10s',
        spec: {
          connectorRef: '',
          jobName: '',
          jobParameter: [],
          delegateSelectors: []
        }
      },
      template: {
        name: 'Test A',
        identifier: 'Test A',
        type: StepType.JenkinsBuild,
        timeout: '<+input>',
        spec: {
          connectorRef: '',
          jobName: '',
          jobParameter: [],
          delegateSelectors: []
        }
      },
      getString: (str: string) => str,
      viewType: StepViewType.TriggerForm,
      allValues: {
        name: 'Test A',
        identifier: 'Test A',
        type: StepType.JenkinsBuild,
        spec: {
          connectorRef: '',
          jobName: '',
          jobParameter: [],
          delegateSelectors: [],
          consoleLogPollFrequency: '15s'
        }
      }
    }
    const errorResponse = new JenkinsStep().validateInputSet(inputData)
    expect(errorResponse.timeout).toBe('pipeline.jenkinsStep.validations.timeoutLessThanPollingFrequency')
    inputData.data.timeout = '20s'
    const successResponse = new JenkinsStep().validateInputSet(inputData)
    expect(successResponse.timeout).toBeUndefined()
  })

  test('Fixed Polling and Runtime Timeout: polling time must be greater than timeout', () => {
    const inputData = {
      data: {
        name: 'Test A',
        identifier: 'Test A',
        type: StepType.JenkinsBuild,
        timeout: '10s',
        spec: {
          connectorRef: '',
          jobName: '',
          jobParameter: [],
          delegateSelectors: [],
          consoleLogPollFrequency: '15s'
        }
      },
      template: {
        name: 'Test A',
        identifier: 'Test A',
        type: StepType.JenkinsBuild,
        timeout: '<+input>',
        spec: {
          connectorRef: '',
          jobName: '',
          jobParameter: [],
          delegateSelectors: [],
          consoleLogPollFrequency: '<+input>'
        }
      },
      getString: (str: string) => str,
      viewType: StepViewType.TriggerForm
    }
    const errorResponse = new JenkinsStep().validateInputSet(inputData)
    expect(errorResponse.spec?.consoleLogPollFrequency).toBe(
      'pipeline.jenkinsStep.validations.pollingFrequencyExceedingTimeout'
    )
    inputData.data.timeout = '20s'
    const successResponse = new JenkinsStep().validateInputSet(inputData)
    expect(successResponse.spec?.consoleLogPollFrequency).toBeUndefined()
  })

  test('it should render all fields as Runtime input in TemplateUsage view if they are marked as Runtime input in template', async () => {
    const onSubmitFnMock = jest.fn()
    const props = getJenkinsStepTemplateUsageViewProps()
    const { container } = render(
      <Formik formName="testJenkinsTemplateUsage" initialValues={props.initialValues} onSubmit={onSubmitFnMock}>
        {() => {
          return (
            <TestStepWidget
              initialValues={props.initialValues}
              type={StepType.JenkinsBuild}
              stepViewType={StepViewType.TemplateUsage}
              template={props.inputSetData?.template}
            />
          )
        }}
      </Formik>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const connectorRefInput = queryByNameAttribute('spec.connectorRef') as HTMLInputElement
    expect(connectorRefInput).toBeInTheDocument()
    expect(connectorRefInput.value).toBe(RUNTIME_INPUT_VALUE)

    const jobNameInput = queryByNameAttribute('spec.jobName') as HTMLInputElement
    expect(jobNameInput).toBeInTheDocument()
    expect(jobNameInput.value).toBe(RUNTIME_INPUT_VALUE)

    const jobParameterInput = queryByNameAttribute('spec.jobParameter') as HTMLInputElement
    expect(jobParameterInput).toBeInTheDocument()
    expect(jobParameterInput.value).toBe(RUNTIME_INPUT_VALUE)
  })
})
