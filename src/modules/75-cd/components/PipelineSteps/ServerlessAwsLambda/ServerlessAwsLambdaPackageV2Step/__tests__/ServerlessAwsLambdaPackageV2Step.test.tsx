/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  act,
  fireEvent,
  queryByAttribute,
  render,
  screen,
  waitFor,
  findByText as findElementByText,
  getByText as getElementByText
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { StringsMap } from 'stringTypes'
import { queryByNameAttribute, testConnectorRefChange } from '@common/utils/testUtils'
import { kubernetesConnectorListResponse } from '@connectors/components/ConnectorReferenceField/__tests__/mocks'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { ServerlessAwsLambdaPackageV2StepInitialValues } from '@pipeline/utils/types'
import { ServerlessAwsLambdaPackageV2Step } from '../ServerlessAwsLambdaPackageV2Step'
import { ServerlessAwsLambdaPackageV2StepFormikValues } from '../ServerlessAwsLambdaPackageV2StepEdit'

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

const doConfigureOptionsTesting = async (cogModal: HTMLElement): Promise<void> => {
  // Type regex and submit
  // check if field has desired value
  await waitFor(() => expect(getElementByText(cogModal, 'common.configureOptions.regex')).toBeInTheDocument())
  const regexRadio = getElementByText(cogModal, 'common.configureOptions.regex')
  await userEvent.click(regexRadio)
  const regexTextArea = queryByNameAttribute('regExValues', cogModal) as HTMLInputElement
  act(() => {
    fireEvent.change(regexTextArea!, { target: { value: '<+input>.includes(/test/)' } })
  })
  await waitFor(() => expect(regexTextArea.value).toBe('<+input>.includes(/test/)'))
  const cogSubmit = getElementByText(cogModal, 'submit')
  await userEvent.click(cogSubmit)
}

const existingInitialValues: ServerlessAwsLambdaPackageV2StepInitialValues = {
  identifier: 'Step_1',
  name: 'Step 1',
  spec: {
    connectorRef: 'account.Kubernetes_Connector_2',
    image: 'aws-sam-prod:latest',
    serverlessVersion: '2',
    packageCommandOptions: ['--command2', '--command3'],
    privileged: true,
    imagePullPolicy: 'Never',
    runAsUser: '5000',
    resources: {
      limits: {
        memory: '4Gi',
        cpu: '4000'
      }
    },
    envVariables: {
      key1: 'value1'
    }
  },
  timeout: '20m',
  type: StepType.ServerlessAwsLambdaPackageV2
}

const awsSamDeployRuntimeTemplate: ServerlessAwsLambdaPackageV2StepInitialValues = {
  identifier: 'Step_1',
  name: 'Step 1',
  spec: {
    connectorRef: RUNTIME_INPUT_VALUE,
    image: RUNTIME_INPUT_VALUE,
    serverlessVersion: RUNTIME_INPUT_VALUE,
    packageCommandOptions: RUNTIME_INPUT_VALUE,
    privileged: RUNTIME_INPUT_VALUE as unknown as boolean,
    imagePullPolicy: RUNTIME_INPUT_VALUE,
    runAsUser: RUNTIME_INPUT_VALUE,
    resources: {
      limits: {
        memory: RUNTIME_INPUT_VALUE,
        cpu: RUNTIME_INPUT_VALUE
      }
    },
    envVariables: {
      key1: RUNTIME_INPUT_VALUE
    }
  },
  timeout: RUNTIME_INPUT_VALUE,
  type: StepType.ServerlessAwsLambdaPackageV2
}

const onUpdate = jest.fn()
const onChange = jest.fn()

factory.registerStep(new ServerlessAwsLambdaPackageV2Step())

const getString = (str: keyof StringsMap, vars?: Record<string, any> | undefined): string => {
  return vars?.stringToAppend ? `${str}_${vars.stringToAppend}` : str
}

describe('ServerlessAwsLambdaPackageV2Step tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })

  test('it should create step with correct data', async () => {
    const ref = React.createRef<StepFormikRef<ServerlessAwsLambdaPackageV2StepFormikValues>>()
    const { container } = render(
      <TestStepWidget
        initialValues={{
          identifier: '',
          name: '',
          timeout: '10m',
          type: StepType.ServerlessAwsLambdaPackageV2,
          spec: {
            connectorRef: ''
          }
        }}
        type={StepType.ServerlessAwsLambdaPackageV2}
        onChange={onChange}
        onUpdate={onUpdate}
        stepViewType={StepViewType.Edit}
        ref={ref}
      ></TestStepWidget>
    )

    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).toBeInTheDocument()

    const nameInput = queryByNameAttribute('name', container) as HTMLInputElement
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.value).toBe('')
    fireEvent.change(nameInput, { target: { value: 'Serverless Package Step' } })
    expect(nameInput.value).toBe('Serverless Package Step')

    const timeoutInput = queryByNameAttribute('timeout', container) as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe('10m')
    fireEvent.change(timeoutInput, { target: { value: '20m' } })
    expect(timeoutInput.value).toBe('20m')

    const containerConfigurationText = screen.getByText('cd.steps.containerStepsCommon.containerConfigurationText')
    expect(containerConfigurationText).toBeInTheDocument()

    const connnectorRefInput = screen.getByTestId(/spec.connectorRef/)
    expect(connnectorRefInput).toBeInTheDocument()
    userEvent.click(connnectorRefInput)
    await testConnectorRefChange('Kubernetes Connector 2', 'Kubernetes Connector 1', '')

    const imageInput = queryByNameAttribute('spec.image', container) as HTMLInputElement
    expect(imageInput).toBeInTheDocument()
    expect(imageInput.value).toBe('')
    fireEvent.change(imageInput, { target: { value: 'aws-sam-dev:latest' } })
    expect(imageInput.value).toBe('aws-sam-dev:latest')

    const optionalConfigAccordion = screen.getByText('common.optionalConfig')
    userEvent.click(optionalConfigAccordion)

    const optionalConfigAccordionPanel = screen.getByTestId('serverless-package-optional-accordion-panel')
    await waitFor(() => expect(optionalConfigAccordionPanel).toHaveAttribute('data-open', 'true'))

    const serverlessVersionInput = queryByNameAttribute('spec.serverlessVersion', container) as HTMLInputElement
    expect(serverlessVersionInput).toBeInTheDocument()
    expect(serverlessVersionInput.value).toBe('')
    fireEvent.change(serverlessVersionInput, { target: { value: '3' } })
    expect(serverlessVersionInput.value).toBe('3')

    let packageCommandOptionsInput1 = queryByNameAttribute(
      'spec.packageCommandOptions[0].value',
      container
    ) as HTMLInputElement
    expect(packageCommandOptionsInput1).toBeInTheDocument()
    expect(packageCommandOptionsInput1.value).toBe('')
    fireEvent.change(packageCommandOptionsInput1, { target: { value: '--command1' } })
    packageCommandOptionsInput1 = queryByNameAttribute(
      'spec.packageCommandOptions[0].value',
      container
    ) as HTMLInputElement
    await waitFor(() => expect(packageCommandOptionsInput1.value).toBe('--command1'))
    const addCommandButton = screen.getByTestId('add-spec.packageCommandOptions')
    expect(addCommandButton).toBeInTheDocument()
    await userEvent.click(addCommandButton)
    const packageCommandOptionsInput2 = queryByNameAttribute(
      'spec.packageCommandOptions[1].value',
      container
    ) as HTMLInputElement
    await waitFor(() => expect(packageCommandOptionsInput2).toBeInTheDocument())
    expect(packageCommandOptionsInput2.value).toBe('')
    fireEvent.change(packageCommandOptionsInput2, { target: { value: '--command2' } })
    expect(packageCommandOptionsInput2.value).toBe('--command2')

    const privilegedCheckbox = queryByNameAttribute('spec.privileged', container) as HTMLInputElement
    expect(privilegedCheckbox).not.toBeChecked()
    await userEvent.click(privilegedCheckbox)

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(2)
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(1)

    const imagePullPolicySelect = queryByNameAttribute('spec.imagePullPolicy', container) as HTMLInputElement
    const imagePullPolicyDropdownIcon = dropdownIcons[1].parentElement
    await userEvent.click(imagePullPolicyDropdownIcon!)
    await waitFor(() => expect(portalDivs.length).toBe(2))
    const portalDiv = portalDivs[1] as HTMLElement
    const alwaysImagePullPolicy = await findElementByText(portalDiv, 'pipelineSteps.pullAlwaysLabel')
    expect(alwaysImagePullPolicy).toBeInTheDocument()
    await userEvent.click(alwaysImagePullPolicy)
    await waitFor(() => expect(imagePullPolicySelect.value).toBe('pipelineSteps.pullAlwaysLabel'))

    const runAsUserInput = queryByNameAttribute('spec.runAsUser', container) as HTMLInputElement
    expect(runAsUserInput).toBeInTheDocument()
    expect(runAsUserInput.value).toBe('')
    fireEvent.change(runAsUserInput, { target: { value: '1000' } })
    expect(runAsUserInput.value).toBe('1000')

    const memoryInput = queryByNameAttribute('spec.resources.limits.memory', container) as HTMLInputElement
    expect(memoryInput).toBeInTheDocument()
    expect(memoryInput.value).toBe('')
    fireEvent.change(memoryInput, { target: { value: '2Gi' } })
    expect(memoryInput.value).toBe('2Gi')

    const cpuInput = queryByNameAttribute('spec.resources.limits.cpu', container) as HTMLInputElement
    expect(cpuInput).toBeInTheDocument()
    expect(cpuInput.value).toBe('')
    fireEvent.change(cpuInput, { target: { value: '2000' } })
    expect(cpuInput.value).toBe('2000')

    const addEnvVariableButton = screen.getByTestId('add-spec.envVariables')
    expect(addEnvVariableButton).toBeInTheDocument()
    await userEvent.click(addEnvVariableButton)

    const envVariableKeyInput = queryByNameAttribute('spec.envVariables[0].key', container) as HTMLInputElement
    await waitFor(() => expect(envVariableKeyInput).toBeInTheDocument())
    expect(envVariableKeyInput.value).toBe('')
    fireEvent.change(envVariableKeyInput, { target: { value: 'k1' } })
    expect(envVariableKeyInput.value).toBe('k1')
    const envVariableValueInput = queryByNameAttribute('spec.envVariables[0].value', container) as HTMLInputElement
    expect(envVariableValueInput).toBeInTheDocument()
    expect(envVariableValueInput.value).toBe('')
    fireEvent.change(envVariableValueInput, { target: { value: 'v1' } })
    expect(envVariableValueInput.value).toBe('v1')

    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith({
        identifier: 'Serverless_Package_Step',
        name: 'Serverless Package Step',
        type: StepType.ServerlessAwsLambdaPackageV2,
        timeout: '20m',
        spec: {
          connectorRef: 'account.Kubernetes_Connector_2',
          image: 'aws-sam-dev:latest',
          serverlessVersion: '3',
          packageCommandOptions: ['--command1', '--command2'],
          privileged: true,
          imagePullPolicy: 'Always',
          runAsUser: '1000',
          resources: {
            limits: {
              memory: '2Gi',
              cpu: '2000'
            }
          },
          envVariables: {
            k1: 'v1'
          }
        }
      })
    )

    // submit form and verify
    act(() => {
      ref.current?.submitForm()
    })

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Serverless_Package_Step',
        name: 'Serverless Package Step',
        type: StepType.ServerlessAwsLambdaPackageV2,
        timeout: '20m',
        spec: {
          connectorRef: 'account.Kubernetes_Connector_2',
          image: 'aws-sam-dev:latest',
          serverlessVersion: '3',
          packageCommandOptions: ['--command1', '--command2'],
          privileged: true,
          imagePullPolicy: 'Always',
          runAsUser: '1000',
          resources: {
            limits: {
              memory: '2Gi',
              cpu: '2000'
            }
          },
          envVariables: {
            k1: 'v1'
          }
        }
      })
    )
  })

  test('it should display correct initial values for existing step', async () => {
    const ref = React.createRef<StepFormikRef<ServerlessAwsLambdaPackageV2StepFormikValues>>()
    const { container } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.ServerlessAwsLambdaPackageV2}
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
    expect(timeoutInput.value).toBe('20m')
    fireEvent.change(timeoutInput, { target: { value: '30m' } })
    expect(timeoutInput.value).toBe('30m')

    const containerConfigurationText = screen.getByText('cd.steps.containerStepsCommon.containerConfigurationText')
    expect(containerConfigurationText).toBeInTheDocument()

    expect(screen.getByText('Kubernetes Connector 1')).toBeInTheDocument()
    const connnectorRefInput = screen.getByTestId(/spec.connectorRef/)
    expect(connnectorRefInput).toBeInTheDocument()

    const imageInput = queryByNameAttribute('spec.image', container) as HTMLInputElement
    expect(imageInput).toBeInTheDocument()
    expect(imageInput.value).toBe('aws-sam-prod:latest')
    fireEvent.change(imageInput, { target: { value: 'aws-sam-prod2:latest' } })
    expect(imageInput.value).toBe('aws-sam-prod2:latest')

    const optionalConfigAccordion = screen.getByText('common.optionalConfig')
    userEvent.click(optionalConfigAccordion)
    const optionalConfigAccordionPanel = screen.getByTestId('serverless-package-optional-accordion-panel')
    await waitFor(() => expect(optionalConfigAccordionPanel).toHaveAttribute('data-open', 'true'))

    const serverlessVersionInput = queryByNameAttribute('spec.serverlessVersion', container) as HTMLInputElement
    await waitFor(() => expect(serverlessVersionInput).toBeInTheDocument())
    expect(serverlessVersionInput.value).toBe('2')
    fireEvent.change(serverlessVersionInput, { target: { value: '1' } })
    expect(serverlessVersionInput.value).toBe('1')

    const packageCommandOptionsInput1 = queryByNameAttribute(
      'spec.packageCommandOptions[0].value',
      container
    ) as HTMLInputElement
    expect(packageCommandOptionsInput1).toBeInTheDocument()
    expect(packageCommandOptionsInput1.value).toBe('--command2')
    fireEvent.change(packageCommandOptionsInput1, { target: { value: '--command4' } })
    expect(packageCommandOptionsInput1.value).toBe('--command4')
    const packageCommandOptionsInput2 = queryByNameAttribute(
      'spec.packageCommandOptions[1].value',
      container
    ) as HTMLInputElement
    await waitFor(() => expect(packageCommandOptionsInput2).toBeInTheDocument())
    expect(packageCommandOptionsInput2.value).toBe('--command3')
    fireEvent.change(packageCommandOptionsInput2, { target: { value: '--command5' } })
    expect(packageCommandOptionsInput2.value).toBe('--command5')
    const addCommandButton = screen.getByTestId('add-spec.packageCommandOptions')
    expect(addCommandButton).toBeInTheDocument()

    const privilegedCheckbox = queryByNameAttribute('spec.privileged', container) as HTMLInputElement
    expect(privilegedCheckbox).toBeChecked()
    await userEvent.click(privilegedCheckbox)

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(2)
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const imagePullPolicySelect = queryByNameAttribute('spec.imagePullPolicy', container) as HTMLInputElement
    expect(imagePullPolicySelect.value).toBe('pipelineSteps.pullNeverLabel')
    const imagePullPolicyDropdownIcon = dropdownIcons[1].parentElement
    await userEvent.click(imagePullPolicyDropdownIcon!)
    await waitFor(() => expect(portalDivs.length).toBe(1))
    const portalDiv = portalDivs[0] as HTMLElement
    const ifNotPresentImagePullPolicy = await findElementByText(portalDiv, 'common.ifNotPresent')
    expect(ifNotPresentImagePullPolicy).toBeInTheDocument()
    await userEvent.click(ifNotPresentImagePullPolicy)
    await waitFor(() => expect(imagePullPolicySelect.value).toBe('common.ifNotPresent'))

    const runAsUserInput = queryByNameAttribute('spec.runAsUser', container) as HTMLInputElement
    expect(runAsUserInput).toBeInTheDocument()
    expect(runAsUserInput.value).toBe('5000')
    fireEvent.change(runAsUserInput, { target: { value: '6000' } })
    expect(runAsUserInput.value).toBe('6000')

    const memoryInput = queryByNameAttribute('spec.resources.limits.memory', container) as HTMLInputElement
    expect(memoryInput).toBeInTheDocument()
    expect(memoryInput.value).toBe('4Gi')
    fireEvent.change(memoryInput, { target: { value: '5Gi' } })
    expect(memoryInput.value).toBe('5Gi')

    const cpuInput = queryByNameAttribute('spec.resources.limits.cpu', container) as HTMLInputElement
    expect(cpuInput).toBeInTheDocument()
    expect(cpuInput.value).toBe('4000')
    fireEvent.change(cpuInput, { target: { value: '5000' } })
    expect(cpuInput.value).toBe('5000')

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

    // submit form and verify
    act(() => {
      ref.current?.submitForm()
    })

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Step_1',
        name: 'Step 1 Updated',
        type: StepType.ServerlessAwsLambdaPackageV2,
        timeout: '30m',
        spec: {
          connectorRef: 'account.Kubernetes_Connector_2',
          image: 'aws-sam-prod2:latest',
          serverlessVersion: '1',
          packageCommandOptions: ['--command4', '--command5'],
          privileged: false,
          imagePullPolicy: 'IfNotPresent',
          runAsUser: '6000',
          resources: {
            limits: {
              memory: '5Gi',
              cpu: '5000'
            }
          },
          envVariables: {
            keyUpdated: 'valueUpdated'
          }
        }
      })
    )
  })

  test('it should display Runtime input as initial values for all fields in edit view', async () => {
    const ref = React.createRef<StepFormikRef<ServerlessAwsLambdaPackageV2StepFormikValues>>()
    const { container } = render(
      <TestStepWidget
        initialValues={awsSamDeployRuntimeTemplate}
        type={StepType.ServerlessAwsLambdaPackageV2}
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

    const connectorInput = queryByNameAttribute('spec.connectorRef', container) as HTMLInputElement
    expect(connectorInput.value).toBe(RUNTIME_INPUT_VALUE)
    const cogConnectorRef = document.getElementById('configureOptions_spec.connectorRef')
    await userEvent.click(cogConnectorRef!)
    await waitFor(() => expect(modals.length).toBe(1))
    const connectorRefCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(connectorRefCOGModal)

    const imageInput = queryByNameAttribute('spec.image', container) as HTMLInputElement
    expect(imageInput.value).toBe(RUNTIME_INPUT_VALUE)
    const cogImage = document.getElementById('configureOptions_spec.image')
    await userEvent.click(cogImage!)
    await waitFor(() => expect(modals.length).toBe(2))
    const imageCOGModal = modals[1] as HTMLElement
    await doConfigureOptionsTesting(imageCOGModal)

    // submit form and verify
    act(() => {
      ref.current?.submitForm()
    })

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Step_1',
        name: 'Step 1',
        spec: {
          connectorRef: '<+input>.regex(<+input>.includes(/test/))',
          image: '<+input>.regex(<+input>.includes(/test/))',
          serverlessVersion: RUNTIME_INPUT_VALUE,
          packageCommandOptions: RUNTIME_INPUT_VALUE,
          privileged: RUNTIME_INPUT_VALUE as unknown as boolean,
          imagePullPolicy: RUNTIME_INPUT_VALUE,
          runAsUser: RUNTIME_INPUT_VALUE,
          resources: {
            limits: {
              memory: RUNTIME_INPUT_VALUE,
              cpu: RUNTIME_INPUT_VALUE
            }
          },
          envVariables: {
            key1: RUNTIME_INPUT_VALUE
          }
        },
        timeout: RUNTIME_INPUT_VALUE,
        type: StepType.ServerlessAwsLambdaPackageV2
      })
    )
  })

  test('it should not call onUpdate and onChange if it not passed as a prop', async () => {
    const ref = React.createRef<StepFormikRef<ServerlessAwsLambdaPackageV2StepFormikValues>>()
    const { container } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.ServerlessAwsLambdaPackageV2}
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

    await waitFor(() => expect(onChange).not.toHaveBeenCalled())

    // submit form and verify
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
        type={StepType.ServerlessAwsLambdaPackageV2}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
      />
    )

    const nameInput = queryByNameAttribute('name', container)
    expect(nameInput).toBeInTheDocument()
    const timeoutInput = queryByNameAttribute('timeout', container)
    userEvent.clear(timeoutInput!)
    expect(timeoutInput).toBeInTheDocument()

    const containerConfigurationText = screen.getByText('cd.steps.containerStepsCommon.containerConfigurationText')
    expect(containerConfigurationText).toBeInTheDocument()

    const connnectorRefInput = screen.getByTestId(/spec.connectorRef/)
    expect(connnectorRefInput).toBeInTheDocument()

    act(() => {
      ref.current?.submitForm()
    })
    await waitFor(() => expect(onUpdate).not.toHaveBeenCalled())

    expect(getByText('pipelineSteps.stepNameRequired')).toBeInTheDocument()
    expect(getByText('validation.timeout10SecMinimum')).toBeInTheDocument()
    expect(getByText('common.validation.fieldIsRequired')).toBeInTheDocument()
  })

  test('it should show errors for required fields when stepViewType is DeploymentForm', async () => {
    const { container, getByText } = render(
      <TestStepWidget
        testWrapperProps={{ defaultFeatureFlagValues: { NG_SVC_ENV_REDESIGN: false } }}
        initialValues={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: '',
          spec: {
            connectorRef: ''
          },
          type: StepType.ServerlessAwsLambdaPackageV2
        }}
        template={awsSamDeployRuntimeTemplate}
        type={StepType.ServerlessAwsLambdaPackageV2}
        stepViewType={StepViewType.DeploymentForm}
        onUpdate={onUpdate}
        onChange={onChange}
      />
    )

    const submitBtn = getByText('Submit')
    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeVisible()

    await userEvent.click(submitBtn)
    expect(onUpdate).not.toHaveBeenCalled()

    await waitFor(() => expect(getByText('validation.timeout10SecMinimum')).toBeInTheDocument())
    expect(getByText('common.validation.fieldIsRequired')).toBeInTheDocument()
  })

  test('it should show errors for required fields when stepViewType is TriggerForm', async () => {
    const initialValues = {
      identifier: 'Step_1',
      name: 'Step 1',
      timeout: '',
      spec: {
        connectorRef: '',
        stackName: ''
      },
      type: StepType.AwsSamBuild
    }

    const step = new ServerlessAwsLambdaPackageV2Step()

    step.renderStep({
      initialValues,
      inputSetData: {
        template: awsSamDeployRuntimeTemplate,
        path: ''
      },
      factory,
      allowableTypes: [],
      path: ''
    })

    const errors = step.validateInputSet({
      data: initialValues,
      template: awsSamDeployRuntimeTemplate,
      getString,
      viewType: StepViewType.TriggerForm
    })

    expect(errors.timeout).toBe('validation.timeout10SecMinimum')
    expect(errors.spec?.connectorRef).toBe('common.validation.fieldIsRequired')
  })

  test('Variables view renders fine', async () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.ServerlessAwsLambdaPackageV2}
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
                fqn: 'pipeline.stages.qaStage.execution.steps.ServerlessAwsLambdaPackageV2.name',
                localName: 'step.ServerlessAwsLambdaPackageV2.name'
              }
            },
            '20m': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.ServerlessAwsLambdaPackageV2.timeout',
                localName: 'step.ServerlessAwsLambdaPackageV2.timeout'
              }
            }
          }
        }}
      />
    )

    expect(getByText('name')).toBeVisible()
    expect(getByText('timeout')).toBeVisible()
    expect(getByText('Step 1')).toBeVisible()
    expect(getByText('20m')).toBeVisible()
  })
})
