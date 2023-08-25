/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikProps } from 'formik'
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  findByText as findElementByText,
  getByText as getElementByText,
  RenderResult
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button, FormikForm, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import routes from '@common/RouteDefinitions'
import { TestWrapper, queryByNameAttribute } from '@common/utils/testUtils'
import { modulePathProps, pipelinePathProps, projectPathProps } from '@common/utils/routeUtils'
import { kubernetesConnectorListResponse } from '@connectors/components/ConnectorReferenceField/__tests__/mocks'
import { StepFormikFowardRef, StepFormikRef, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { AwsCdkCommonStepFormikValues, AwsCdkCommonOptionalFieldsEdit } from '../AwsCDKCommonFields'

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
    fireEvent.change(regexTextArea, { target: { value: '<+input>.includes(/test/)' } })
  })
  await waitFor(() => expect(regexTextArea.value).toBe('<+input>.includes(/test/)'))

  const cogSubmit = getElementByText(cogModal, 'submit')
  await userEvent.click(cogSubmit)
}

const existingInitialValues: AwsCdkCommonStepFormikValues = {
  identifier: 'Step_1',
  name: 'Step 1',
  spec: {
    connectorRef: 'account.Kubernetes_Connector_2',
    image: 'aws-cdk-prod:latest',
    commandOptions: [
      { id: 'command2', value: '--command2' },
      { id: 'command3', value: '--command3' }
    ],
    stackNames: [
      { id: '--stack1', value: '--stack1' },
      { id: '--stack2', value: '--stack2' }
    ],
    privileged: true,
    imagePullPolicy: 'Never',
    runAsUser: '5000',
    resources: {
      limits: {
        memory: '4Gi',
        cpu: '4000'
      }
    },
    envVariables: [
      {
        id: 'env1',
        key: 'k1',
        value: 'v1'
      }
    ]
  },
  timeout: '20m',
  type: StepType.AwsCdkDiff
}

const awsCDKCommonRuntimeTemplate: AwsCdkCommonStepFormikValues = {
  identifier: 'Step_1',
  name: 'Step 1',
  spec: {
    connectorRef: RUNTIME_INPUT_VALUE,
    image: RUNTIME_INPUT_VALUE,
    commandOptions: RUNTIME_INPUT_VALUE,
    stackNames: RUNTIME_INPUT_VALUE,
    privileged: RUNTIME_INPUT_VALUE as unknown as boolean,
    imagePullPolicy: RUNTIME_INPUT_VALUE,
    runAsUser: RUNTIME_INPUT_VALUE,
    resources: {
      limits: {
        memory: RUNTIME_INPUT_VALUE,
        cpu: RUNTIME_INPUT_VALUE
      }
    },
    envVariables: [
      {
        id: 'env1',
        key: 'key1',
        value: RUNTIME_INPUT_VALUE
      }
    ]
  },
  timeout: RUNTIME_INPUT_VALUE,
  type: StepType.AwsCdkDiff
}

const onUpdate = jest.fn()

const PATH = routes.toPipelineStudio({ ...projectPathProps, ...modulePathProps, ...pipelinePathProps })
const PATH_PARAMS = {
  accountId: 'testAccountId',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject',
  pipelineIdentifier: 'Pipeline_1',
  module: 'cd'
}

interface ComponentProps {
  initialValues: AwsCdkCommonStepFormikValues
  readonly: boolean
  formikRef: StepFormikFowardRef<AwsCdkCommonStepFormikValues>
  onUpdateMocked: (data: AwsCdkCommonStepFormikValues) => void
  stepType?: StepType
}

const renderComponent = function (props: ComponentProps): RenderResult {
  const { initialValues, readonly, formikRef, onUpdateMocked, stepType = StepType.AwsCdkDiff } = props
  return render(
    <Formik
      initialValues={initialValues}
      onSubmit={values => {
        onUpdateMocked(values)
      }}
    >
      {(formik: FormikProps<AwsCdkCommonStepFormikValues>) => {
        setFormikRef(formikRef, formik)
        return (
          <FormikForm>
            <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
              <AwsCdkCommonOptionalFieldsEdit
                readonly={readonly}
                allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
                formik={formik}
                commandOptionsFieldName={'spec.commandOptions'}
                commandOptionsFieldLabel={'AWS CDK Diff Command Options'}
                stepType={stepType}
              />
              <Button text="Submit" type="submit" />
            </TestWrapper>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

describe('AwsCDKStepCommonOptionalFieldsEdit tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
  })

  test('it should create step with correct data', async () => {
    const ref = React.createRef<StepFormikRef<AwsCdkCommonStepFormikValues>>()
    const { container } = renderComponent({
      initialValues: {
        identifier: 'Step_1',
        name: 'Step 1',
        timeout: '20m',
        spec: {
          connectorRef: ''
        },
        type: StepType.AwsCdkDiff
      },
      readonly: false,
      formikRef: ref,
      onUpdateMocked: onUpdate
    })

    let commandOptionsInput1 = queryByNameAttribute('spec.commandOptions[0].value', container) as HTMLInputElement
    expect(commandOptionsInput1).toBeInTheDocument()
    expect(commandOptionsInput1.value).toBe('')
    fireEvent.change(commandOptionsInput1, { target: { value: '--command1' } })
    commandOptionsInput1 = queryByNameAttribute('spec.commandOptions[0].value', container) as HTMLInputElement
    await waitFor(() => expect(commandOptionsInput1.value).toBe('--command1'))
    const addCommandButton = screen.getByTestId('add-spec.commandOptions')
    expect(addCommandButton).toBeInTheDocument()
    await userEvent.click(addCommandButton)
    const commandOptionsInput2 = queryByNameAttribute('spec.commandOptions[1].value', container) as HTMLInputElement
    await waitFor(() => expect(commandOptionsInput2).toBeInTheDocument())
    expect(commandOptionsInput2.value).toBe('')
    fireEvent.change(commandOptionsInput2, { target: { value: '--command2' } })
    expect(commandOptionsInput2.value).toBe('--command2')

    const privilegedCheckbox = queryByNameAttribute('spec.privileged', container) as HTMLInputElement
    expect(privilegedCheckbox).not.toBeChecked()
    await userEvent.click(privilegedCheckbox)

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(1)
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const imagePullPolicyDropdownIcon = dropdownIcons[0].parentElement
    await userEvent.click(imagePullPolicyDropdownIcon!)
    await waitFor(() => expect(portalDivs.length).toBe(1))

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
    const envVariableKeyInput = queryByNameAttribute('spec.envVariables[0].key', container) as HTMLInputElement
    await waitFor(() => expect(envVariableKeyInput).toBeInTheDocument())
    expect(envVariableKeyInput.value).toBe('')
    fireEvent.change(envVariableKeyInput, { target: { value: 'key1' } })
    expect(envVariableKeyInput.value).toBe('key1')
    let envVariableValueInput = queryByNameAttribute('spec.envVariables[0].value', container) as HTMLInputElement
    expect(envVariableValueInput).toBeInTheDocument()
    expect(envVariableValueInput.value).toBe('')
    fireEvent.change(envVariableValueInput, { target: { value: 'value1' } })
    envVariableValueInput = queryByNameAttribute('spec.envVariables[0].value', container) as HTMLInputElement
    expect(envVariableValueInput.value).toBe('value1')

    act(() => {
      ref.current?.submitForm()
    })

    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
  })

  test('it should display correct initial values for existing step', async () => {
    const ref = React.createRef<StepFormikRef<AwsCdkCommonStepFormikValues>>()
    const { container } = renderComponent({
      initialValues: existingInitialValues,
      readonly: false,
      formikRef: ref,
      onUpdateMocked: onUpdate
    })

    const commandOptionsInput1 = queryByNameAttribute('spec.commandOptions[0].value', container) as HTMLInputElement
    expect(commandOptionsInput1).toBeInTheDocument()
    expect(commandOptionsInput1.value).toBe('--command2')
    fireEvent.change(commandOptionsInput1, { target: { value: '--command4' } })
    expect(commandOptionsInput1.value).toBe('--command4')
    const commandOptionsInput2 = queryByNameAttribute('spec.commandOptions[1].value', container) as HTMLInputElement
    expect(commandOptionsInput2).toBeInTheDocument()
    expect(commandOptionsInput2.value).toBe('--command3')
    fireEvent.change(commandOptionsInput2, { target: { value: '--command5' } })
    expect(commandOptionsInput2.value).toBe('--command5')
    const addCommandButton = screen.getByTestId('add-spec.commandOptions')
    expect(addCommandButton).toBeInTheDocument()

    const privilegedCheckbox = queryByNameAttribute('spec.privileged', container) as HTMLInputElement
    expect(privilegedCheckbox).toBeChecked()
    await userEvent.click(privilegedCheckbox)

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(1)
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const imagePullPolicySelect = queryByNameAttribute('spec.imagePullPolicy', container) as HTMLInputElement
    expect(imagePullPolicySelect.value).toBe('pipelineSteps.pullNeverLabel')
    const imagePullPolicyDropdownIcon = dropdownIcons[0].parentElement
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
    expect(envVariableKeyInput.value).toBe('k1')
    fireEvent.change(envVariableKeyInput, { target: { value: 'keyUpdated' } })
    expect(envVariableKeyInput.value).toBe('keyUpdated')
    const envVariableValueInput = queryByNameAttribute('spec.envVariables[0].value', container) as HTMLInputElement
    expect(envVariableValueInput).toBeInTheDocument()
    expect(envVariableValueInput.value).toBe('v1')
    fireEvent.change(envVariableValueInput, { target: { value: 'valueUpdated' } })
    expect(envVariableValueInput.value).toBe('valueUpdated')

    // submit form and verify
    act(() => {
      ref.current?.submitForm()
    })

    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
  })

  test('it should display all fields as disabled when readonly is passed as true', async () => {
    const ref = React.createRef<StepFormikRef<AwsCdkCommonStepFormikValues>>()
    const { container } = renderComponent({
      initialValues: existingInitialValues,
      readonly: true,
      formikRef: ref,
      onUpdateMocked: onUpdate
    })

    const buildCommandOptionsInput1 = queryByNameAttribute(
      'spec.commandOptions[0].value',
      container
    ) as HTMLInputElement
    expect(buildCommandOptionsInput1).toBeInTheDocument()
    expect(buildCommandOptionsInput1.value).toBe('--command2')
    expect(buildCommandOptionsInput1).toBeDisabled()
    const addCommandButton = screen.getByTestId('add-spec.commandOptions')
    expect(addCommandButton).toBeInTheDocument()
    expect(addCommandButton).toBeDisabled()

    const privilegedCheckbox = queryByNameAttribute('spec.privileged', container) as HTMLInputElement
    expect(privilegedCheckbox).toBeChecked()
    expect(privilegedCheckbox).toBeDisabled()

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(1)
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const imagePullPolicySelect = queryByNameAttribute('spec.imagePullPolicy', container) as HTMLInputElement
    expect(imagePullPolicySelect.value).toBe('pipelineSteps.pullNeverLabel')
    expect(imagePullPolicySelect).toBeDisabled()

    const runAsUserInput = queryByNameAttribute('spec.runAsUser', container) as HTMLInputElement
    expect(runAsUserInput).toBeInTheDocument()
    expect(runAsUserInput.value).toBe('5000')
    expect(runAsUserInput).toBeDisabled()

    const memoryInput = queryByNameAttribute('spec.resources.limits.memory', container) as HTMLInputElement
    expect(memoryInput).toBeInTheDocument()
    expect(memoryInput.value).toBe('4Gi')
    expect(memoryInput).toBeDisabled()

    const cpuInput = queryByNameAttribute('spec.resources.limits.cpu', container) as HTMLInputElement
    expect(cpuInput).toBeInTheDocument()
    expect(cpuInput.value).toBe('4000')
    expect(cpuInput).toBeDisabled()

    const addEnvVariableButton = screen.getByTestId('add-spec.envVariables')
    expect(addEnvVariableButton).toBeInTheDocument()
    expect(addEnvVariableButton).toBeDisabled()
    const envVariableKeyInput = queryByNameAttribute('spec.envVariables[0].key', container) as HTMLInputElement
    await waitFor(() => expect(envVariableKeyInput).toBeInTheDocument())
    expect(envVariableKeyInput.value).toBe('k1')
    expect(envVariableKeyInput).toBeDisabled()
    const envVariableValueInput = queryByNameAttribute('spec.envVariables[0].value', container) as HTMLInputElement
    expect(envVariableValueInput).toBeInTheDocument()
    expect(envVariableValueInput.value).toBe('v1')
    expect(envVariableValueInput).toBeDisabled()

    act(() => {
      ref.current?.submitForm()
    })

    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
  })

  test('it should display Runtime input as initial values for all fields in edit view', async () => {
    const ref = React.createRef<StepFormikRef<AwsCdkCommonStepFormikValues>>()

    const { container } = renderComponent({
      initialValues: awsCDKCommonRuntimeTemplate,
      readonly: false,
      formikRef: ref,
      onUpdateMocked: onUpdate
    })

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const connectorInput = queryByNameAttribute('spec.imagePullPolicy', container) as HTMLInputElement
    expect(connectorInput.value).toBe(RUNTIME_INPUT_VALUE)
    const cogImagePull = document.getElementById('configureOptions_spec.imagePullPolicy')
    await userEvent.click(cogImagePull!)
    await waitFor(() => expect(modals.length).toBe(1))
    const imagePullCOG = modals[0] as HTMLElement
    await doConfigureOptionsTesting(imagePullCOG)
    const cogRunAsUser = document.getElementById('configureOptions_spec.runAsUser')
    await userEvent.click(cogRunAsUser!)
    await waitFor(() => expect(modals.length).toBe(1))
    const runAsUserCOG = modals[0] as HTMLElement
    await doConfigureOptionsTesting(runAsUserCOG)
    const cogResLimitMemory = document.getElementById('configureOptions_spec.resources.limits.memory')
    await userEvent.click(cogResLimitMemory!)
    await waitFor(() => expect(modals.length).toBe(1))
    const resLimitMemoryCOG = modals[0] as HTMLElement
    await doConfigureOptionsTesting(resLimitMemoryCOG)
    const cogResLimitCpu = document.getElementById('configureOptions_spec.resources.limits.cpu')
    await userEvent.click(cogResLimitCpu!)
    await waitFor(() => expect(modals.length).toBe(1))
    const resLimitCpuCOG = modals[0] as HTMLElement
    await doConfigureOptionsTesting(resLimitCpuCOG)

    act(() => {
      ref.current?.submitForm()
    })

    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
  })
})
