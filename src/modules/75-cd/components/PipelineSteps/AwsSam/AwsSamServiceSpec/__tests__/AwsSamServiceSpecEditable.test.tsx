/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  render,
  findByText,
  fireEvent,
  waitFor,
  getByText as getElementByText,
  queryByAttribute,
  act,
  findByTestId,
  within,
  screen
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TestWrapper } from '@common/utils/testUtils'
import type { ModulePathParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { modulePathProps, pipelinePathProps, projectPathProps } from '@common/utils/routeUtils'
import { connectorsData } from '@platform/connectors/pages/connectors/__tests__/mockData'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import {
  pipelineContextAwsSam,
  pipelineContextAwsSamManifests
} from '@pipeline/components/PipelineStudio/PipelineContext/__tests__/helper'
import { factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { setupMode } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import {
  updateStageArgAwsSamDirectoryCreate,
  updateStageArgAwsSamDirectoryManifestDelete,
  updateStageArgAwsSamDirectoryUpdate,
  updateStageArgForPropagatedStageWithAwsSamDirectoryManifest
} from './helper'
import { AwsSamServiceSpecEditable } from '../AwsSamServiceSpecEditable'

const connectorData = { data: connectorsData.data.content[1] }
const fetchConnector = jest.fn().mockReturnValue(connectorData)
const fetchConnectorList = (): Promise<unknown> => Promise.resolve(connectorsData)

jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectorList })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorData, refetch: fetchConnector, loading: false }
  }),
  useGetServiceV2: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() }))
}))

const testManifestStoreStep = async (portal: HTMLElement): Promise<void> => {
  const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

  await waitFor(() => expect(queryByValueAttribute('Github')).not.toBeNull())
  const Git = queryByValueAttribute('Git')
  expect(Git).not.toBeNull()
  const GitLab = queryByValueAttribute('GitLab')
  expect(GitLab).not.toBeNull()
  const Bitbucket = queryByValueAttribute('Bitbucket')
  expect(Bitbucket).not.toBeNull()
  await userEvent.click(Git!)
  const connnectorRefInput = await findByTestId(portal, /connectorRef/)
  expect(connnectorRefInput).toBeTruthy()
  await userEvent.click(connnectorRefInput)

  await act(async () => {
    const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[1] as HTMLElement
    const githubConnector1 = await findByText(connectorSelectorDialog, 'Git CTR')
    expect(githubConnector1).toBeTruthy()
    const githubConnector2 = await findByText(connectorSelectorDialog, 'Sample')
    expect(githubConnector2).toBeTruthy()
    await userEvent.click(githubConnector1)
    const applySelected = getElementByText(connectorSelectorDialog, 'entityReference.apply')
    await act(async () => {
      fireEvent.click(applySelected)
    })
    await waitFor(() => expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(1))
  })
  const secondStepContinueButton = getElementByText(portal, 'continue').parentElement as HTMLElement
  await waitFor(() => expect(secondStepContinueButton).not.toBeDisabled())
  await userEvent.click(secondStepContinueButton)
}

const testAwsSamDirectoryManifestLastStep = async (portal: HTMLElement): Promise<void> => {
  await waitFor(() => expect(getElementByText(portal, 'pipeline.manifestType.manifestIdentifier')).toBeInTheDocument())

  const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', portal, name)
  await act(async () => {
    fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
    fireEvent.change(queryByNameAttribute('gitFetchType')!, { target: { value: 'Branch' } })
    fireEvent.change(queryByNameAttribute('branch')!, { target: { value: 'testBranch' } })
    fireEvent.change(queryByNameAttribute('paths[0].path')!, { target: { value: 'test-path' } })
  })
  const submitButton = getElementByText(portal, 'submit').parentElement as HTMLElement
  await userEvent.click(submitButton)
}

const testAwsSamDirectoryManifestUpdate = async (): Promise<void> => {
  const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement
  const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

  // Check if second step IS NOT displayed
  const Git = queryByValueAttribute('Git')
  await waitFor(() => expect(Git).toBeNull()) // Because upon editing manifest, directly third step will be shown

  // Change fields in the last step and submit manifest
  await testAwsSamDirectoryManifestLastStep(portal)
}

const TEST_PATH = routes.toPipelineStudio({ ...projectPathProps, ...modulePathProps, ...pipelinePathProps })

const TEST_PATH_PARAMS: ModulePathParams & PipelinePathProps = {
  accountId: 'testAccountId',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject',
  pipelineIdentifier: 'Pipeline_1',
  module: 'cd'
}

describe('AwsSamServiceSpecEditable tests', () => {
  test('create AwsSamDirectory  manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextAwsSam.updateStage = updateStage

    render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}
        defaultFeatureFlagValues={{ NG_SVC_ENV_REDESIGN: true }}
      >
        <PipelineContext.Provider value={pipelineContextAwsSam}>
          <AwsSamServiceSpecEditable
            factory={factory}
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Click Add Manifest button
    const manifestSection = screen.getByTestId('aws-sam-manifest-card')
    const addManifestBtn = within(manifestSection).getByText('pipeline.manifestType.addManifestLabel')
    expect(addManifestBtn).toBeInTheDocument()
    userEvent.click(addManifestBtn)
    const allDialogs = document.getElementsByClassName('bp3-dialog')
    await waitFor(() => expect(allDialogs).toHaveLength(1))
    const portal = allDialogs[0] as HTMLElement

    const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

    // Choose AWS SAM Directory manifest type and continue
    const AwsSamDirectory = queryByValueAttribute('AwsSamDirectory') as Element
    await waitFor(() => expect(AwsSamDirectory).not.toBeNull())
    const Values = queryByValueAttribute('Values')
    expect(Values).not.toBeNull()
    userEvent.click(AwsSamDirectory)
    const continueButton = getElementByText(portal, 'continue').parentElement as HTMLElement
    await waitFor(() => expect(continueButton).not.toBeDisabled())
    await userEvent.click(continueButton)

    // Test manifest store tiles, choose Git and fill in Connector field
    await testManifestStoreStep(portal)

    // Fill in required field and submit manifest
    await testAwsSamDirectoryManifestLastStep(portal)

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgAwsSamDirectoryCreate)
    })
  })

  test('update AwsSamDirectory manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextAwsSamManifests.updateStage = updateStage

    const { container } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}
        defaultFeatureFlagValues={{ NG_SVC_ENV_REDESIGN: true }}
      >
        <PipelineContext.Provider value={pipelineContextAwsSamManifests}>
          <AwsSamServiceSpecEditable
            factory={factory}
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Click Edit button for Function Definition manifest
    const manifestContainer = screen.getByTestId('aws-sam-manifest-card')
    expect(
      within(manifestContainer).getByText('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')
    ).toBeInTheDocument()
    // continue with updating manifest
    expect(screen.getByText('AwsSamDirectory_Manifest')).toBeInTheDocument()
    expect(screen.getByText('Values_Manifest')).toBeInTheDocument()
    const editButtons = container.querySelectorAll('[data-icon="Edit"]')
    expect(editButtons).toHaveLength(2)
    const awsSamDirectoryManifestEditButton = editButtons[0]
    expect(awsSamDirectoryManifestEditButton).toBeInTheDocument()
    await userEvent.click(awsSamDirectoryManifestEditButton)

    await testAwsSamDirectoryManifestUpdate()

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgAwsSamDirectoryUpdate)
    })
  })

  test('delete AwsSamDirectory manifest', async () => {
    const updateStage = jest.fn()
    pipelineContextAwsSamManifests.updateStage = updateStage

    const { container } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}
        defaultFeatureFlagValues={{ NG_SVC_ENV_REDESIGN: true }}
      >
        <PipelineContext.Provider value={pipelineContextAwsSamManifests}>
          <AwsSamServiceSpecEditable
            factory={factory}
            initialValues={{
              isReadonlyServiceMode: false
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Check if required manifest sections are present then Click Delete button of AwsSamDirectory manifest
    const manifestContainer = screen.getByTestId('aws-sam-manifest-card')
    expect(
      within(manifestContainer).getByText('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')
    ).toBeInTheDocument()
    const deleteButtons = container.querySelectorAll('[data-icon="main-trash"]')
    expect(deleteButtons).toHaveLength(2)
    // expect(screen.getByText('AwsSamDirectory_Manifest')).toBeInTheDocument() // Ideally, this should work
    expect(screen.getByText('Values_Manifest')).toBeInTheDocument()
    const awsSamDirectoryManifestDeleteButton = deleteButtons[0]
    expect(awsSamDirectoryManifestDeleteButton).toBeInTheDocument()
    await userEvent.click(awsSamDirectoryManifestDeleteButton)

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgAwsSamDirectoryManifestDelete)
    })
    expect(screen.getByText('Values_Manifest')).toBeInTheDocument()
  })

  test('when stage is propagated from previous stage', async () => {
    const updateStage = jest.fn()
    pipelineContextAwsSamManifests.state.selectionState.selectedStageId = 'Stage_2'
    pipelineContextAwsSamManifests.updateStage = updateStage

    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextAwsSamManifests}>
          <AwsSamServiceSpecEditable
            factory={factory}
            initialValues={{
              isReadonlyServiceMode: false,
              setupModeType: setupMode.PROPAGATE,
              stageIndex: 1
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Click Edit button for Function Definition manifest
    const manifestContainer = screen.getByTestId('aws-sam-manifest-card')
    expect(
      within(manifestContainer).getByText('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')
    ).toBeInTheDocument()
    // continue with updating manifest
    expect(screen.getByText('Stage2_AwsSamDirectory_Manifest')).toBeInTheDocument()
    const editButtons = container.querySelectorAll('[data-icon="Edit"]')
    expect(editButtons).toHaveLength(1)
    const awsSamDirectoryManifestEditButton = editButtons[0]
    expect(awsSamDirectoryManifestEditButton).toBeInTheDocument()
    await userEvent.click(awsSamDirectoryManifestEditButton)

    await testAwsSamDirectoryManifestUpdate()

    await waitFor(() => {
      expect(updateStage).toHaveBeenCalledWith(updateStageArgForPropagatedStageWithAwsSamDirectoryManifest)
    })
  })

  test('when manifest internal object is not present in main manifest object', async () => {
    const updateStage = jest.fn()
    delete pipelineContextAwsSamManifests.state.pipeline.stages[1].stage.spec.serviceConfig.stageOverrides.manifests[0]
      .manifest
    pipelineContextAwsSamManifests.state.selectionState.selectedStageId = 'Stage_2'
    pipelineContextAwsSamManifests.updateStage = updateStage

    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextAwsSamManifests}>
          <AwsSamServiceSpecEditable
            factory={factory}
            initialValues={{
              isReadonlyServiceMode: false,
              setupModeType: setupMode.PROPAGATE,
              stageIndex: 1
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Check if required manifest sections are present
    // Click Edit button for Function Definition manifest
    const manifestContainer = screen.getByTestId('aws-sam-manifest-card')
    expect(
      within(manifestContainer).getByText('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')
    ).toBeInTheDocument()
    // continue with updating manifest
    expect(screen.queryByText('Stage2_AwsSamDirectory_Manifest')).not.toBeInTheDocument()
  })

  test('when deployment type is passed as a part of props', async () => {
    const updateStage = jest.fn()
    pipelineContextAwsSamManifests.state.selectionState.selectedStageId = 'Stage_1'
    pipelineContextAwsSamManifests.updateStage = updateStage

    render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <PipelineContext.Provider value={pipelineContextAwsSamManifests}>
          <AwsSamServiceSpecEditable
            factory={factory}
            initialValues={{
              isReadonlyServiceMode: false,
              deploymentType: ServiceDeploymentType.AwsSam
            }}
            readonly={false}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Click Edit button for Function Definition manifest
    const manifestContainer = screen.getByTestId('aws-sam-manifest-card')
    expect(
      within(manifestContainer).getByText('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')
    ).toBeInTheDocument()
  })
})
