/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { StringsMap } from 'framework/strings/StringsContext'
import { queryByNameAttribute } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { modulePathProps, pipelinePathProps, projectPathProps } from '@common/utils/routeUtils'
import { ModulePathParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { connectorsData } from '@connectors/pages/connectors/__tests__/mockData'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { pipelineContextAwsSamManifests } from '@pipeline/components/PipelineStudio/PipelineContext/__tests__/helper'
import { ManifestDataType, ManifestStoreMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import {
  getYaml,
  initialManifestRuntimeValuesGitStore,
  awsSamDirectoryManifestTemplateGitStore,
  initialConfigFilesRuntimeValues,
  configFilesTemplate,
  configFilesTemplateMultipleFiles,
  initialConfigFilesRuntimeValuesMultipleFiles
} from './helper'
import { AwsSamServiceSpec } from '../AwsSamServiceSpec'

const connectorData = { data: connectorsData.data.content[1] }
const fetchConnector = jest.fn().mockReturnValue(connectorData)
const fetchConnectorList = (): Promise<unknown> => Promise.resolve(connectorsData)

jest.mock('services/cd-ng', () => ({
  getConnectorListV2: () => Promise.resolve(connectorsData),
  getConnectorListPromise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectorList })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorData, refetch: fetchConnector, loading: false }
  }),
  useGetServiceV2: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() })),
  getConnectorListV2Promise: () => Promise.resolve(connectorsData)
}))

const TEST_PATH = routes.toPipelineStudio({ ...projectPathProps, ...modulePathProps, ...pipelinePathProps })
const TEST_PATH_PARAMS = {
  accountId: 'testAccountId',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject',
  pipelineIdentifier: 'Pipeline_1',
  module: 'cd'
}

factory.registerStep(new AwsSamServiceSpec())

const getString = (str: keyof StringsMap, vars?: Record<string, any> | undefined): string => {
  return vars?.stringToAppend ? `${str}_${vars.stringToAppend}` : str
}

describe('GcfServiceSpec tests', () => {
  test('check service tab for given pipeline state from context', async () => {
    render(
      <PipelineContext.Provider value={pipelineContextAwsSamManifests}>
        <TestStepWidget
          testWrapperProps={{
            path: TEST_PATH,
            pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
          }}
          initialValues={{
            isReadonlyServiceMode: false
          }}
          readonly={false}
          type={StepType.AwsSamService}
          stepViewType={StepViewType.Edit}
        />
      </PipelineContext.Provider>
    )

    // Function Definition
    const manifestContainer = screen.getByTestId('aws-sam-manifest-card')
    expect(
      within(manifestContainer).getByText('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')
    ).toBeInTheDocument()
    expect(screen.getByText('Values_Manifest')).toBeInTheDocument()
    expect(screen.getByText('AwsSamDirectory_Manifest')).toBeInTheDocument()
  })

  test('check Input Set view for manifest when manifestStore is Git', async () => {
    const { container, getByText, getAllByText } = render(
      <TestStepWidget
        testWrapperProps={{
          path: TEST_PATH,
          pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
        }}
        initialValues={initialManifestRuntimeValuesGitStore}
        allValues={initialManifestRuntimeValuesGitStore}
        readonly={false}
        type={StepType.AwsSamService}
        stepViewType={StepViewType.InputSet}
        template={awsSamDirectoryManifestTemplateGitStore}
        path={'pipeline.stages[0].stage.spec.service.serviceInputs.serviceDefinition.spec'}
      />
    )

    // 1 connectorRef fields should appear
    const allConnectorRefInput = getAllByText('connector')
    expect(allConnectorRefInput).toHaveLength(1)

    // Function Definition
    const awsSamDirectoryBranchInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.service.serviceInputs.serviceDefinition.spec.manifests[0].manifest.spec.store.spec.branch',
      container
    )
    expect(awsSamDirectoryBranchInput).toBeInTheDocument()
    const awsSamDirectoryPathInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.service.serviceInputs.serviceDefinition.spec.manifests[0].manifest.spec.store.spec.paths[0]',
      container
    )
    expect(awsSamDirectoryPathInput).toBeInTheDocument()

    const submitBtn = getByText('Submit')
    userEvent.click(submitBtn)
  })

  test('check manifest errors in DeploymentForm view', async () => {
    const step = new AwsSamServiceSpec() as any

    step.renderStep({
      initialValues: initialManifestRuntimeValuesGitStore,
      inputSetData: {
        template: awsSamDirectoryManifestTemplateGitStore
      }
    })

    const errors = await step.validateInputSet({
      data: initialManifestRuntimeValuesGitStore,
      template: awsSamDirectoryManifestTemplateGitStore,
      getString,
      viewType: StepViewType.DeploymentForm
    })
    expect(errors.manifests[0].manifest.spec.store.spec.connectorRef).toBe('fieldRequired')
    expect(errors.manifests[0].manifest.spec.store.spec.branch).toBe('fieldRequired')
    expect(errors.manifests[0].manifest.spec.store.spec.paths).toBe('fieldRequired')
  })

  test('check manifest errors in TriggerForm view', async () => {
    const step = new AwsSamServiceSpec() as any

    step.renderStep({
      initialValues: initialManifestRuntimeValuesGitStore,
      inputSetData: {
        template: awsSamDirectoryManifestTemplateGitStore
      }
    })

    const errors = await step.validateInputSet({
      data: initialManifestRuntimeValuesGitStore,
      template: awsSamDirectoryManifestTemplateGitStore,
      getString,
      viewType: StepViewType.TriggerForm
    })
    expect(errors.manifests[0].manifest.spec.store.spec.connectorRef).toBe('fieldRequired')
    expect(errors.manifests[0].manifest.spec.store.spec.branch).toBe('fieldRequired')
    expect(errors.manifests[0].manifest.spec.store.spec.commitId).toBe('fieldRequired')
    expect(errors.manifests[0].manifest.spec.store.spec.paths).toBe('fieldRequired')
  })

  test('check config files errors in DeploymentForm view', async () => {
    const step = new AwsSamServiceSpec() as any

    step.renderStep({
      initialValues: initialConfigFilesRuntimeValues,
      inputSetData: {
        template: configFilesTemplate
      }
    })

    const errors = await step.validateInputSet({
      data: initialConfigFilesRuntimeValues,
      template: configFilesTemplate,
      getString,
      viewType: StepViewType.DeploymentForm
    })
    expect(errors.configFiles[0].configFile.spec.store.spec.files[0]).toBe('fieldRequired')
    expect(errors.configFiles[0].configFile.spec.store.spec.secretFiles[0]).toBe('fieldRequired')
  })

  test('check config files errors in DeploymentForm view when files field is not empty', async () => {
    const step = new AwsSamServiceSpec() as any

    step.renderStep({
      initialValues: initialConfigFilesRuntimeValuesMultipleFiles,
      inputSetData: {
        template: configFilesTemplateMultipleFiles
      }
    })

    const errors = await step.validateInputSet({
      data: initialConfigFilesRuntimeValuesMultipleFiles,
      template: configFilesTemplateMultipleFiles,
      getString,
      viewType: StepViewType.DeploymentForm
    })
    expect(errors.configFiles[0].configFile.spec.store.spec.files[1]).toBe('fieldRequired')
    expect(errors.configFiles[0].configFile.spec.store.spec.secretFiles[1]).toBe('fieldRequired')
  })

  test('no errors should be displayed in DeploymentForm view when template is not provided properly', async () => {
    const step = new AwsSamServiceSpec() as any

    step.renderStep({
      initialValues: initialManifestRuntimeValuesGitStore,
      inputSetData: {
        template: awsSamDirectoryManifestTemplateGitStore
      }
    })

    const errors = await step.validateInputSet({
      data: {
        manifests: [
          {
            manifest: {}
          }
        ],
        configFiles: [
          {
            configFile: {}
          }
        ]
      },
      template: {
        manifests: [
          {
            manifest: {}
          }
        ],
        configFiles: [
          {
            configFile: {}
          }
        ]
      },
      getString,
      viewType: StepViewType.DeploymentForm
    })
    expect(errors).toEqual({})
  })

  test('when template is empty object, no fields should be rendered', async () => {
    const { queryByText } = render(
      <TestStepWidget
        testWrapperProps={{
          path: TEST_PATH,
          pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
        }}
        initialValues={initialManifestRuntimeValuesGitStore}
        allValues={initialManifestRuntimeValuesGitStore}
        readonly={false}
        type={StepType.AwsSamService}
        stepViewType={StepViewType.InputSet}
        path={'pipeline.stages[0].stage.spec.service.serviceInputs.serviceDefinition.spec'}
      />
    )

    const connectorRefInput = queryByText('connector')
    expect(connectorRefInput).not.toBeInTheDocument()
  })

  test('Variables view renders fine', async () => {
    const existingInitialValues = {
      manifest: {
        identifier: 'manifest1',
        type: ManifestDataType.AwsSamDirectory,
        spec: {
          store: {
            type: ManifestStoreMap.Git,
            spec: {
              connectorRef: 'connector_1',
              branch: 'main'
            }
          }
        }
      }
    }

    const { getByTestId } = render(
      <TestStepWidget
        testWrapperProps={{
          path: TEST_PATH,
          pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
        }}
        initialValues={existingInitialValues}
        type={StepType.AwsSamService}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'qaStage',
          variablesData: existingInitialValues,
          path: 'pipeline.stages.qaStage.manifests[0].manifest.spec',
          metadataMap: {
            connector_1: {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.manifests[0].manifest.spec.AwsSamService.connectorRef',
                localName: 'spec.AwsSamService.connectorRef'
              }
            },
            main: {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.manifests[0].manifest.spec.AwsSamService.region',
                localName: 'spec.AwsSamService.branch'
              }
            }
          }
        }}
      />
    )

    const manifestsAccordion = getByTestId('pipeline.stages.qaStage.manifests[0].manifest.spec.Variables-summary')
    expect(manifestsAccordion).toBeInTheDocument()
  })
})

const connectorRefPath =
  'pipeline.stages.0.stage.spec.serviceConfig.serviceDefinition.spec.manifests.0.manifest.spec.store.spec.connectorRef'
const params = (): PipelinePathProps & ModulePathParams => ({
  accountId: 'accountId',
  module: 'cd',
  orgIdentifier: 'default',
  pipelineIdentifier: '-1',
  projectIdentifier: 'projectIdentifier'
})

describe('Autocomplete fields test', () => {
  test('getManifestConnectorsListForYaml test', async () => {
    const step = new AwsSamServiceSpec() as any
    let list: CompletionItemInterface[]
    list = await step.getManifestConnectorsListForYaml(connectorRefPath, getYaml(), params)
    expect(list).toHaveLength(7)
    expect(list[1].insertText).toBe('account.Git_CTR')
    list = await step.getManifestConnectorsListForYaml('invalid path', getYaml(), params)
    expect(list).toHaveLength(0)
  })
})
