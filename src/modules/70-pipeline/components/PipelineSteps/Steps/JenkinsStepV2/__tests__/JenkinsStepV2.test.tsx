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
import { JenkinsStepV2 } from '../JenkinsStepV2'
import {
  getJenkinsStepV2lEditModePropsWithValues,
  mockConnectorResponse,
  mockJobResponse,
  mockJobParamterResponse,
  getJenkinsStepV2TemplateUsageViewProps,
  getJenkinsStepV2DeploymentModePropsWithTimeoutAndPollingRuntime,
  getJenkinsStepV2DeploymentModePropsWithConnectorRefRuntime,
  getJenkinsStepV2DeploymentModePropsWithJobNameRuntime
} from './JenkinsStepV2TestHelper'
import { JenkinsStepV2DeploymentModeProps, JenkinsStepV2StepModeProps } from '../JenkinsStepsV2.types'

jest.mock('services/cd-ng', () => ({
  useGetConnector: () => mockConnectorResponse,
  useGetJobDetailsForJenkins: () => mockJobResponse,
  useGetJobParametersForJenkins: () => mockJobParamterResponse
}))

factory.registerStep(new JenkinsStepV2())

describe('Jenkins step tests', () => {
  test('Open a saved jenkins step - edit stage view', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getJenkinsStepV2lEditModePropsWithValues() as JenkinsStepV2StepModeProps
    const { container, getByText, queryByDisplayValue } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.JenkinsBuildV2}
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
      type: StepType.JenkinsBuildV2,
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

  test('Open template input form - validate timeout and polling frequency for min value if both are RUNTIME', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getJenkinsStepV2DeploymentModePropsWithTimeoutAndPollingRuntime() as JenkinsStepV2DeploymentModeProps
    const { container, getByText, queryByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={props.inputSetData}
        template={props.inputSetData?.template}
        type={StepType.JenkinsBuildV2}
        ref={ref}
      />
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    // both validation fails
    act(() => {
      fireEvent.click(getByText('Submit'))
    })
    await waitFor(() => {
      expect(queryByText('Value must be greater than or equal to "10s"')).toBeInTheDocument()
      expect(queryByText('Value must be greater than or equal to "5s"')).toBeInTheDocument()
    })

    // timeout is greater than min value but polling frequency is less than min value
    fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '15s' } })
    act(() => {
      fireEvent.click(getByText('Submit'))
    })
    await waitFor(() => {
      expect(queryByText('Value must be greater than or equal to "10s"')).not.toBeInTheDocument()
      expect(queryByText('Value must be greater than or equal to "5s"')).toBeInTheDocument()
    })

    // both timeout and polling freq is greater than min value
    fireEvent.change(queryByNameAttribute('spec.consoleLogPollFrequency')!, { target: { value: '10s' } })
    act(() => {
      fireEvent.click(getByText('Submit'))
    })
    await waitFor(() => {
      expect(queryByText('Value must be greater than or equal to "10s"')).not.toBeInTheDocument()
      expect(queryByText('Value must be greater than or equal to "5s"')).not.toBeInTheDocument()
    })

    // both timeout and polling freq is greater than min value but polling freq > timeout
    fireEvent.change(queryByNameAttribute('spec.consoleLogPollFrequency')!, { target: { value: '20s' } })
    act(() => {
      fireEvent.click(getByText('Submit'))
    })
    await waitFor(() => {
      expect(getByText('pipeline.jiraApprovalStep.validations.retryIntervalExceedingTimeout')).toBeInTheDocument()
    })
  })

  test('Open template input form - validate connector ref if RUNTIME', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getJenkinsStepV2DeploymentModePropsWithConnectorRefRuntime() as JenkinsStepV2DeploymentModeProps
    const { getByText, queryByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={props.inputSetData}
        template={props.inputSetData?.template}
        type={StepType.JenkinsBuildV2}
        ref={ref}
      />
    )
    act(() => {
      fireEvent.click(getByText('Submit'))
    })
    await waitFor(() => {
      expect(queryByText('common.validation.connectorRef')).toBeInTheDocument()
    })
  })

  test('Open template input form - validate job name if RUNTIME', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getJenkinsStepV2DeploymentModePropsWithJobNameRuntime() as JenkinsStepV2DeploymentModeProps
    const { getByText, queryByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={props.inputSetData}
        template={props.inputSetData?.template}
        type={StepType.JenkinsBuildV2}
        ref={ref}
      />
    )

    act(() => {
      fireEvent.click(getByText('Submit'))
    })
    await waitFor(() => {
      expect(queryByText('pipeline.jenkinsStep.validations.jobName')).toBeInTheDocument()
    })
  })

  test('Open template input form - validate without template', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getJenkinsStepV2DeploymentModePropsWithJobNameRuntime() as JenkinsStepV2DeploymentModeProps
    const { getByText, queryByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={props.inputSetData}
        type={StepType.JenkinsBuildV2}
        ref={ref}
      />
    )

    act(() => {
      fireEvent.click(getByText('Submit'))
    })

    await waitFor(() => {
      expect(queryByText('{}')).toBeInTheDocument()
    })
  })

  test('it should render all fields as Runtime input in TemplateUsage view if they are marked as Runtime input in template', async () => {
    const onSubmitFnMock = jest.fn()
    const props = getJenkinsStepV2TemplateUsageViewProps() as JenkinsStepV2DeploymentModeProps
    const { container } = render(
      <Formik formName="testJenkinsTemplateUsage" initialValues={props.initialValues} onSubmit={onSubmitFnMock}>
        {() => {
          return (
            <TestStepWidget
              initialValues={props.initialValues}
              type={StepType.JenkinsBuildV2}
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
