/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { GetDataError } from 'restful-react'
import { render, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Failure, SecretSpecDTO } from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import routes from '@common/RouteDefinitions'
import { Connectors } from '@platform/connectors/constants'
import { getFullRepoName } from '@ci/utils/HostedBuildsUtils'
import mockImport from 'framework/utils/mockImport'
import { InfraProvisioningWizard } from '../InfraProvisioningWizard'
import { InfraProvisiongWizardStepId } from '../Constants'
import { repos, gitnessRepos } from '../mocks/repositories'

jest.mock('services/pipeline-ng', () => ({
  createPipelineV2Promise: jest.fn().mockImplementation(() =>
    Promise.resolve({
      status: 'SUCCESS',
      data: {
        identifier: 'Default_Pipeline'
      }
    })
  ),
  useCreateTrigger: jest.fn().mockImplementation(() =>
    Promise.resolve({
      status: 'SUCCESS'
    })
  )
}))

const updateConnector = jest.fn()
const createConnector = jest.fn()
const cancelRepositoriesFetch = jest.fn()
let repoFetchError: GetDataError<Failure | Error> | null = null
jest.mock('services/cd-ng', () => ({
  useProvisionResourcesForCI: jest.fn().mockImplementation(() =>
    Promise.resolve({
      status: 'SUCCESS'
    })
  ),
  useCreateDefaultScmConnector: jest.fn().mockImplementation(() =>
    Promise.resolve({
      status: 'SUCCESS'
    })
  ),
  useGetListOfAllReposByRefConnector: jest.fn().mockImplementation(() => {
    return {
      data: { data: repos, status: 'SUCCESS' },
      refetch: jest.fn(),
      error: repoFetchError,
      loading: false,
      cancel: cancelRepositoriesFetch
    }
  }),
  useUpdateConnector: jest.fn().mockImplementation(() => ({ mutate: updateConnector })),
  useCreateConnector: jest.fn().mockImplementation(() => ({ mutate: createConnector }))
}))

jest.mock('services/code', () => ({
  useListRepos: jest.fn().mockImplementation(() => {
    return {
      data: gitnessRepos,
      refetch: jest.fn(),
      error: null,
      loading: false,
      cancel: jest.fn()
    }
  })
}))

const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateGroupsNGV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return {
      data: {
        resource: {
          delegateGroupDetails: [{ delegateGroupIdentifier: '_harness_kubernetes_delegate', activelyConnected: false }]
        }
      },
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))

const connectorData = {
  name: 'Github',
  identifier: 'Github',
  type: Connectors.GITHUB,
  spec: {
    url: 'https://github.com',
    validationRepo: 'harness/buildah',
    authentication: {
      type: 'Http',
      spec: {
        type: 'UsernameToken',
        spec: {
          username: 'oauth2',
          usernameRef: null,
          tokenRef: 'account.Github_Access_Token'
        }
      }
    },
    apiAccess: {
      type: 'Token',
      spec: {
        tokenRef: 'account.Github_Access_Token'
      }
    }
  }
}

const connectorSecret = {
  type: 'SecretText' as 'SecretFile' | 'SecretText' | 'SSHKey' | 'WinRmCredentials',
  name: 'k8serviceToken',
  identifier: 'k8serviceToken',
  tags: {},
  description: '',
  spec: { secretManagerIdentifier: 'harnessSecretManager', valueType: 'Inline' } as SecretSpecDTO
}
const precursonData = {
  preSelectedGitConnector: connectorData,
  connectorsEligibleForPreSelection: [connectorData],
  secretForPreSelectedConnector: connectorSecret
}

const pathParams = { accountId: 'accountId', orgIdentifier: 'orgId', projectIdentifier: 'projectId' }

describe('Test SelectRepository component', () => {
  test('Initial render', async () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CODE_ENABLED: false
    })
    const { container, getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <InfraProvisioningWizard
          lastConfiguredWizardStepId={InfraProvisiongWizardStepId.SelectRepository}
          precursorData={precursonData}
        />
      </TestWrapper>
    )
    const configurePipelineBtn = getByText('next: ci.getStartedWithCI.configurePipeline')
    await act(async () => {
      fireEvent.click(configurePipelineBtn)
    })
    // Schema validation error should show up for if Repository is not selected
    const repositoryValidationError = container.querySelector(
      'div[class*="FormError--errorDiv"][data-name="repository"]'
    )
    expect(repositoryValidationError).toBeInTheDocument()
    expect(getByText('common.getStarted.plsChoose')).toBeTruthy()
    const testRepoName = getFullRepoName(repos[1])
    const testRepository = getByText(testRepoName)
    expect(testRepository).toBeInTheDocument()

    const repositorySearch = container.querySelector(
      'input[placeholder="common.getStarted.searchRepo"]'
    ) as HTMLInputElement
    expect(repositorySearch).toBeTruthy()
    await act(async () => {
      fireEvent.change(repositorySearch!, { target: { value: testRepoName } })
    })
    expect(getByText(testRepoName)).toBeInTheDocument()
  })

  test('Initial render with CODE_ENABLED', async () => {
    mockImport('@common/hooks/useFeatureFlag', {
      useFeatureFlags: () => ({ CODE_ENABLED: true })
    })
    const { container, getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <InfraProvisioningWizard lastConfiguredWizardStepId={InfraProvisiongWizardStepId.SelectRepository} />
      </TestWrapper>
    )
    const configurePipelineBtn = getByText('next: ci.getStartedWithCI.configurePipeline')
    await userEvent.click(configurePipelineBtn)
    // Schema validation error should show up for if Repository is not selected
    const repositoryValidationError = container.querySelector(
      'div[class*="FormError--errorDiv"][data-name="repository"]'
    )
    expect(repositoryValidationError).toBeInTheDocument()
    expect(getByText('common.getStarted.plsChoose')).toBeTruthy()
    const testRepoName = gitnessRepos[1].uid
    const testRepository = getByText(testRepoName)
    expect(testRepository).toBeInTheDocument()
    await userEvent.click(testRepository)
    const repositorySearch = container.querySelector(
      'input[placeholder="common.getStarted.searchRepo"]'
    ) as HTMLInputElement
    expect(repositorySearch).toBeTruthy()
    await act(async () => {
      fireEvent.change(repositorySearch!, { target: { value: testRepoName } })
    })
    expect(getByText(testRepoName)).toBeInTheDocument()
  })

  const routesToPipelineStudio = jest.spyOn(routes, 'toPipelineStudio')
  test('Should not create a pipeline if a repository is selected and user clicks on next without successful Test connection', async () => {
    mockImport('@common/hooks/useFeatureFlag', {
      useFeatureFlags: () => ({ CODE_ENABLED: false })
    })
    const { getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <InfraProvisioningWizard
          lastConfiguredWizardStepId={InfraProvisiongWizardStepId.SelectRepository}
          precursorData={precursonData}
        />
      </TestWrapper>
    )
    const testRepoName = getFullRepoName(repos[1])
    const testRepository = getByText(testRepoName)
    expect(testRepository).toBeInTheDocument()
    await userEvent.click(testRepository)
    const configurePipelineBtn = getByText('next: ci.getStartedWithCI.configurePipeline')
    await userEvent.click(configurePipelineBtn)
    expect(routesToPipelineStudio).not.toHaveBeenCalled()
  })

  test('Should show error for api failure', async () => {
    repoFetchError = {
      message: 'Failed to fetch',
      data: { responseMessages: [{ level: 'ERROR', message: 'Failed to fetch' }] } as any,
      status: 502
    }
    mockImport('@common/hooks/useFeatureFlag', {
      useFeatureFlags: () => ({ CODE_ENABLED: false })
    })
    const { getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <InfraProvisioningWizard lastConfiguredWizardStepId={InfraProvisiongWizardStepId.SelectRepository} />
      </TestWrapper>
    )
    expect(getByText('Failed to fetch')).toBeInTheDocument()
    expect(routesToPipelineStudio).not.toHaveBeenCalled()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Should show Clone codebase switch on by default', async () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <InfraProvisioningWizard lastConfiguredWizardStepId={InfraProvisiongWizardStepId.SelectRepository} />
      </TestWrapper>
    )

    const cloneCodebaseToggle = container.querySelector('input[data-id="enable-clone-codebase-switch"]') as HTMLElement
    expect(cloneCodebaseToggle).toBeChecked()
    await userEvent.click(cloneCodebaseToggle)
    expect(cloneCodebaseToggle).not.toBeChecked()
    expect(cancelRepositoriesFetch).toBeCalled()
    const calloutElement = getByText('ci.getStartedWithCI.createPipelineWithOtherOption')
    expect(calloutElement).toBeInTheDocument()
  })
})
