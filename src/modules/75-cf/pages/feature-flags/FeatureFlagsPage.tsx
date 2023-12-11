/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useMemo, useCallback, useEffect, useRef } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  Container,
  ExpandingSearchInput,
  ExpandingSearchInputHandle,
  Pagination,
  MultiSelectOption
} from '@harness/uicore'
import { defer } from 'lodash-es'
import {
  FeatureMetric,
  GetAllFeaturesQueryParams,
  GetFeatureMetricsQueryParams,
  useDeleteFeatureFlag,
  useGetAllFeatures,
  useGetFeatureMetrics,
  useGetAllTags
} from 'services/cf'
import { useStrings } from 'framework/strings'
import { useToggleFeatureFlag } from '@cf/hooks/useToggleFeatureFlag'
import ListingPageTemplate from '@cf/components/ListingPageTemplate/ListingPageTemplate'
import { useEnvironmentSelectV2 } from '@cf/hooks/useEnvironmentSelectV2'
import { CFEnvironmentSelect } from '@cf/components/CFEnvironmentSelect/CFEnvironmentSelect'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { CF_DEFAULT_PAGE_SIZE } from '@cf/utils/CFUtils'
import FlagDialog from '@cf/components/CreateFlagDialog/FlagDialog'
import GitSyncActions from '@cf/components/GitSyncActions/GitSyncActions'
import { useGovernance } from '@cf/hooks/useGovernance'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useQueryParamsState } from '@common/hooks/useQueryParamsState'
import { useFFGitSyncContext } from '@cf/contexts/ff-git-sync-context/FFGitSyncContext'
import type { FilterProps } from '@cf/components/TableFilters/TableFilters'
import routes from '@common/RouteDefinitions'
import { FeatureActions } from '@common/constants/TrackingConstants'
import { FlagTableFilters } from './components/FlagTableFilters'
import { NoFeatureFlags } from './components/NoFeatureFlags'
import AllEnvironmentsFlagsListing from './components/AllEnvironmentsFlagsListing'
import FeatureFlagsListing from './components/FeatureFlagsListing'
import { StaleFlagActions } from './components/StaleFlagActions/StaleFlagActions'
import { useIsStaleFlagsView } from './hooks/useIsStaleFlagsView'
import StaleFlagsForm from './components/StaleFlagActions/StaleFlagsForm'
import TagFilter from './components/TagFilter'
import css from './FeatureFlagsPage.module.scss'

const FeatureFlagsPage: FC = () => {
  const { projectIdentifier, orgIdentifier, accountId: accountIdentifier } = useParams<Record<string, string>>()
  const { activeEnvironment: environmentIdentifier, withActiveEnvironment } = useActiveEnvironment()
  const history = useHistory()
  const searchRef = useRef<ExpandingSearchInputHandle>({} as ExpandingSearchInputHandle)

  const [pageNumber, setPageNumber] = useQueryParamsState('page', 0)
  const [searchTerm, setSearchTerm] = useQueryParamsState('search', '')
  const [tagSearchTerm, setTagSearchTerm] = useQueryParamsState('tagIdentifierFilter', '')
  const [flagFilter, setFlagFilter] = useQueryParamsState<Optional<FilterProps>>('filter', {})
  const [tagFilter, setTagFilter] = useQueryParamsState<MultiSelectOption[]>('tag', [])

  const flatTagsFilter = JSON.stringify(tagFilter)

  const queryParams = useMemo<GetAllFeaturesQueryParams | GetFeatureMetricsQueryParams>(() => {
    return {
      projectIdentifier,
      environmentIdentifier,
      accountIdentifier,
      orgIdentifier,
      pageSize: CF_DEFAULT_PAGE_SIZE,
      pageNumber,
      metrics: false,
      flagCounts: true,
      name: searchTerm,
      summary: true,
      tags: tagFilter.map(t => t.value).join(',') || undefined,
      [flagFilter.queryProps?.key]: flagFilter.queryProps?.value
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    projectIdentifier,
    environmentIdentifier,
    accountIdentifier,
    orgIdentifier,
    pageNumber,
    searchTerm,
    flagFilter.queryProps?.key,
    flagFilter.queryProps?.value,
    flatTagsFilter
  ])

  const {
    data: features,
    loading: flagsLoading,
    error: flagsError,
    refetch: refetchFlags
  } = useGetAllFeatures({
    queryParams,
    lazy: true
  })

  const { data: featureMetrics, loading: featureMetricsLoading } = useGetFeatureMetrics({
    queryParams: {
      ...queryParams,
      environmentIdentifier: environmentIdentifier
    }
  })

  const {
    EnvironmentSelect,
    loading: envsLoading,
    error: envsError,
    refetch: refetchEnvironments,
    environments,
    projectFlags,
    refetchProjectFlags
  } = useEnvironmentSelectV2({
    selectedEnvironmentIdentifier: environmentIdentifier,
    allowAllOption: true,
    searchTerm
  })

  const {
    data: tagsData,
    error: tagsError,
    loading: tagsLoading
  } = useGetAllTags({
    queryParams: {
      projectIdentifier,
      environmentIdentifier,
      accountIdentifier,
      orgIdentifier,
      tagIdentifierFilter: tagSearchTerm
    },
    debounce: 250
  })

  const toggleFeatureFlag = useToggleFeatureFlag({
    accountIdentifier,
    orgIdentifier,
    projectIdentifier,
    environmentIdentifier
  })

  const deleteFlag = useDeleteFeatureFlag({ queryParams })

  const { getString } = useStrings()

  const gitSync = useFFGitSyncContext()
  const governance = useGovernance()

  const loading = flagsLoading || envsLoading
  const gitSyncing = toggleFeatureFlag.loading || deleteFlag.loading
  const error =
    flagsError || envsError || deleteFlag.error || (toggleFeatureFlag.error && !governance.governanceError) || tagsError

  const onSearchInputChanged = useCallback(
    name => {
      defer(() => setSearchTerm(name))
      defer(() => setPageNumber(0))
    },
    [setSearchTerm, setPageNumber]
  )

  const handleTagSearch = useCallback(
    tagSearchString => {
      setTagSearchTerm(tagSearchString)
    },
    [setTagSearchTerm]
  )

  useEffect(() => {
    if (projectFlags) {
      refetchProjectFlags()
    } else {
      refetchFlags()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams])

  const emptyFeatureFlags = !features?.features?.length
  // use emptyFeatureFlags below as temp fallback to ensure FilterCards still display in case featureCounts is unavailable
  const hasFeatureFlags =
    !!features?.featureCounts?.totalFeatures || !emptyFeatureFlags || !!features?.featureCounts?.totalArchived

  const title = getString('featureFlagsText')
  const { FFM_8344_FLAG_CLEANUP, FFM_8184_FEATURE_FLAG_TAGGING } = useFeatureFlags()

  const showFilterCards = hasFeatureFlags && environmentIdentifier

  const onClearFilter = (): void => {
    defer(() => setFlagFilter({}))
  }

  const onClearTagFilter = (): void => {
    defer(() => setTagFilter([]))
  }

  const onClearSearch = (): void => searchRef.current.clear()

  const onRowClick = useCallback(
    (flagId: string): void => {
      history.push(
        withActiveEnvironment(
          routes.toCFFeatureFlagsDetail({
            orgIdentifier: orgIdentifier as string,
            projectIdentifier: projectIdentifier as string,
            featureFlagIdentifier: flagId,
            accountId: accountIdentifier
          })
        )
      )
    },
    [withActiveEnvironment, orgIdentifier, projectIdentifier, accountIdentifier, history]
  )

  const isStaleFlagsView = useIsStaleFlagsView()

  return (
    <StaleFlagsForm flags={features?.features}>
      <ListingPageTemplate
        title={title}
        titleTooltipId="ff_ffListing_heading"
        headerContent={!!environments?.length && <CFEnvironmentSelect component={<EnvironmentSelect />} />}
        docsURL="https://developer.harness.io/docs/feature-flags/ff-onboarding/cf-feature-flag-overview"
        videoHelp={{ trackingConst: FeatureActions.FlagsVideoHelp, label: getString('cf.featureFlags.flagVideoLabel') }}
        toolbar={
          hasFeatureFlags && (
            <>
              <div className={css.leftToolbar}>
                <FlagDialog environment={environmentIdentifier} tags={tagsData?.tags || []} tagsError={tagsError} />
                <GitSyncActions isLoading={gitSync.isGitSyncActionsEnabled && (gitSync.gitSyncLoading || gitSyncing)} />
              </div>
              <div className={css.rightToolbar}>
                {FFM_8184_FEATURE_FLAG_TAGGING && (
                  <TagFilter
                    tagsData={tagsData?.tags || []}
                    onFilterChange={setTagFilter}
                    tagFilter={tagFilter}
                    disabled={!!tagsError || !!tagsLoading}
                    onTagSearch={handleTagSearch}
                  />
                )}
                <ExpandingSearchInput
                  ref={searchRef}
                  alwaysExpanded
                  name="findFlag"
                  placeholder={getString('search')}
                  onChange={onSearchInputChanged}
                  defaultValue={searchTerm}
                />
              </div>
            </>
          )
        }
        pagination={
          !emptyFeatureFlags && (
            <Pagination
              itemCount={projectFlags ? projectFlags.itemCount : features?.itemCount || 0}
              pageSize={CF_DEFAULT_PAGE_SIZE}
              pageCount={projectFlags ? projectFlags.pageCount : features?.pageCount || 0}
              pageIndex={pageNumber}
              gotoPage={setPageNumber}
              showPagination
              hidePageNumbers={projectFlags ? projectFlags.pageCount > 1000 : (features?.pageCount || 0) > 1000}
            />
          )
        }
        footer={
          FFM_8344_FLAG_CLEANUP &&
          isStaleFlagsView && <StaleFlagActions flags={features?.features} onAction={() => refetchFlags()} />
        }
        loading={loading}
        error={error}
        retryOnError={() => {
          setPageNumber(0)
          refetchEnvironments()
          refetchFlags()
        }}
      >
        {showFilterCards && !projectFlags && (
          <Container padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}>
            <FlagTableFilters
              features={features}
              currentFilter={flagFilter}
              updateTableFilter={currentFilter => {
                defer(() => setPageNumber(0))
                defer(() => setFlagFilter(currentFilter))
              }}
            />
          </Container>
        )}
        {!emptyFeatureFlags || !!projectFlags?.flags?.length ? (
          <Container padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}>
            {projectFlags && !!environments?.length ? (
              <AllEnvironmentsFlagsListing
                environments={environments}
                projectFlags={projectFlags}
                refetchFlags={refetchProjectFlags}
                deleteFlag={deleteFlag.mutate}
                queryParams={queryParams}
              />
            ) : (
              <FeatureFlagsListing
                deleteFlag={deleteFlag.mutate}
                featureMetrics={featureMetrics as FeatureMetric[]}
                featureMetricsLoading={featureMetricsLoading}
                features={features}
                governance={governance}
                numberOfEnvs={environments?.length}
                onRowClick={onRowClick}
                queryParams={queryParams}
                refetchFlags={refetchFlags}
                toggleFeatureFlag={toggleFeatureFlag}
              />
            )}
          </Container>
        ) : (
          <NoFeatureFlags
            hasFeatureFlags={hasFeatureFlags}
            hasSearchTerm={searchTerm.length > 0}
            hasFlagFilter={
              (flagFilter.queryProps?.key?.length > 0 && flagFilter.queryProps?.value?.length > 0) ||
              !!features?.featureCounts?.totalArchived
            }
            hasTagFilter={!!tagFilter.length}
            environmentIdentifier={environmentIdentifier}
            clearFilter={onClearFilter}
            clearTagFilter={onClearTagFilter}
            clearSearch={onClearSearch}
            tags={tagsData?.tags}
            tagsError={tagsError}
          />
        )}
      </ListingPageTemplate>
    </StaleFlagsForm>
  )
}

export default FeatureFlagsPage
