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
  waitFor,
  findByText as findElementByText,
  getByText as getElementByText,
  RenderResult,
  screen
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button, FormikForm, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import routes from '@common/RouteDefinitions'
import { TestWrapper, queryByNameAttribute } from '@common/utils/testUtils'
import { modulePathProps, pipelinePathProps, projectPathProps } from '@common/utils/routeUtils'
import { kubernetesConnectorListResponse } from '@connectors/components/ConnectorReferenceField/__tests__/mocks'
import { StepFormikFowardRef, StepFormikRef, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { AwsSamServerlessCommonStepFormikVaues } from '../AwsSamServerlessStepCommonOptionalFieldsEdit'
import {
  AwsSamServerlessStepCommonOptionalFieldsInputSet,
  AwsSamServerlessStepInitialValues
} from '../AwsSamServerlessStepCommonOptionalFieldsInputSet'

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
    fireEvent.change(regexTextArea, { target: { value: '<+input>.includes(/test/)' } })
  })
  await waitFor(() => expect(regexTextArea.value).toBe('<+input>.includes(/test/)'))
  const cogSubmit = getElementByText(cogModal, 'submit')
  await userEvent.click(cogSubmit)
}

const existingInitialValues: AwsSamServerlessCommonStepFormikVaues = {
  identifier: 'Step_1',
  name: 'Step 1',
  spec: {
    connectorRef: 'account.Kubernetes_Connector_2',
    image: 'aws-sam-prod:latest',
    samVersion: '2',
    buildCommandOptions: [
      { id: 'command2', value: '--command2' },
      { id: 'command3', value: '--command3' }
    ],
    samBuildDockerRegistryConnectorRef: 'account.Kubernetes_Connector_3',
    privileged: true,
    imagePullPolicy: 'Never',
    runAsUser: '5000',
    resources: {
      limits: {
        memory: '4Gi',
        cpu: '4000'
      }
    },
    envVariables: { k1: 'v1' } as unknown as any
  },
  timeout: '20m',
  type: StepType.AwsSamBuild
}

const awsSamBuildRuntimeTemplate: AwsSamServerlessStepInitialValues = {
  identifier: 'Step_1',
  name: 'Step 1',
  spec: {
    connectorRef: RUNTIME_INPUT_VALUE,
    image: RUNTIME_INPUT_VALUE,
    samVersion: RUNTIME_INPUT_VALUE,
    buildCommandOptions: RUNTIME_INPUT_VALUE,
    samBuildDockerRegistryConnectorRef: RUNTIME_INPUT_VALUE,
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
      k1: RUNTIME_INPUT_VALUE
    }
  },
  timeout: RUNTIME_INPUT_VALUE,
  type: StepType.AwsSamBuild
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
  initialValues: AwsSamServerlessCommonStepFormikVaues
  readonly: boolean
  formikRef: StepFormikFowardRef<AwsSamServerlessCommonStepFormikVaues>
  onUpdateMocked: (data: AwsSamServerlessCommonStepFormikVaues) => void
}

const renderComponent = function (props: ComponentProps): RenderResult {
  const { initialValues, readonly, formikRef, onUpdateMocked } = props
  return render(
    <Formik
      initialValues={initialValues}
      onSubmit={values => {
        onUpdateMocked(values)
      }}
    >
      {(formik: FormikProps<AwsSamServerlessCommonStepFormikVaues>) => {
        setFormikRef(formikRef, formik)
        return (
          <FormikForm>
            <TestWrapper path={PATH} pathParams={PATH_PARAMS}>
              <AwsSamServerlessStepCommonOptionalFieldsInputSet
                inputSetData={{
                  readonly: readonly,
                  template: awsSamBuildRuntimeTemplate,
                  path: ''
                }}
                allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
              />
              <Button text="Submit" type="submit" />
            </TestWrapper>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

describe('AwsSamServerlessStepCommonOptionalFieldsInputSet tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
  })

  test('it should create step with correct data', async () => {
    const ref = React.createRef<StepFormikRef<AwsSamServerlessCommonStepFormikVaues>>()
    const { container } = renderComponent({
      initialValues: {
        identifier: 'Step_1',
        name: 'Step 1',
        timeout: '20m',
        spec: {
          connectorRef: ''
        },
        type: StepType.AwsSamBuild
      },
      readonly: false,
      formikRef: ref,
      onUpdateMocked: onUpdate
    })

    const privilegedCheckbox = queryByNameAttribute('spec.privileged', container) as HTMLInputElement
    expect(privilegedCheckbox).not.toBeChecked()
    await userEvent.click(privilegedCheckbox)

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(1)
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const imagePullPolicySelect = queryByNameAttribute('spec.imagePullPolicy', container) as HTMLInputElement
    const imagePullPolicyDropdownIcon = dropdownIcons[0].parentElement
    await userEvent.click(imagePullPolicyDropdownIcon!)
    await waitFor(() => expect(portalDivs.length).toBe(1))
    const portalDiv = portalDivs[0] as HTMLElement
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

    const addEnvVariableButton = screen.queryByTestId('add-spec.envVariables')
    expect(addEnvVariableButton).not.toBeInTheDocument()
    const envVariableKeyInput = queryByNameAttribute('spec.envVariables[0].key', container) as HTMLInputElement
    await waitFor(() => expect(envVariableKeyInput).not.toBeInTheDocument())

    // submit form and verify
    act(() => {
      ref.current?.submitForm()
    })

    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
  })

  test('it should display correct initial values for existing step', async () => {
    const ref = React.createRef<StepFormikRef<AwsSamServerlessCommonStepFormikVaues>>()
    const { container } = renderComponent({
      initialValues: existingInitialValues,
      readonly: false,
      formikRef: ref,
      onUpdateMocked: onUpdate
    })

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

    const addEnvVariableButton = screen.queryByTestId('add-spec.envVariables')
    expect(addEnvVariableButton).not.toBeInTheDocument()
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
    const ref = React.createRef<StepFormikRef<AwsSamServerlessCommonStepFormikVaues>>()
    const { container } = renderComponent({
      initialValues: existingInitialValues,
      readonly: true,
      formikRef: ref,
      onUpdateMocked: onUpdate
    })

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

    const addEnvVariableButton = screen.queryByTestId('add-spec.envVariables')
    expect(addEnvVariableButton).not.toBeInTheDocument()
    const envVariableKeyInput = queryByNameAttribute('spec.envVariables[0].key', container) as HTMLInputElement
    await waitFor(() => expect(envVariableKeyInput).toBeInTheDocument())
    expect(envVariableKeyInput.value).toBe('k1')
    expect(envVariableKeyInput).toBeDisabled()
    const envVariableValueInput = queryByNameAttribute('spec.envVariables[0].value', container) as HTMLInputElement
    expect(envVariableValueInput).toBeInTheDocument()
    expect(envVariableValueInput.value).toBe('v1')
    expect(envVariableValueInput).toBeDisabled()

    // submit form and verify
    act(() => {
      ref.current?.submitForm()
    })

    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
  })

  test('it should display Runtime input as initial values for all fields in edit view', async () => {
    const ref = React.createRef<StepFormikRef<AwsSamServerlessCommonStepFormikVaues>>()

    const { container } = renderComponent({
      initialValues: awsSamBuildRuntimeTemplate as AwsSamServerlessCommonStepFormikVaues,
      readonly: false,
      formikRef: ref,
      onUpdateMocked: onUpdate
    })

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const privilegedInput = queryByNameAttribute('spec.privileged', container) as HTMLInputElement
    expect(privilegedInput.value).toBe(RUNTIME_INPUT_VALUE)

    const imagePullPolicyInput = queryByNameAttribute('spec.imagePullPolicy', container) as HTMLInputElement
    expect(imagePullPolicyInput.value).toBe(RUNTIME_INPUT_VALUE)

    const runAsUserInput = queryByNameAttribute('spec.runAsUser', container) as HTMLInputElement
    expect(runAsUserInput.value).toBe(RUNTIME_INPUT_VALUE)
    const cogRunAsUser = document.getElementById('configureOptions_spec.runAsUser')
    await userEvent.click(cogRunAsUser!)
    await waitFor(() => expect(modals.length).toBe(1))
    const runAsUserCOG = modals[0] as HTMLElement
    await doConfigureOptionsTesting(runAsUserCOG)

    const memoryInput = queryByNameAttribute('spec.resources.limits.memory', container) as HTMLInputElement
    expect(memoryInput.value).toBe(RUNTIME_INPUT_VALUE)

    const cpuInput = queryByNameAttribute('spec.resources.limits.cpu', container) as HTMLInputElement
    expect(cpuInput.value).toBe(RUNTIME_INPUT_VALUE)

    // submit form and verify
    act(() => {
      ref.current?.submitForm()
    })

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Step_1',
        name: 'Step 1',
        spec: {
          buildCommandOptions: RUNTIME_INPUT_VALUE,
          connectorRef: RUNTIME_INPUT_VALUE,
          image: RUNTIME_INPUT_VALUE,

          samBuildDockerRegistryConnectorRef: RUNTIME_INPUT_VALUE,
          samVersion: RUNTIME_INPUT_VALUE,
          privileged: RUNTIME_INPUT_VALUE as unknown as boolean,
          imagePullPolicy: RUNTIME_INPUT_VALUE,
          runAsUser: '<+input>.regex(<+input>.includes(/test/))',
          resources: {
            limits: {
              memory: RUNTIME_INPUT_VALUE,
              cpu: RUNTIME_INPUT_VALUE
            }
          },
          envVariables: {
            k1: RUNTIME_INPUT_VALUE
          }
        },
        timeout: RUNTIME_INPUT_VALUE,
        type: StepType.AwsSamBuild
      })
    )
  })
})
