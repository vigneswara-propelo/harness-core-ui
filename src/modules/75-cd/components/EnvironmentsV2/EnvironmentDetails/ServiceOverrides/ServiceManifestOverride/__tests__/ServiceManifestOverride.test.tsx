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
  queryByAttribute,
  findByTestId,
  getByText,
  queryByText
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'
import { connectorsData } from '@modules/27-platform/connectors/pages/connectors/__tests__/mockData'
import { ServiceDeploymentType } from '@modules/70-pipeline/utils/stageHelpers'
import { updateManifestListFirstArgTasManifestArtifactBundle } from '@modules/70-pipeline/components/ManifestSelection/__tests__/helpers/helper'
import ServiceManifestOverride from '../ServiceManifestOverride'

const allowableTypes = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.RUNTIME,
  MultiTypeInputType.EXPRESSION
] as AllowedTypesWithRunTime[]

const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)
jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorsData.data.content[1], refetch: fetchConnectors, loading: false }
  }),
  useGetServiceV2: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() }))
}))

const testManifestStoreStepForTasManifest = async (
  portal: HTMLElement,
  storeNameToSelect: string,
  isConnectorAllowed: boolean
): Promise<void> => {
  const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

  await waitFor(() => expect(queryByValueAttribute('Github')).toBeInTheDocument())

  const Git = queryByValueAttribute('Git')
  expect(Git).toBeInTheDocument()
  const GitLab = queryByValueAttribute('GitLab')
  expect(GitLab).toBeInTheDocument()
  const Bitbucket = queryByValueAttribute('Bitbucket')
  expect(Bitbucket).toBeInTheDocument()
  const Harness = queryByValueAttribute('Harness')
  expect(Harness).toBeInTheDocument()
  const CustomRemote = queryByValueAttribute('CustomRemote')
  expect(CustomRemote).toBeInTheDocument()
  const ArtifactBundle = queryByValueAttribute('ArtifactBundle')
  expect(ArtifactBundle).toBeInTheDocument()

  const storeToSelect = queryByValueAttribute(storeNameToSelect)
  await userEvent.click(storeToSelect!)

  if (isConnectorAllowed) {
    const connnectorRefInput = await findByTestId(portal, /connectorRef/)
    expect(connnectorRefInput).toBeTruthy()
    await userEvent.click(connnectorRefInput!)

    const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[1] as HTMLElement
    const githubConnector1 = await findByText(connectorSelectorDialog, 'Git CTR')
    expect(githubConnector1).toBeTruthy()
    const githubConnector2 = await findByText(connectorSelectorDialog, 'Sample')
    expect(githubConnector2).toBeTruthy()
    await userEvent.click(githubConnector1)
    const applySelected = getByText(connectorSelectorDialog, 'entityReference.apply')
    await userEvent.click(applySelected)
    await waitFor(() => expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(1))
  }

  const continueButton = getByText(portal, 'continue').parentElement as HTMLElement
  await waitFor(() => expect(continueButton).not.toBeDisabled())
  await userEvent.click(continueButton)
}

const testTasManifestArtifactBundleLastStep = async (portal: HTMLElement): Promise<void> => {
  await waitFor(() => expect(getByText(portal, 'pipeline.manifestType.manifestIdentifier')).toBeInTheDocument())

  const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', portal, name)

  fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })

  const allDropdownIcons = portal.querySelectorAll('[data-icon="chevron-down"]')
  expect(allDropdownIcons).toHaveLength(2)
  const artifactBundleTypeDropDownIcon = allDropdownIcons[1]
  expect(artifactBundleTypeDropDownIcon).toBeInTheDocument()
  fireEvent.click(artifactBundleTypeDropDownIcon!)
  const zipBundleTypeItem = queryByText(portal, 'pipeline.phasesForm.packageTypes.zip')
  await waitFor(() => expect(zipBundleTypeItem).toBeInTheDocument())
  fireEvent.click(zipBundleTypeItem!)
  const artifactBundleTypeSelect = queryByNameAttribute('artifactBundleType') as HTMLInputElement
  expect(artifactBundleTypeSelect.value).toBe('pipeline.phasesForm.packageTypes.zip')

  const deployableUnitPathInput = queryByNameAttribute('deployableUnitPath')
  expect(deployableUnitPathInput).toBeInTheDocument()
  fireEvent.change(deployableUnitPathInput!, { target: { value: 'dup' } })

  const manifestPathInput = queryByNameAttribute('manifestPath')
  expect(manifestPathInput).toBeInTheDocument()
  fireEvent.change(manifestPathInput!, { target: { value: 'mp' } })

  const submitButton = getByText(portal, 'submit').parentElement as HTMLElement
  await userEvent.click(submitButton)
}

describe('ServiceManifestOverride tests', () => {
  test('should NOT show ArtifactBundle store for TasManifest service if FF is NOT true', async () => {
    const onSubmit = jest.fn()

    const { container } = render(
      <TestWrapper>
        <ServiceManifestOverride
          manifestOverrides={[]}
          handleManifestOverrideSubmit={onSubmit}
          removeManifestConfig={jest.fn()}
          isReadonly={false}
          expressions={[]}
          allowableTypes={allowableTypes}
          serviceType={ServiceDeploymentType.TAS}
        />
      </TestWrapper>
    )

    const addOverrideButton = await findByText(container, 'common.newName common.override')
    await userEvent.click(addOverrideButton)
    const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    const TasManifest = queryByAttribute('value', portal, 'TasManifest')
    await waitFor(() => expect(TasManifest).toBeInTheDocument())
    fireEvent.click(TasManifest!)
    const continueButton = getByText(portal, 'continue').parentElement as HTMLElement
    await waitFor(() => expect(continueButton).not.toBeDisabled())
    await userEvent.click(continueButton)

    const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

    await waitFor(() => expect(queryByValueAttribute('Github')).toBeInTheDocument())
    const Git = queryByValueAttribute('Git')
    expect(Git).toBeInTheDocument()
    const GitLab = queryByValueAttribute('GitLab')
    expect(GitLab).toBeInTheDocument()
    const Bitbucket = queryByValueAttribute('Bitbucket')
    expect(Bitbucket).toBeInTheDocument()
    const Harness = queryByValueAttribute('Harness')
    expect(Harness).toBeInTheDocument()
    const CustomRemote = queryByValueAttribute('CustomRemote')
    expect(CustomRemote).toBeInTheDocument()
    const ArtifactBundle = queryByValueAttribute('ArtifactBundle')
    expect(ArtifactBundle).not.toBeInTheDocument() // Because FF is not turned on
  })

  test('should show ArtifactBundle store for TasManifest service if FF is true', async () => {
    const onSubmit = jest.fn()

    const { container } = render(
      <TestWrapper defaultFeatureFlagValues={{ CDS_ENABLE_TAS_ARTIFACT_AS_MANIFEST_SOURCE_NG: true }}>
        <ServiceManifestOverride
          manifestOverrides={[]}
          handleManifestOverrideSubmit={onSubmit}
          removeManifestConfig={jest.fn()}
          isReadonly={false}
          expressions={[]}
          allowableTypes={allowableTypes}
          serviceType={ServiceDeploymentType.TAS}
        />
      </TestWrapper>
    )

    const addOverrideButton = await findByText(container, 'common.newName common.override')
    await userEvent.click(addOverrideButton)

    const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    const TasManifest = queryByAttribute('value', portal, 'TasManifest')
    await waitFor(() => expect(TasManifest).toBeInTheDocument())
    fireEvent.click(TasManifest!)
    const continueButton = getByText(portal, 'continue').parentElement as HTMLElement
    await waitFor(() => expect(continueButton).not.toBeDisabled())
    await userEvent.click(continueButton)

    await testManifestStoreStepForTasManifest(portal, 'ArtifactBundle', false)

    // Fill in required field and submit manifest
    await testTasManifestArtifactBundleLastStep(portal)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(updateManifestListFirstArgTasManifestArtifactBundle, 0)
    })
  })
})
