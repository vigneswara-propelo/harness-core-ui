/* eslint-disable jest/no-commented-out-tests */
/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { cloneDeep } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import * as useFeatureEnabled from '@cf/hooks/useFeatureEnabled'
import mockGitSync from '@cf/utils/testData/data/mockGitSync'
import mockGovernance from '@cf/utils/testData/data/mockGovernance'
import { RenderFeatureFlag, RenderFeatureFlagProps } from '../components/RenderFeatureFlag'
import cellMock from './data/cellMock'

describe('RenderFeatureFlag', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const renderFlagComponent = (props: Partial<RenderFeatureFlagProps> = {}): RenderResult =>
    render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <RenderFeatureFlag
          gitSync={{ ...mockGitSync, isGitSyncEnabled: true }}
          toggleFeatureFlag={{
            on: jest.fn(),
            off: jest.fn(),
            loading: false,
            error: undefined
          }}
          cell={cellMock}
          governance={mockGovernance}
          refetchFlags={jest.fn()}
          {...props}
        />
      </TestWrapper>
    )

  test('it should disable the FF switch tooltip when there are no environments', async () => {
    renderFlagComponent({ numberOfEnvs: 0 })
    const switchToggle = screen.getByRole('checkbox')

    userEvent.hover(switchToggle)
    await waitFor(() => {
      const warningTooltip = screen.queryByText('cf.noEnvironment.title')
      expect(warningTooltip).toBeInTheDocument()
      expect(switchToggle).toBeDisabled()
    })
  })

  test('it should switch the tooltip appearance when there are environments', async () => {
    renderFlagComponent({ numberOfEnvs: 2 })
    const switchToggle = screen.getByRole('checkbox')
    await userEvent.click(switchToggle)

    const toggleFlagPopover = screen.getByRole('heading', { name: 'cf.featureFlags.turnOnHeading' })

    await waitFor(() => {
      const warningToolTip = screen.queryByText('cf.noEnvironment.message')
      expect(toggleFlagPopover).toBeInTheDocument()
      expect(warningToolTip).not.toBeInTheDocument()
    })
  })

  test('it should render the Flag name, description and Flag identifier', async () => {
    renderFlagComponent({ numberOfEnvs: 1 })

    expect(screen.getByText(cellMock.row.original.name)).toBeInTheDocument()
    expect(screen.getByText(cellMock.row.original.description)).toBeInTheDocument()
    expect(screen.getByText(cellMock.row.original.identifier)).toBeInTheDocument()
  })

  test('it should not render a tooltip and the toggle is disabled if the flag is archived', async () => {
    const archivedFeatureFlag = cloneDeep(cellMock)
    archivedFeatureFlag.row.original.archived = true

    renderFlagComponent({ numberOfEnvs: 1, cell: archivedFeatureFlag })

    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  test('it should disable the toggle if user does not have the correct tags', async () => {
    const flagsWithTags = cloneDeep(cellMock)
    flagsWithTags.row.original.tags = ['tag1']

    jest.spyOn(useFeatureEnabled, 'default').mockReturnValue({
      enabledByPlanEnforcement: true,
      featureEnabled: true,
      enabledByPermission: true,
      canEdit: true,
      canToggle: false
    })

    renderFlagComponent({ numberOfEnvs: 1, cell: flagsWithTags })

    expect(await screen.findByRole('button')).toBeDisabled()
  })
})
