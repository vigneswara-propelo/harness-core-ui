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
import { queryByNameAttribute } from '@common/utils/testUtils'
import { kubernetesConnectorListResponse } from '@platform/connectors/components/ConnectorReferenceField/__tests__/mocks'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { AwsCDKDiffStepInitialValues } from '@pipeline/utils/types'
import { AwsCDKDiffStep } from '../AwsCDKDiffStep'
import { AwsCDKCommonStepFormikValues } from '../../AwsCDKCommonFields'

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

const existingInitialValues: AwsCDKDiffStepInitialValues = {
  identifier: 'Step_1',
  name: 'Step 1',
  spec: {
    connectorRef: 'account.Kubernetes_Connector_2',
    image: 'aws-cdk-diff-prod:latest',
    commandOptions: ['--command2', '--command3'],
    stackNames: ['--stack1', '--stack2'],
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
  type: StepType.AwsCdkDiff
}

const awsCdkDiffRuntimeTemplate: AwsCDKDiffStepInitialValues = {
  identifier: 'Step_1',
  name: 'Step 1',
  spec: {
    connectorRef: RUNTIME_INPUT_VALUE,
    image: RUNTIME_INPUT_VALUE,
    commandOptions: RUNTIME_INPUT_VALUE,
    privileged: RUNTIME_INPUT_VALUE as unknown as boolean,
    imagePullPolicy: RUNTIME_INPUT_VALUE,
    runAsUser: RUNTIME_INPUT_VALUE,
    stackNames: RUNTIME_INPUT_VALUE,
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
  type: StepType.AwsCdkDiff
}

const onUpdate = jest.fn()
const onChange = jest.fn()

factory.registerStep(new AwsCDKDiffStep())

const getString = (str: keyof StringsMap, vars?: Record<string, any> | undefined): string => {
  return vars?.stringToAppend ? `${str}_${vars.stringToAppend}` : str
}

describe('AwsCdkDiffStep tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })

  test('it should display correct initial values for existing step', async () => {
    const ref = React.createRef<StepFormikRef<AwsCDKCommonStepFormikValues>>()
    const { container } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.AwsCdkDiff}
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
    expect(imageInput.value).toBe('aws-cdk-diff-prod:latest')
    fireEvent.change(imageInput, { target: { value: 'aws-cdk-diff-prod2:latest' } })
    expect(imageInput.value).toBe('aws-cdk-diff-prod2:latest')

    const optionalConfigAccordion = screen.getByText('common.optionalConfig')
    userEvent.click(optionalConfigAccordion)
    const optionalConfigAccordionPanel = screen.getByTestId('aws-cdk-diff-optional-accordion-panel')
    await waitFor(() => expect(optionalConfigAccordionPanel).toHaveAttribute('data-open', 'true'))

    const commandOptionsInput1 = queryByNameAttribute('spec.commandOptions[0].value', container) as HTMLInputElement
    expect(commandOptionsInput1).toBeInTheDocument()
    expect(commandOptionsInput1.value).toBe('--command2')
    fireEvent.change(commandOptionsInput1, { target: { value: '--command4' } })
    expect(commandOptionsInput1.value).toBe('--command4')
    const commandOptionsInput2 = queryByNameAttribute('spec.commandOptions[1].value', container) as HTMLInputElement
    await waitFor(() => expect(commandOptionsInput2).toBeInTheDocument())
    expect(commandOptionsInput2.value).toBe('--command3')
    fireEvent.change(commandOptionsInput2, { target: { value: '--command5' } })
    expect(commandOptionsInput2.value).toBe('--command5')
    const addCommandButton = screen.getByTestId('add-spec.commandOptions')
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

    act(() => {
      ref.current?.submitForm()
    })

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Step_1',
        name: 'Step 1 Updated',
        type: StepType.AwsCdkDiff,
        timeout: '30m',
        spec: {
          connectorRef: 'account.Kubernetes_Connector_2',
          image: 'aws-cdk-diff-prod2:latest',
          commandOptions: ['--command4', '--command5'],
          stackNames: ['--stack1', '--stack2'],
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
    const ref = React.createRef<StepFormikRef<AwsCDKCommonStepFormikValues>>()
    const { container } = render(
      <TestStepWidget
        initialValues={awsCdkDiffRuntimeTemplate}
        type={StepType.AwsCdkDiff}
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
    const connectorRefCOG = modals[0] as HTMLElement
    await doConfigureOptionsTesting(connectorRefCOG)

    act(() => {
      ref.current?.submitForm()
    })

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Step_1',
        name: 'Step 1',
        spec: {
          connectorRef: '<+input>.regex(<+input>.includes(/test/))',
          image: RUNTIME_INPUT_VALUE,
          commandOptions: RUNTIME_INPUT_VALUE,
          privileged: RUNTIME_INPUT_VALUE as unknown as boolean,
          imagePullPolicy: RUNTIME_INPUT_VALUE,
          runAsUser: RUNTIME_INPUT_VALUE,
          stackNames: RUNTIME_INPUT_VALUE,
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
        type: StepType.AwsCdkDiff
      })
    )
  })

  test('it should not call onUpdate and onChange if it not passed as a prop', async () => {
    const ref = React.createRef<StepFormikRef<AwsCDKCommonStepFormikValues>>()
    const { container } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.AwsCdkDiff}
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

    act(() => {
      ref.current?.submitForm()
    })

    await waitFor(() => expect(onUpdate).not.toHaveBeenCalled())
  })

  test('it should show validation errors for required fields in edit view', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText, getAllByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.AwsCdkDiff}
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
    expect(getAllByText('common.validation.fieldIsRequired')).toHaveLength(1)
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
            connectorRef: ''
          },
          type: StepType.AwsCdkDiff
        }}
        template={awsCdkDiffRuntimeTemplate}
        type={StepType.AwsCdkDiff}
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
    expect(getAllByText('common.validation.fieldIsRequired')).toHaveLength(2)
  })

  test('it should show errors for required fields when stepViewType is TriggerForm', async () => {
    const initialValues = {
      identifier: 'Step_1',
      name: 'Step 1',
      timeout: '',
      spec: {
        connectorRef: ''
      },
      type: StepType.AwsCdkDiff
    }

    const step = new AwsCDKDiffStep()

    step.renderStep({
      initialValues,
      inputSetData: {
        template: awsCdkDiffRuntimeTemplate,
        path: ''
      },
      factory,
      allowableTypes: [],
      path: ''
    })

    const errors = await step.validateInputSet({
      data: initialValues,
      template: awsCdkDiffRuntimeTemplate,
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
        type={StepType.AwsCdkDiff}
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
                fqn: 'pipeline.stages.qaStage.execution.steps.AwsCdkDiff.name',
                localName: 'step.AwsCdkDiff.name'
              }
            },
            '20m': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.AwsCdkDiff.timeout',
                localName: 'step.AwsCdkDiff.timeout'
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
