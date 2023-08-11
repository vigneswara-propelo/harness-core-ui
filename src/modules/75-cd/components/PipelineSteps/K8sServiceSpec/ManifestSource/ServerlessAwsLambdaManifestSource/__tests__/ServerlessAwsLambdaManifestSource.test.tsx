/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormikProps } from 'formik'
import { RenderResult, fireEvent, getByText, queryByAttribute, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AllowedTypesWithRunTime, Button, Formik, FormikForm } from '@harness/uicore'

import type { ManifestConfig, ManifestConfigWrapper, ServiceSpec } from 'services/cd-ng'
import { TestWrapper, testConnectorRefChange } from '@common/utils/testUtils'
import { connectorsData } from '@platform/connectors/pages/connectors/__tests__/mockData'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { ManifestSourceBaseFactory } from '@cd/factory/ManifestSourceFactory/ManifestSourceBaseFactory'
import { ManifestSourceRenderProps } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase'
import { ServerlessAwsLambdaManifestSource } from '../ServerlessAwsLambdaManifestSource'
import { template, manifests, manifest, initialValues } from './mock'

const fetchConnector = jest.fn().mockReturnValue({ data: connectorsData.data.content[0] })
jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnector: jest.fn().mockImplementation(() => {
    return {
      data: { data: connectorsData?.data?.content?.[0] },
      refetch: fetchConnector,
      loading: false
    }
  })
}))

const manifestSourceBaseFactory = new ManifestSourceBaseFactory()
const serverlessAwsLambdaManifestSource = new ServerlessAwsLambdaManifestSource()

const preconfiguredProps: ManifestSourceRenderProps = {
  stepViewType: StepViewType.InputSet,
  stageIdentifier: 'Stage_1',
  path: 'spec.serviceConfig.serviceDefinition.spec', // dummy
  readonly: false,
  allowableTypes: ['FIXED', 'EXPRESSION'] as AllowedTypesWithRunTime[],
  manifestPath: 'manifests[0].manifest',
  projectIdentifier: 'Chetan_Non_Git_Sync',
  orgIdentifier: 'default',
  accountId: 'kmpySmUISimoRrJL6NL73w',
  pipelineIdentifier: 'Pipeline_1',
  isManifestsRuntime: true,
  template: template,
  manifestSourceBaseFactory,
  initialValues
}

const testServerlessAwsLambdaManifestRuntimeView = async (
  portal: HTMLElement,
  path = preconfiguredProps.path
): Promise<void> => {
  const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', portal, name)

  // connectorRef
  const connnectorRefInput = await screen.findByTestId(/spec.connectorRef/)
  expect(connnectorRefInput).toBeInTheDocument()
  userEvent.click(connnectorRefInput)
  await testConnectorRefChange('Git CTR', 'AWS', '')

  // repo
  const repoNameInput = queryByNameAttribute(`${path}.${preconfiguredProps.manifestPath}.spec.store.spec.repoName`)
  expect(repoNameInput).toBeInTheDocument()
  fireEvent.change(repoNameInput!, { target: { value: 'testRepo' } })

  // branch
  const branchInput = queryByNameAttribute(`${path}.${preconfiguredProps.manifestPath}.spec.store.spec.branch`)
  expect(branchInput).toBeInTheDocument()
  fireEvent.change(branchInput!, { target: { value: 'testBranch' } })

  // path
  const path1Input = queryByNameAttribute(`${path}.${preconfiguredProps.manifestPath}.spec.store.spec.paths[0]`)
  expect(path1Input).toBeInTheDocument()
  fireEvent.change(path1Input!, {
    target: { value: 'test-path' }
  })

  const submitButton = getByText(portal, 'Submit').parentElement as HTMLElement
  await userEvent.click(submitButton)
}

interface RenderComponentProps {
  manifest: ManifestConfig
  initialValues: DeploymentStageElementConfig
  template: ServiceSpec
  manifests: ManifestConfigWrapper[]
  isManifestsRuntime: boolean
  readonly?: boolean
}

const onSubmit = jest.fn()

const renderComponent = (props: RenderComponentProps): RenderResult => {
  return render(
    <TestWrapper>
      <Formik
        formName="serverlessAwsLambdaRuntimeView"
        initialValues={props.initialValues}
        onSubmit={values => {
          const finalValues = {
            manifest: {
              connectorRef:
                values.spec?.serviceConfig?.serviceDefinition?.spec?.manifests?.[0].manifest?.spec.store.spec
                  .connectorRef,
              repoName:
                values.spec?.serviceConfig?.serviceDefinition?.spec?.manifests?.[0].manifest?.spec.store.spec.repoName,
              branch:
                values.spec?.serviceConfig?.serviceDefinition?.spec?.manifests?.[0].manifest?.spec.store.spec.branch,
              paths: values.spec?.serviceConfig?.serviceDefinition?.spec?.manifests?.[0].manifest?.spec.store.spec.paths
            }
          }
          onSubmit(finalValues)
        }}
      >
        {(formik: FormikProps<DeploymentStageElementConfig>) => (
          <FormikForm>
            {serverlessAwsLambdaManifestSource.renderContent({
              ...preconfiguredProps,
              ...props,
              manifestSourceBaseFactory,
              formik
            })}
            <Button type="submit">Submit</Button>
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('ServerlessAwsLambdaManifestSource tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('it should render manifest form and call onSubmit with expected values', async () => {
    const { container } = renderComponent({
      manifest: manifest as ManifestConfig,
      initialValues: initialValues,
      template: template.spec?.serviceConfig?.serviceDefinition?.spec as ServiceSpec,
      manifests: manifests as ManifestConfigWrapper[],
      isManifestsRuntime: true
    })

    await testServerlessAwsLambdaManifestRuntimeView(container)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        manifest: {
          connectorRef: 'account.Git_CTR',
          repoName: 'testRepo',
          branch: 'testBranch',
          paths: ['test-path']
        }
      })
    })
  })

  test('it should render all fields as disabled when readonly is true', async () => {
    const { container } = renderComponent({
      manifest: manifest as ManifestConfig,
      initialValues: initialValues,
      template: template.spec?.serviceConfig?.serviceDefinition?.spec as ServiceSpec,
      manifests: manifests as ManifestConfigWrapper[],
      isManifestsRuntime: true,
      readonly: true
    })

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const dialogs = document.getElementsByClassName('bp3-dialog')
    expect(dialogs).toHaveLength(0)

    // connectorRef
    const connnectorRefInput = await screen.findByTestId(/spec.connectorRef/)
    expect(connnectorRefInput).toBeInTheDocument()
    await userEvent.click(connnectorRefInput)
    await waitFor(() => expect(dialogs).toHaveLength(0))

    // repo
    const repoNameInput = queryByNameAttribute(
      `${preconfiguredProps.path}.${preconfiguredProps.manifestPath}.spec.store.spec.repoName`
    )
    expect(repoNameInput).toBeInTheDocument()
    expect(repoNameInput).toBeDisabled()

    // branch
    const branchInput = queryByNameAttribute(
      `${preconfiguredProps.path}.${preconfiguredProps.manifestPath}.spec.store.spec.branch`
    )
    expect(branchInput).toBeInTheDocument()
    expect(branchInput).toBeDisabled()

    // path
    const path1Input = queryByNameAttribute(
      `${preconfiguredProps.path}.${preconfiguredProps.manifestPath}.spec.store.spec.paths[0]`
    )
    expect(path1Input).toBeInTheDocument()
    expect(path1Input).toBeDisabled()
  })
})
