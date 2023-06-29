/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { NameIdDescriptionTags, TimeSeriesAreaChart } from '@common/components'
import type { Stepper } from '@common/components/Stepper/Stepper'
import type { useDeepCompareEffect, useMutateAsGet, useQueryParams } from '@common/hooks'
import type { useFeatureFlag, useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useHarnessServicetModal } from '@common/modals/HarnessServiceModal/HarnessServiceModal'
import type { ALL_TIME_ZONES, formatDatetoLocale, getReadableDateTime } from '@common/utils/dateUtils'
import type {
  useGetHarnessServices,
  useGetHarnessEnvironments,
  HarnessServiceAsFormField,
  HarnessEnvironmentAsFormField
} from '@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment'
import HealthSourceDrawerHeader from '@cv/pages/health-source/HealthSourceDrawer/component/HealthSourceDrawerHeader/HealthSourceDrawerHeader'
import HealthSourceDrawerContent from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent'
import type {
  updatedMonitoredServiceNameForEnv,
  updateMonitoredServiceNameForService
} from '@cv/pages/monitored-service/components/Configurations/components/Service/components/MonitoredServiceOverview/MonitoredServiceOverview.utils'
import type OrgAccountLevelServiceEnvField from '@cv/pages/monitored-service/components/Configurations/components/Service/components/MonitoredServiceOverview/component/OrgAccountLevelServiceEnvField/OrgAccountLevelServiceEnvField'
import type SLOTargetNotifications from '@cv/pages/slos/common/SLOTargetAndBudgetPolicy/components/SLOTargetNotificationsContainer/SLOTargetNotifications'

export interface SRMCustomMicroFrontendProps {
  customComponents: {
    Stepper: typeof Stepper
    NameIdDescriptionTags: typeof NameIdDescriptionTags
    SLOTargetNotifications: typeof SLOTargetNotifications
    HarnessServiceAsFormField: typeof HarnessServiceAsFormField
    HealthSourceDrawerHeader: typeof HealthSourceDrawerHeader
    HealthSourceDrawerContent: typeof HealthSourceDrawerContent
    TimeSeriesAreaChart: typeof TimeSeriesAreaChart
    HarnessEnvironmentAsFormField: typeof HarnessEnvironmentAsFormField
    OrgAccountLevelServiceEnvField: typeof OrgAccountLevelServiceEnvField
  }
  customHooks: {
    useMutateAsGet: typeof useMutateAsGet
    useQueryParams: typeof useQueryParams
    useFeatureFlag: typeof useFeatureFlag
    useFeatureFlags: typeof useFeatureFlags
    useDeepCompareEffect: typeof useDeepCompareEffect
    useGetHarnessServices: typeof useGetHarnessServices
    useGetHarnessEnvironments: typeof useGetHarnessEnvironments
    useHarnessServicetModal: typeof useHarnessServicetModal
  }
  customFunctions: {
    formatDatetoLocale: typeof formatDatetoLocale
    getReadableDateTime: typeof getReadableDateTime
    updatedMonitoredServiceNameForEnv: typeof updatedMonitoredServiceNameForEnv
    updateMonitoredServiceNameForService: typeof updateMonitoredServiceNameForService
  }
  customConstants: {
    ALL_TIME_ZONES: typeof ALL_TIME_ZONES
  }
}
