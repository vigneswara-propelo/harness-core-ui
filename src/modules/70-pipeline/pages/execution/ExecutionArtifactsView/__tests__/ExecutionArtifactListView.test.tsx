/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RenderResult, render, screen, within } from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { useGetPolicyViolationsQuery } from '@harnessio/react-ssca-manager-client'
import routes from '@common/RouteDefinitions'
import { accountPathProps, executionPathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import mockImport from 'framework/utils/mockImport'
import executionDetails from './mocks/execution-with-artifacts.json'
import violationList from './mocks/violation-list.json'
import executionContext from './mocks/execution-context.json'
import ExecutionArtifactsView from '../ExecutionArtifactsView'
import { downloadBlob } from '../ArtifactsTable/ArtifactTableCells'
global.URL.createObjectURL = jest.fn()
global.URL.revokeObjectURL = jest.fn()

jest.useFakeTimers({ advanceTimers: true })

jest.mock('@harnessio/react-ssca-manager-client', () => ({
  useGetPolicyViolationsQuery: jest.fn().mockImplementation(() => {
    return { data: { content: violationList } }
  }),
  useDownloadSbomQuery: jest.fn().mockImplementation(() => {
    return { data: { content: { sbom: 'dummytext' } } }
  })
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('services/pipeline-ng', () => ({
  useGetExecutionDetailV2: jest.fn(() => ({
    refetch: jest.fn(),
    loading: false,
    data: executionDetails
  }))
}))

mockImport('@pipeline/context/ExecutionContext', {
  useExecutionContext: () => executionContext
})

const getModuleParams = (module = 'cd') => ({
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier',
  pipelineIdentifier: 'pipelineIdentifier',
  executionIdentifier: 'executionIdentifier',
  source: 'executions',
  module
})

const TEST_PATH = routes.toExecutionArtifactsView({
  ...accountPathProps,
  ...executionPathProps,
  ...pipelineModuleParams
})

const renderArtifactsTab = (
  module = 'ci',
  defaultFeatureFlagValues?: TestWrapperProps['defaultFeatureFlagValues']
): RenderResult =>
  render(
    <TestWrapper
      path={TEST_PATH}
      pathParams={getModuleParams(module)}
      defaultFeatureFlagValues={{
        SSCA_ENABLED: true,
        ...defaultFeatureFlagValues
      }}
    >
      <ExecutionArtifactsView />
    </TestWrapper>
  )

describe('ExecutionArtifactListView', () => {
  test('should have sbom download link for orchestration step', async () => {
    renderArtifactsTab()

    const rows = await screen.findAllByRole('row')
    const sbomOrchestrationRow = rows[1]
    expect(
      within(sbomOrchestrationRow).getByRole('link', {
        name: 'uday4vunnam/alpine:latest'
      })
    ).toBeInTheDocument()
  })

  test('should have violation count for enforcement step', async () => {
    renderArtifactsTab()

    const rows = await screen.findAllByRole('row')
    const sbomEnforcementRow = rows[2]
    expect(
      within(sbomEnforcementRow).getByRole('button', {
        name: '5'
      })
    ).toBeInTheDocument()
  })

  test('should show violation list view for enforcement step | search | sort', async () => {
    renderArtifactsTab('ci')
    const rows = await screen.findAllByRole('row')

    await userEvent.click(
      within(rows[2]).getByRole('button', {
        name: '5'
      })
    )
    expect(
      await screen.findByRole('heading', {
        name: 'pipeline.sbomPolicyViolations'
      })
    ).toBeInTheDocument()

    await userEvent.type(screen.getByRole('searchbox'), 'my search term')
    jest.runOnlyPendingTimers()
    expect(useGetPolicyViolationsQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        'enforcement-id': 'KaVYBdKZTFW9NM4scBh7gQ',
        org: 'orgIdentifier',
        project: 'projectIdentifier',
        queryParams: { limit: 20, order: 'ASC', page: 0, search_text: undefined, sort: 'name' }
      })
    )

    const supplier = await screen.findByText('pipeline.supplier')
    await userEvent.click(supplier)
    jest.runOnlyPendingTimers()
    expect(useGetPolicyViolationsQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryParams: expect.objectContaining({ order: 'DESC', sort: 'supplier' })
      })
    )
  })

  test('should invoke SSCA manager API on mount ', async () => {
    renderArtifactsTab('home')
    const rows = await screen.findAllByRole('row')

    await userEvent.click(
      within(rows[2]).getByRole('button', {
        name: '5'
      })
    )
    expect(
      await screen.findByRole('heading', {
        name: 'pipeline.sbomPolicyViolations'
      })
    ).toBeInTheDocument()

    expect(useGetPolicyViolationsQuery).toHaveBeenCalled()
  })

  test('should trigger the download with the correct URL and filename', () => {
    const createElementSpy = jest.spyOn(document, 'createElement')

    downloadBlob('Test content', 'test.json')

    expect(global.URL.createObjectURL).toHaveBeenCalled()
    expect(createElementSpy).toHaveBeenCalledWith('a')
    jest.runOnlyPendingTimers()
    expect(global.URL.revokeObjectURL).toHaveBeenCalled()
  })
})
