/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo } from 'react'
import { Button, ButtonVariation, Container, ExpandingSearchInput, Label, Layout, Select } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import type { SLODashbordFiltersProps } from './SLODashboardFilters.types'
import {
  getEvaluationTypeOptionsForFilter,
  getIsClearFilterDisabled,
  getIsMonitoresServicePageClearFilterDisabled,
  getMonitoredServicesOptionsForFilter,
  getPeriodTypeOptionsForFilter,
  getUserJourneyOptionsForFilter,
  SLODashboardFilterActions
} from '../../CVSLOListingPage.utils'
import css from '../../CVSLOsListingPage.module.scss'

const SLODashbordFilters: React.FC<SLODashbordFiltersProps> = ({
  filterState,
  dispatch,
  filterItemsData,
  hideMonitoresServicesFilter,
  isAccountLevel
}) => {
  const { getString } = useStrings()
  const enableRequestSLO = useFeatureFlag(FeatureFlag.SRM_ENABLE_REQUEST_SLO)
  const resetFilters = useCallback(() => {
    dispatch(SLODashboardFilterActions.resetFilters())
  }, [])

  const resetFiltersInMonitoredServicePage = useCallback(() => {
    dispatch(SLODashboardFilterActions.resetFiltersInMonitoredServicePageAction())
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hideResetFilterButton = useMemo(() => getIsClearFilterDisabled(filterState, getString), [filterState])

  const hideMonitoredServiceResetButton = useMemo(
    () => getIsMonitoresServicePageClearFilterDisabled(filterState, getString),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterState]
  )

  const { updateUserJourney, updateMonitoredServices, updateTargetType, updateEvaluationType, updatedSearchAction } =
    SLODashboardFilterActions

  return (
    <Layout.Horizontal className={css.sloFilters} spacing={'medium'} flex={{ alignItems: 'flex-end' }}>
      <Container width={160} data-testid="userJourney-filter">
        <Label>{getString('cv.slos.userJourney')}</Label>
        <Select
          value={filterState?.userJourney}
          items={getUserJourneyOptionsForFilter(filterItemsData?.userJourney?.data?.content, getString)}
          onChange={item => {
            dispatch(updateUserJourney({ userJourney: item }))
          }}
        />
      </Container>
      {!hideMonitoresServicesFilter && !isAccountLevel && (
        <Container width={160} data-testid="monitoredServices-filter">
          <Label>{getString('cv.monitoredServices.title')}</Label>
          <Select
            value={filterState?.monitoredService}
            items={getMonitoredServicesOptionsForFilter(filterItemsData?.monitoredServices, getString)}
            onChange={item => {
              dispatch(updateMonitoredServices({ monitoredService: item }))
            }}
          />
        </Container>
      )}
      <Container width={160} data-testid="sloTargetAndBudget-filter">
        <Label>{getString('cv.slos.sloTargetAndBudget.periodType')}</Label>
        <Select
          value={filterState?.targetTypes}
          items={getPeriodTypeOptionsForFilter(getString)}
          onChange={item => {
            dispatch(updateTargetType({ targetTypes: item }))
          }}
        />
      </Container>
      {!isAccountLevel && enableRequestSLO && (
        <Container width={160} data-testid="evaluationType-filter">
          <Label>{getString('common.policy.evaluations')}</Label>
          <Select
            value={filterState?.evaluationType}
            items={getEvaluationTypeOptionsForFilter(getString)}
            onChange={item => {
              dispatch(updateEvaluationType({ evaluationType: item }))
            }}
          />
        </Container>
      )}
      {!hideMonitoresServicesFilter && !hideResetFilterButton && (
        <Button
          className={css.clearButton}
          variation={ButtonVariation.LINK}
          onClick={resetFilters}
          data-testid="filter-reset"
        >
          {getString('common.filters.clearFilters')}
        </Button>
      )}
      <ExpandingSearchInput
        data-testid="expandingSearch-filter"
        width={200}
        throttle={500}
        defaultValue={filterState.search}
        key={filterState.search}
        onChange={updatedText => dispatch(updatedSearchAction({ search: updatedText }))}
        autoFocus={false}
        placeholder={getString('cv.slos.searchSLO')}
      />
      {hideMonitoresServicesFilter && !hideMonitoredServiceResetButton && (
        <Button
          className={css.clearButton}
          variation={ButtonVariation.LINK}
          onClick={resetFiltersInMonitoredServicePage}
          data-testid="filter-reset-monitored-services"
        >
          {getString('common.filters.clearFilters')}
        </Button>
      )}
    </Layout.Horizontal>
  )
}

export default SLODashbordFilters
