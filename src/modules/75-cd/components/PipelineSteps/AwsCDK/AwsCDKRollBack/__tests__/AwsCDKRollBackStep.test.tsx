/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { queryByNameAttribute, doConfigureOptionsTesting } from '@common/utils/testUtils'
import { kubernetesConnectorListResponse } from '@platform/connectors/components/ConnectorReferenceField/__tests__/mocks'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { AwsCDKRollBackStepInitialValues } from '@pipeline/utils/types'
import { AwsCDKRollBackStep } from '../AwsCDKRollBackStep'
import { AwsCDKRollBackStepFormikValues } from '../AwsCDKRollBackStepEdit'

const fetchConnector = jest.fn().mockReturnValue({ data: kubernetesConnectorListResponse?.data?.content?.[0] })
jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: jest.fn().mockImplementation(() => Promise.resolve(kubernetesConnectorListResponse)),
  useGetConnector: jest.fn().mockImplementation(() => {
    return {
      data: { data: kubernetesConnectorListResponse?.data?.content?.[0] },
      refetch: fetchConnector,
      loading: false
    }
  })
}))

const existingInitialValues: AwsCDKRollBackStepInitialValues = {
  identifier: 'Step_1',
  name: 'Step 1',
  spec: {
    provisionerIdentifier: 'prov1',
    envVariables: {
      key1: 'value1'
    }
  },
  timeout: '10m',
  type: StepType.AwsCdkRollback
}

const awsCdkRollBackRuntimeTemplate: AwsCDKRollBackStepInitialValues = {
  identifier: 'Step_1',
  name: 'Step 1',
  spec: {
    provisionerIdentifier: RUNTIME_INPUT_VALUE,
    envVariables: {
      key1: RUNTIME_INPUT_VALUE
    }
  },
  timeout: RUNTIME_INPUT_VALUE,
  type: StepType.AwsCdkRollback
}

const onUpdate = jest.fn()
const onChange = jest.fn()

factory.registerStep(new AwsCDKRollBackStep())

describe('AwsCdkRollBackStep tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })

  test('it should display correct initial values for existing step', async () => {
    const ref = React.createRef<StepFormikRef<AwsCDKRollBackStepFormikValues>>()
    const { container } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.AwsCdkRollback}
        onChange={onChange}
        onUpdate={onUpdate}
        isNewStep={false}
        stepViewType={StepViewType.Edit}
        ref={ref}
      ></TestStepWidget>
    )

    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).not.toBeInTheDocument()

    const nameInput = queryByNameAttribute('name', container) as HTMLInputElement
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.value).toBe('Step 1')
    fireEvent.change(nameInput, { target: { value: 'Step 1 Updated' } })
    expect(nameInput.value).toBe('Step 1 Updated')

    const timeoutInput = queryByNameAttribute('timeout', container) as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe('10m')
    fireEvent.change(timeoutInput, { target: { value: '30m' } })
    expect(timeoutInput.value).toBe('30m')

    const provisionerInput = queryByNameAttribute('spec.provisionerIdentifier', container) as HTMLInputElement
    expect(provisionerInput).toBeInTheDocument()
    expect(provisionerInput.value).toBe('prov1')
    fireEvent.change(provisionerInput, { target: { value: 'prov2' } })
    expect(provisionerInput.value).toBe('prov2')

    const optionalConfigAccordion = screen.getByText('common.optionalConfig')
    userEvent.click(optionalConfigAccordion)
    const optionalConfigAccordionPanel = screen.getByTestId('aws-cdk-roll-back-optional-accordion-panel')
    await waitFor(() => expect(optionalConfigAccordionPanel).toHaveAttribute('data-open', 'true'))

    const addEnvVariableButton = screen.getByTestId('add-spec.envVariables')
    expect(addEnvVariableButton).toBeInTheDocument()
    const envVariableKeyInput = queryByNameAttribute('spec.envVariables[0].key', container) as HTMLInputElement
    await waitFor(() => expect(envVariableKeyInput).toBeInTheDocument())
    expect(envVariableKeyInput.value).toBe('key1')
    fireEvent.change(envVariableKeyInput, { target: { value: 'keyUpdated' } })
    expect(envVariableKeyInput.value).toBe('keyUpdated')
    const envVariableValueInput = queryByNameAttribute('spec.envVariables[0].value', container) as HTMLInputElement
    expect(envVariableValueInput).toBeInTheDocument()
    expect(envVariableValueInput.value).toBe('value1')
    fireEvent.change(envVariableValueInput, { target: { value: 'valueUpdated' } })
    expect(envVariableValueInput.value).toBe('valueUpdated')

    act(() => {
      ref.current?.submitForm()
    })

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Step_1',
        name: 'Step 1 Updated',
        type: StepType.AwsCdkRollback,
        spec: {
          provisionerIdentifier: 'prov2',
          envVariables: {
            keyUpdated: 'valueUpdated'
          }
        },
        timeout: '30m'
      })
    )
  })

  test('it should display Runtime input as initial values for all fields in edit view', async () => {
    const ref = React.createRef<StepFormikRef<AwsCDKRollBackStep>>()
    const { container } = render(
      <TestStepWidget
        initialValues={awsCdkRollBackRuntimeTemplate}
        type={StepType.AwsCdkRollback}
        onChange={onChange}
        onUpdate={onUpdate}
        isNewStep={false}
        stepViewType={StepViewType.Edit}
        ref={ref}
      ></TestStepWidget>
    )

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).not.toBeInTheDocument()

    const nameInput = queryByNameAttribute('name', container) as HTMLInputElement
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.value).toBe('Step 1')

    const timeoutInput = queryByNameAttribute('timeout', container) as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe(RUNTIME_INPUT_VALUE)

    const provisionerInput = queryByNameAttribute('spec.provisionerIdentifier', container) as HTMLInputElement
    expect(provisionerInput.value).toBe(RUNTIME_INPUT_VALUE)
    const provisionerRef = document.getElementById('configureOptions_spec.provisionerIdentifier')
    await userEvent.click(provisionerRef!)
    await waitFor(() => expect(modals.length).toBe(1))
    const provisionerRefCOG = modals[0] as HTMLElement
    await doConfigureOptionsTesting(provisionerRefCOG, provisionerInput)

    act(() => {
      ref.current?.submitForm()
    })

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Step_1',
        name: 'Step 1',
        spec: {
          provisionerIdentifier: '<+input>.regex(<+input>.includes(/test/))',

          envVariables: {
            key1: RUNTIME_INPUT_VALUE
          }
        },
        timeout: RUNTIME_INPUT_VALUE,
        type: StepType.AwsCdkRollback
      })
    )
  })

  test('it should not call onUpdate and onChange if it not passed as a prop', async () => {
    const ref = React.createRef<StepFormikRef<AwsCDKRollBackStepFormikValues>>()
    const { container } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.AwsCdkRollback}
        isNewStep={false}
        stepViewType={StepViewType.Edit}
        ref={ref}
      ></TestStepWidget>
    )

    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).not.toBeInTheDocument()

    const provInput = queryByNameAttribute('spec.provisionerIdentifier', container) as HTMLInputElement
    expect(provInput).toBeInTheDocument()
    expect(provInput.value).toBe('prov1')
    fireEvent.change(provInput, { target: { value: 'prov1Updated' } })
    expect(provInput.value).toBe('prov1Updated')

    await waitFor(() => expect(onChange).not.toHaveBeenCalled())

    act(() => {
      ref.current?.submitForm()
    })

    await waitFor(() => expect(onUpdate).not.toHaveBeenCalled())
  })

  test('it should show validation errors for required fields in edit view', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.AwsCdkRollback}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
      />
    )

    const provInput = queryByNameAttribute('spec.provisionerIdentifier', container)
    userEvent.clear(provInput!)
    expect(provInput).toBeInTheDocument()

    act(() => {
      ref.current?.submitForm()
    })
    await waitFor(() => expect(onUpdate).not.toHaveBeenCalled())
    expect(getByText('common.validation.provisionerIdentifierIsRequired')).toBeInTheDocument()
  })

  test('it should show errors for required fields when stepViewType is DeploymentForm', async () => {
    const { container, getByText, getAllByText } = render(
      <TestStepWidget
        testWrapperProps={{ defaultFeatureFlagValues: { NG_SVC_ENV_REDESIGN: false } }}
        initialValues={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: '',
          spec: {
            provisionerIdentifier: ''
          },
          type: StepType.AwsCdkRollback
        }}
        template={awsCdkRollBackRuntimeTemplate}
        type={StepType.AwsCdkRollback}
        stepViewType={StepViewType.DeploymentForm}
        onUpdate={onUpdate}
        onChange={onChange}
      />
    )

    const submitBtn = getByText('Submit')
    const provisionerInput = queryByNameAttribute('spec.provisionerIdentifier', container)
    expect(provisionerInput).toBeVisible()

    await userEvent.click(submitBtn)
    expect(onUpdate).not.toHaveBeenCalled()

    expect(getAllByText('common.validation.fieldIsRequired')).toHaveLength(1)
  })

  test('Variables view renders fine', async () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.AwsCdkRollback}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'qaStage',
          variablesData: existingInitialValues,
          metadataMap: {
            'Step 1': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.AwsCdkRollback.name',
                localName: 'step.AwsCdkRollback.name'
              }
            }
          }
        }}
      />
    )

    expect(getByText('Step 1')).toBeVisible()
  })
})
