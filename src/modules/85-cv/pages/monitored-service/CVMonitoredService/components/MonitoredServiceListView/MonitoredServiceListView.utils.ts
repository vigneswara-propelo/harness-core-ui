/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import type { TextProps } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import { ChangeSourceTypes } from '@cv/components/ChangeTimeline/ChangeTimeline.constants'
import { FilterTypes } from '../../CVMonitoredService.types'
import css from '../../CVMonitoredService.module.scss'

export const getListTitle = (
  getString: UseStringsReturn['getString'],
  type: FilterTypes,
  serviceCount: number
): string => {
  // Replace if with switch while adding more cases
  if (type === FilterTypes.RISK) {
    return getString('cv.monitoredServices.showingServiceAtRisk', { serviceCount })
  }

  return getString('cv.monitoredServices.showingAllServices', { serviceCount })
}

/**
 * The switch will be enabled when
 *
 * 1. SRM Active license is present (AND)
 * 2. CVNG_LICENSE_ENFORCEMENT FF is disabled (OR)
 * 3.a. If the service is not enabled else where (AND) enforcement "allowed" is true (OR)
 * 3.b. If the service is enabled else where
 *
 *  (OR)
 *
 * 1. CVNG_ENABLED FF is present
 *
 */
export function getIsSwitchEnabled({
  isSRMLicensePresentAndActive,
  isSRMEnforcementLicenseEnabled,
  serviceMonitoringEnabled,
  srmServicesFeatureEnabled,
  isSRMEnabled
}: {
  isSRMLicensePresentAndActive?: boolean
  isSRMEnforcementLicenseEnabled?: boolean
  serviceMonitoringEnabled?: boolean
  srmServicesFeatureEnabled?: boolean
  isSRMEnabled?: boolean
}): boolean {
  if (isSRMLicensePresentAndActive) {
    return Boolean(!isSRMEnforcementLicenseEnabled || serviceMonitoringEnabled || srmServicesFeatureEnabled)
  } else if (isSRMEnabled) {
    // This condition will be removed when CVNG_ENABLED FF is removed
    return true
  }

  return false
}

export const getChangeSummaryInfo = (getString: UseStringsReturn['getString'], changeCategory: string): TextProps => {
  switch (changeCategory) {
    case ChangeSourceTypes.Alert:
      return {
        tooltip: getString('cv.changeSource.incident'),
        icon: 'warning-outline',
        iconProps: { size: 16 }
      }
    case ChangeSourceTypes.ChaosExperiment:
      return {
        tooltip: getString('cv.changeSource.chaosExperiment.event'),
        icon: 'chaos-main'
      }
    case ChangeSourceTypes.Deployment:
      return {
        tooltip: getString('deploymentText'),
        icon: 'pod',
        iconProps: { size: 20, color: Color.GREEN_500 },
        className: css.changeEventIcon
      }
    case ChangeSourceTypes.FeatureFlag:
      return {
        tooltip: `${getString('common.moduleTitles.cf')} ${getString('change')}`,
        icon: 'cf-main',
        iconProps: { size: 18 }
      }
    case ChangeSourceTypes.Infrastructure:
      return {
        tooltip: `${getString('infrastructureText')} ${getString('change')}`,
        icon: 'hexagon-outline',
        iconProps: { size: 21, color: Color.PRIMARY_5 },
        className: css.changeEventIcon
      }
    default:
      return {}
  }
}
