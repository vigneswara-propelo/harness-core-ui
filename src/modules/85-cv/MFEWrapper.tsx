/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useFeatureFlag, useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useQueryParams, useDeepCompareEffect, useMutateAsGet } from '@common/hooks'
import { formatDatetoLocale, getReadableDateTime, ALL_TIME_ZONES } from '@common/utils/dateUtils'
import { Stepper } from '@common/components/Stepper/Stepper'
import { NameIdDescriptionTags, TimeSeriesAreaChart } from '@common/components'
import { useHarnessServicetModal } from '@common/modals/HarnessServiceModal/HarnessServiceModal'
import { Ticker } from '@common/components/Ticker/Ticker'
import { DateTimePicker } from '@common/components/DateTimePicker/DateTimePicker'
import ChildAppMounter from '../../microfrontends/ChildAppMounter'
import type { SRMCustomMicroFrontendProps } from './interface/SRMCustomMicroFrontendProps.types'
import {
  useGetHarnessServices,
  useGetHarnessEnvironments,
  HarnessServiceAsFormField,
  HarnessEnvironmentAsFormField
} from './components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment'
import {
  updatedMonitoredServiceNameForEnv,
  updateMonitoredServiceNameForService
} from './pages/monitored-service/components/Configurations/components/Service/components/MonitoredServiceOverview/MonitoredServiceOverview.utils'
import { WrapperOrgAccountLevelServiceEnvField } from './pages/monitored-service/components/Configurations/components/Service/components/MonitoredServiceOverview/component/OrgAccountLevelServiceEnvField/OrgAccountLevelServiceEnvField'
import SLOTargetNotifications from './pages/slos/common/SLOTargetAndBudgetPolicy/components/SLOTargetNotificationsContainer/SLOTargetNotifications'
import HealthSourceDrawerHeader from './pages/health-source/HealthSourceDrawer/component/HealthSourceDrawerHeader/HealthSourceDrawerHeader'
import HealthSourceDrawerContent from './pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent'
import { useLogContentHook } from './hooks/useLogContentHook/useLogContentHook'
import ChangesTable from './pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/ChangesTable'
import ChangeTimeline from './components/ChangeTimeline/ChangeTimeline'
import TimelineSlider from './components/ChangeTimeline/components/TimelineSlider/TimelineSlider'
import AnomaliesCard from './pages/monitored-service/components/ServiceHealth/components/AnomaliesCard/AnomaliesCard'

const MFEWrapper = (props?: SRMCustomMicroFrontendProps | Record<string, unknown>): JSX.Element => {
  // eslint-disable-next-line import/no-unresolved
  const SrmMicroFrontendPath = React.lazy(() => import('srmui/MicroFrontendApp'))

  return (
    <ChildAppMounter<SRMCustomMicroFrontendProps>
      ChildApp={SrmMicroFrontendPath}
      customHooks={{
        useMutateAsGet,
        useQueryParams,
        useFeatureFlag,
        useFeatureFlags,
        useLogContentHook,
        useDeepCompareEffect,
        useGetHarnessServices,
        useGetHarnessEnvironments,
        useHarnessServicetModal
      }}
      customFunctions={{
        formatDatetoLocale,
        getReadableDateTime,
        updatedMonitoredServiceNameForEnv,
        updateMonitoredServiceNameForService
      }}
      customConstants={{ ALL_TIME_ZONES }}
      customComponents={{
        Stepper,
        Ticker,
        ChangeTimeline,
        TimelineSlider,
        AnomaliesCard,
        ChangesTable,
        DateTimePicker,
        NameIdDescriptionTags,
        SLOTargetNotifications,
        HarnessServiceAsFormField,
        HarnessEnvironmentAsFormField,
        HealthSourceDrawerHeader,
        HealthSourceDrawerContent,
        TimeSeriesAreaChart,
        OrgAccountLevelServiceEnvField: WrapperOrgAccountLevelServiceEnvField
      }}
      {...props}
    />
  )
}

export default MFEWrapper
