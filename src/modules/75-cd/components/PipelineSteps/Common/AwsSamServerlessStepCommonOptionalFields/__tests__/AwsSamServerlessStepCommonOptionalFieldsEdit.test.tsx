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
import { testConnectorRefChange } from '@cd/components/PipelineSteps/AwsSam/AwsSamInfraSpec/__tests__/helper'
import {
  AwsSamServerlessCommonStepFormikVaues,
  AwsSamServerlessStepCommonOptionalFieldsEdit
} from '../AwsSamServerlessStepCommonOptionalFieldsEdit'

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
    envVariables: [
      {
        id: 'env1',
        key: 'k1',
        value: 'v1'
      }
    ]
  },
  timeout: '20m',
  type: StepType.AwsSamBuild
}

const awsSamBuildRuntimeTemplate: AwsSamServerlessCommonStepFormikVaues = {
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
    envVariables: [
      {
        id: 'env1',
        key: 'key1',
        value: RUNTIME_INPUT_VALUE
      }
    ]
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
  isAwsSamBuildStep: boolean
  formikRef: StepFormikFowardRef<AwsSamServerlessCommonStepFormikVaues>
  onUpdateMocked: (data: AwsSamServerlessCommonStepFormikVaues) => void
}

const renderComponent = function (props: ComponentProps): RenderResult {
  const { initialValues, readonly, isAwsSamBuildStep, formikRef, onUpdateMocked } = props
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
              <AwsSamServerlessStepCommonOptionalFieldsEdit
                readonly={readonly}
                allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
                formik={formik}
                versionFieldName={'spec.samVersion'}
                versionFieldLabel={'SAM Version'}
                commandOptionsFieldName={'spec.buildCommandOptions'}
                commandOptionsFieldLabel={'AWS SAM Build Command Options'}
                isAwsSamBuildStep={isAwsSamBuildStep}
              />
              <Button text="Submit" type="submit" />
            </TestWrapper>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

describe('AwsSamServerlessStepCommonOptionalFieldsEdit tests', () => {
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
      isAwsSamBuildStep: true,
      formikRef: ref,
      onUpdateMocked: onUpdate
    })

    const samVersionInput = queryByNameAttribute('spec.samVersion', container) as HTMLInputElement
    expect(samVersionInput).toBeInTheDocument()
    expect(samVersionInput.value).toBe('')
    fireEvent.change(samVersionInput, { target: { value: '3' } })
    expect(samVersionInput.value).toBe('3')

    let buildCommandOptionsInput1 = queryByNameAttribute(
      'spec.buildCommandOptions[0].value',
      container
    ) as HTMLInputElement
    expect(buildCommandOptionsInput1).toBeInTheDocument()
    expect(buildCommandOptionsInput1.value).toBe('')
    fireEvent.change(buildCommandOptionsInput1, { target: { value: '--command1' } })
    buildCommandOptionsInput1 = queryByNameAttribute('spec.buildCommandOptions[0].value', container) as HTMLInputElement
    await waitFor(() => expect(buildCommandOptionsInput1.value).toBe('--command1'))
    const addCommandButton = screen.getByTestId('add-spec.buildCommandOptions')
    expect(addCommandButton).toBeInTheDocument()
    await userEvent.click(addCommandButton)
    const buildCommandOptionsInput2 = queryByNameAttribute(
      'spec.buildCommandOptions[1].value',
      container
    ) as HTMLInputElement
    await waitFor(() => expect(buildCommandOptionsInput2).toBeInTheDocument())
    expect(buildCommandOptionsInput2.value).toBe('')
    fireEvent.change(buildCommandOptionsInput2, { target: { value: '--command2' } })
    expect(buildCommandOptionsInput2.value).toBe('--command2')

    const samBuildDockerRegistryConnectorRef = screen.getByTestId(/spec.samBuildDockerRegistryConnectorRef/)
    expect(samBuildDockerRegistryConnectorRef).toBeInTheDocument()
    userEvent.click(samBuildDockerRegistryConnectorRef)
    await testConnectorRefChange('Kubernetes Connector 3', 'Kubernetes Connector 2', '')

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
      isAwsSamBuildStep: true,
      formikRef: ref,
      onUpdateMocked: onUpdate
    })

    const samVersionInput = queryByNameAttribute('spec.samVersion', container) as HTMLInputElement
    await waitFor(() => expect(samVersionInput).toBeInTheDocument())
    expect(samVersionInput.value).toBe('2')
    fireEvent.change(samVersionInput, { target: { value: '1' } })
    expect(samVersionInput.value).toBe('1')

    const buildCommandOptionsInput1 = queryByNameAttribute(
      'spec.buildCommandOptions[0].value',
      container
    ) as HTMLInputElement
    expect(buildCommandOptionsInput1).toBeInTheDocument()
    expect(buildCommandOptionsInput1.value).toBe('--command2')
    fireEvent.change(buildCommandOptionsInput1, { target: { value: '--command4' } })
    expect(buildCommandOptionsInput1.value).toBe('--command4')
    const buildCommandOptionsInput2 = queryByNameAttribute(
      'spec.buildCommandOptions[1].value',
      container
    ) as HTMLInputElement
    expect(buildCommandOptionsInput2).toBeInTheDocument()
    expect(buildCommandOptionsInput2.value).toBe('--command3')
    fireEvent.change(buildCommandOptionsInput2, { target: { value: '--command5' } })
    expect(buildCommandOptionsInput2.value).toBe('--command5')
    const addCommandButton = screen.getByTestId('add-spec.buildCommandOptions')
    expect(addCommandButton).toBeInTheDocument()

    const samBuildDockerRegistryConnectorRef = screen.getByTestId(/spec.samBuildDockerRegistryConnectorRef/)
    expect(samBuildDockerRegistryConnectorRef).toBeInTheDocument()

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
      isAwsSamBuildStep: true,
      formikRef: ref,
      onUpdateMocked: onUpdate
    })

    const samVersionInput = queryByNameAttribute('spec.samVersion', container) as HTMLInputElement
    await waitFor(() => expect(samVersionInput).toBeInTheDocument())
    expect(samVersionInput.value).toBe('2')
    expect(samVersionInput).toBeDisabled()

    const buildCommandOptionsInput1 = queryByNameAttribute(
      'spec.buildCommandOptions[0].value',
      container
    ) as HTMLInputElement
    expect(buildCommandOptionsInput1).toBeInTheDocument()
    expect(buildCommandOptionsInput1.value).toBe('--command2')
    expect(buildCommandOptionsInput1).toBeDisabled()
    const addCommandButton = screen.getByTestId('add-spec.buildCommandOptions')
    expect(addCommandButton).toBeInTheDocument()
    expect(addCommandButton).toBeDisabled()

    const samBuildDockerRegistryConnectorRef = screen.getByTestId(/spec.samBuildDockerRegistryConnectorRef/)
    expect(samBuildDockerRegistryConnectorRef).toBeInTheDocument()

    const privilegedCheckbox = queryByNameAttribute('spec.privileged', container) as HTMLInputElement
    expect(privilegedCheckbox).toBeChecked()
    expect(privilegedCheckbox).toBeDisabled()

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(2)
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

    // submit form and verify
    act(() => {
      ref.current?.submitForm()
    })

    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
  })

  test('it should display Runtime input as initial values for all fields in edit view', async () => {
    const ref = React.createRef<StepFormikRef<AwsSamServerlessCommonStepFormikVaues>>()

    const { container } = renderComponent({
      initialValues: awsSamBuildRuntimeTemplate,
      readonly: false,
      isAwsSamBuildStep: true,
      formikRef: ref,
      onUpdateMocked: onUpdate
    })

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const connectorInput = queryByNameAttribute('spec.samVersion', container) as HTMLInputElement
    expect(connectorInput.value).toBe(RUNTIME_INPUT_VALUE)
    const cogSamVersion = document.getElementById('configureOptions_spec.samVersion')
    await userEvent.click(cogSamVersion!)
    await waitFor(() => expect(modals.length).toBe(1))
    const samVersionCOG = modals[0] as HTMLElement
    await doConfigureOptionsTesting(samVersionCOG)

    // submit form and verify
    act(() => {
      ref.current?.submitForm()
    })

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Step_1',
        name: 'Step 1',
        spec: {
          connectorRef: RUNTIME_INPUT_VALUE,
          image: RUNTIME_INPUT_VALUE,
          samVersion: '<+input>.regex(<+input>.includes(/test/))',
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
          envVariables: [
            {
              id: 'env1',
              key: 'key1',
              value: RUNTIME_INPUT_VALUE
            }
          ]
        },
        timeout: RUNTIME_INPUT_VALUE,
        type: StepType.AwsSamBuild
      })
    )
  })
})
