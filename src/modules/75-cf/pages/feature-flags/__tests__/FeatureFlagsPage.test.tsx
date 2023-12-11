/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, RenderResult, screen, act, getAllByRole, getAllByTestId } from '@testing-library/react'
import { cloneDeep } from 'lodash-es'
import userEvent from '@testing-library/user-event'
import * as cfServices from 'services/cf'
import * as cdServices from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import mockEnvironments from '@cf/pages/environments/__tests__/mockEnvironments'
import FeatureFlagsPage from '../FeatureFlagsPage'
import mockFeatureFlags from './mockFeatureFlags'
import mockTagsPayload from './data/mockTagsPayload'
import mockGetAllEnvironmentsFlags from './mockGetAllEnvironmentsFlags'

const renderComponent = (): RenderResult =>
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{
        accountId: 'dummy',
        orgIdentifier: 'dummy',
        projectIdentifier: 'dummy'
      }}
      defaultFeatureFlagValues={{
        FFM_3938_STALE_FLAGS_ACTIVE_CARD_HIDE_SHOW: true,
        FFM_6683_ALL_ENVIRONMENTS_FLAGS: true,
        FFM_7258_INTERCOM_VIDEO_LINKS: true,
        FFM_8344_FLAG_CLEANUP: true,
        FFM_8184_FEATURE_FLAG_TAGGING: true
      }}
    >
      <FeatureFlagsPage />
    </TestWrapper>
  )

describe('FeatureFlagsPage', () => {
  const useGetAllTagsMock = jest.spyOn(cfServices, 'useGetAllTags')
  const useGetFeaturesMetricsMock = jest.spyOn(cfServices, 'useGetFeatureMetrics')
  const useGetAllFeaturesMock = jest.spyOn(cfServices, 'useGetAllFeatures')
  const useGetProjectFlagsMock = jest.spyOn(cfServices, 'useGetProjectFlags')

  const useGetEnvironmentListForProject = jest.spyOn(cdServices, 'useGetEnvironmentListForProject')

  const mockEnvs = (includeEnvs = true): void => {
    const data = cloneDeep(mockEnvironments)
    let newLocation = `path?activeEnvironment=Mock_Environment`

    if (!includeEnvs) {
      data.data.content = []
      newLocation = 'path'
    }

    useGetEnvironmentListForProject.mockReturnValue({
      data,
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    window.location.hash = newLocation
  }

  beforeEach(() => {
    jest.useFakeTimers({ advanceTimers: true })
    jest.runAllTimers()

    useGetAllFeaturesMock.mockReturnValue({
      data: mockFeatureFlags,
      refetch: jest.fn(),
      error: null,
      loading: false
    } as any)

    useGetFeaturesMetricsMock.mockReturnValue({ data: [], refetch: jest.fn(), error: null, loading: false } as any)
    useGetAllTagsMock.mockReturnValue({ data: [], refetch: jest.fn(), loading: false, error: null } as any)

    jest.mock('@cf/hooks/useGitSync', () => ({
      useGitSync: jest.fn(() => ({
        gitRepoDetails: undefined,
        getGitSyncFormMeta: jest.fn().mockReturnValue({
          gitSyncInitialValues: {},
          gitSyncValidationSchema: {}
        }),
        isAutoCommitEnabled: false,
        isGitSyncEnabled: false,
        handleAutoCommit: jest.fn()
      }))
    }))

    jest.clearAllMocks()
  })

  test('it should render loading correctly', async () => {
    useGetEnvironmentListForProject.mockReturnValue({
      loading: true,
      refetch: jest.fn(),
      error: null,
      data: undefined
    } as any)

    useGetAllFeaturesMock.mockReturnValue({ loading: true, refetch: jest.fn(), error: null, data: undefined } as any)

    renderComponent()

    expect(document.querySelector('[data-icon="steps-spinner"]')).toBeDefined()
  })

  test('it should render data correctly and call metrics', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getAllByText(mockFeatureFlags.features[0].name)).toBeDefined()
      expect(screen.getAllByText(mockFeatureFlags.features[1].name)).toBeDefined()
      expect(screen.getByRole('button', { name: 'cf.featureFlags.setupGitSync' })).toBeVisible()
      expect(useGetFeaturesMetricsMock).toHaveBeenCalled()
    })
  })

  test('it should have an option for "All Environments" in the EnvironmentSelect dropdown', async () => {
    renderComponent()

    const environmentSelect = screen.getByRole('textbox', { name: 'cf.shared.selectEnvironment' })

    expect(environmentSelect).toHaveValue('foobar')

    await userEvent.click(environmentSelect)

    await waitFor(() => {
      expect(screen.getByText('common.allEnvironments')).toBeInTheDocument()
      expect(screen.getByText('QB')).toBeInTheDocument()
    })
  })

  test('it should display a link to FF docs and a video help link', async () => {
    renderComponent()

    expect(screen.getByRole('link', { name: /cf.shared.readDocumentation/ })).toHaveAttribute(
      'href',
      'https://developer.harness.io/docs/feature-flags/ff-onboarding/cf-feature-flag-overview'
    )
    expect(screen.getByRole('link', { name: /cf.featureFlags.flagVideoLabel/ })).toBeInTheDocument()
  })

  test('it should show All Environments Flags view on click of "All Environments" in the EnvironmentSelect dropdown', async () => {
    const refetchProjectsFlags = jest.fn()

    useGetProjectFlagsMock.mockReturnValue({
      loading: false,
      data: mockGetAllEnvironmentsFlags,
      refetch: refetchProjectsFlags,
      error: null
    } as any)

    renderComponent()

    const environmentSelect = screen.getByRole('textbox', { name: 'cf.shared.selectEnvironment' })

    expect(environmentSelect).toHaveValue('foobar')

    await userEvent.click(environmentSelect)

    expect(refetchProjectsFlags).not.toHaveBeenCalled()
    expect(screen.getByText('common.allEnvironments')).toBeInTheDocument()
    expect(screen.getByText('QB')).toBeInTheDocument()

    await userEvent.click(screen.getByText('common.allEnvironments'))

    expect(refetchProjectsFlags).toHaveBeenCalled()
    expect(screen.getAllByText('cf.environments.nonProd')).toHaveLength(17)
    expect(screen.getAllByText('cf.environments.prod')).toHaveLength(17)
  })

  test('it should go to edit page by clicking a row', async () => {
    renderComponent()

    await act(async () => {
      await userEvent.click(
        document.getElementsByClassName('TableV2--row TableV2--card TableV2--clickable')[0] as HTMLElement
      )
    })

    expect(screen.getByTestId('location')).toHaveTextContent('dummy/feature-flags/hello_world')
  })

  test('it should go to edit page by clicking edit', async () => {
    renderComponent()

    await act(async () => {
      await userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLElement)
      await userEvent.click(document.querySelector('[icon="edit"]') as HTMLElement)
    })

    expect(screen.getByTestId('location')).toHaveTextContent('feature-flags/hello_world')
  })

  test('it should render error correctly when api fails to fetch environments list', async () => {
    const message = 'ERROR OCCURS'

    // Mock setTimeout
    const localGlobal = global as Record<string, any>
    localGlobal.window = Object.create(window)
    localGlobal.window.setTimeout = jest.fn()

    useGetEnvironmentListForProject.mockReturnValue({
      loading: false,
      refetch: jest.fn(),
      error: { message },
      data: undefined
    } as any)

    useGetAllFeaturesMock.mockReturnValue({ data: undefined, refetch: jest.fn(), loading: false, error: null } as any)

    renderComponent()

    expect(screen.getByText(message)).toBeInTheDocument()
  })

  test('it should go to Feature Flag details page on click of an environment in All Environments view', async () => {
    const refetchProjectFlags = jest.fn()

    useGetProjectFlagsMock.mockReturnValue({
      loading: false,
      data: mockGetAllEnvironmentsFlags,
      refetch: refetchProjectFlags,
      error: null
    } as any)

    renderComponent()

    const environmentSelect = screen.getByRole('textbox', { name: 'cf.shared.selectEnvironment' })

    expect(environmentSelect).toHaveValue('foobar')

    await userEvent.click(environmentSelect)

    expect(refetchProjectFlags).not.toHaveBeenCalled()
    expect(screen.getByText('common.allEnvironments')).toBeInTheDocument()

    await userEvent.click(screen.getByText('common.allEnvironments'))

    expect(refetchProjectFlags).toHaveBeenCalled()
    expect(screen.getAllByText('cf.environments.nonProd')).toHaveLength(17)
    expect(screen.getAllByText('cf.environments.prod')).toHaveLength(17)

    const rows = screen.getAllByRole('row')

    // Feature Flag 1st row
    const flag1Columns = getAllByRole(rows[1], 'cell')
    const envTypeContainers = getAllByTestId(flag1Columns[2], 'environmentTypeContainer')
    const nonProdEnvironments = getAllByTestId(envTypeContainers[0], 'flagEnvironmentStatus')

    // PreProduction environments
    expect(envTypeContainers[0]).toHaveTextContent('cf.environments.nonProd')
    expect(nonProdEnvironments[0]).toHaveTextContent('foobarENABLEDLABEL')
    expect(nonProdEnvironments[1]).toHaveTextContent('QBENABLEDLABEL')

    await userEvent.click(nonProdEnvironments[1])

    expect(screen.getByTestId('location')).toHaveTextContent('dummy/feature-flags/hello_world?activeEnvironment=QB')
  })

  describe('FilterCards', () => {
    test('it should not render if there is no active Environment', async () => {
      mockEnvs(false)
      renderComponent()

      expect(screen.queryAllByTestId('filter-card')).toHaveLength(0)
    })

    test('it should render when Feature Flags exist and there is an active Environment', async () => {
      mockEnvs()
      renderComponent()

      expect(screen.queryAllByTestId('filter-card')).toHaveLength(7)
    })

    test('it should not render if there is an active Environment but no flags', async () => {
      mockEnvs()

      useGetAllFeaturesMock.mockReturnValue({ data: undefined, refetch: jest.fn(), loading: false, error: null } as any)

      renderComponent()

      expect(screen.queryAllByTestId('filter-card')).toHaveLength(0)
    })

    test('it should render if there are only archived flags', async () => {
      mockEnvs()

      renderComponent()

      expect(screen.getAllByTestId('filter-card')).toHaveLength(7)
    })
  })

  describe('StaleFlagCleanup', () => {
    test('it should render checkboxes in all rows when flag cleanup is on and potentially stale flags filtered', async () => {
      renderComponent()

      await userEvent.click(screen.getByText('cf.flagFilters.potentiallyStale'))

      await waitFor(() => {
        expect(screen.getByTestId('selectAllStale')).toBeInTheDocument()
        expect(screen.getAllByRole('checkbox', { name: 'cf.staleFlagAction.checkStaleFlag' }).length).toEqual(
          mockFeatureFlags.itemCount
        )
      })
    })

    test('it should select all flags when the select all checkbox is checked', async () => {
      renderComponent()

      await userEvent.click(screen.getByText('cf.flagFilters.potentiallyStale'))

      const selectAll = screen.getByTestId('selectAllStale')
      const allCheckboxes = screen.getAllByRole('checkbox', { name: 'cf.staleFlagAction.checkStaleFlag' })

      await userEvent.click(selectAll)

      await waitFor(() => {
        expect(selectAll).toBeChecked()
      })

      await waitFor(() => {
        allCheckboxes.forEach(checkbox => {
          expect(checkbox).toBeChecked()
        })
      })

      //deselect all
      await userEvent.click(selectAll)

      await waitFor(() => {
        allCheckboxes.forEach(checkbox => {
          expect(checkbox).not.toBeChecked()
        })
      })
    })
  })

  describe('TagFilter', () => {
    test('it should call the feature flags api with searched tag when the user selects a tag in the tag filter', async () => {
      useGetAllTagsMock.mockReturnValue({
        data: mockTagsPayload,
        loading: false,
        error: null,
        refetch: jest.fn()
      } as any)

      renderComponent()

      const tagsDropdown = screen.getByText('tagsLabel')
      expect(tagsDropdown).toBeInTheDocument()

      await userEvent.click(tagsDropdown)

      const TAG1 = mockTagsPayload.tags[0].name

      await userEvent.type(screen.getAllByRole('searchbox')[1], TAG1)
      expect(screen.getAllByRole('searchbox')[1]).toHaveValue(TAG1)

      await userEvent.click(screen.getByText(TAG1))

      await waitFor(() => {
        expect(useGetAllFeaturesMock).toHaveBeenCalledWith(
          expect.objectContaining({
            queryParams: expect.objectContaining({ tags: mockTagsPayload.tags[0].identifier })
          })
        )
      })
    })

    test('it should be disabled if tags are loading', async () => {
      useGetAllTagsMock.mockReturnValue({ data: undefined, refetch: jest.fn(), loading: true } as any)

      renderComponent()

      expect(
        document.querySelector('[class="bp3-popover-wrapper MultiSelectDropDown--main MultiSelectDropDown--disabled"]')
      ).toBeInTheDocument()
    })

    test('it should be disabled if it fails to fetch tags', async () => {
      useGetAllTagsMock.mockReturnValue({
        data: undefined,
        refetch: jest.fn(),
        loading: false,
        error: 'ERROR FETCHING TAGS'
      } as any)

      renderComponent()

      expect(
        document.querySelector('[class="bp3-popover-wrapper MultiSelectDropDown--main MultiSelectDropDown--disabled"]')
      ).toBeInTheDocument()
    })

    test('it should call the tags endpoint when a tag is being searched', async () => {
      useGetAllTagsMock.mockReturnValue({
        data: mockTagsPayload,
        loading: false,
        error: null,
        refetch: jest.fn()
      } as any)

      renderComponent()

      await userEvent.click(screen.getByText('tagsLabel'))

      const searchedTag = 'tag1'

      await userEvent.type(screen.getAllByRole('searchbox')[1], searchedTag)

      await waitFor(() =>
        expect(useGetAllTagsMock).toHaveBeenCalledWith(
          expect.objectContaining({ queryParams: expect.objectContaining({ tagIdentifierFilter: searchedTag }) })
        )
      )

      await waitFor(() => expect(screen.getByText(searchedTag)).toBeInTheDocument())

      for (let i = 1; i < mockTagsPayload.tags.length; i++) {
        await waitFor(() => expect(screen.queryByText(mockTagsPayload.tags[i].name)).not.toBeInTheDocument())
      }
    })
  })
})
