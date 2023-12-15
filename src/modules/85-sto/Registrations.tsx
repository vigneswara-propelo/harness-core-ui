/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import * as Yup from 'yup'
import { TestFunction } from 'yup'
import { SettingType } from '@common/constants/Utils'
import { BannerType } from '@common/layouts/Constants'
import {
  getActiveUsageNumber,
  getPercentageNumber,
  isFeatureCountActive,
  isFeatureLimitBreachedIncludesExceeding,
  isFeatureLimitMet,
  isFeatureOveruseActive,
  isFeatureWarningActive,
  isFeatureWarningActiveIncludesLimit
} from '@common/layouts/FeatureBanner'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { DefaultSettingTextbox } from '@default-settings/components/ReusableHandlers'
import DefaultSettingsFactory from '@default-settings/factories/DefaultSettingsFactory'
import { SettingGroups } from '@default-settings/interfaces/SettingType.types'
import executionFactory from '@pipeline/factories/ExecutionFactory'
import { StageType } from '@pipeline/utils/stageHelpers'
import RbacFactory from '@rbac/factories/RbacFactory'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import STOExecutionCardSummary from '@sto/components/STOExecutionCardSummary/STOExecutionCardSummary'
import AuditTrailFactory from 'framework/AuditTrail/AuditTrailFactory'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import featureFactory from 'framework/featureStore/FeaturesFactory'
import { String as LocaleString } from 'framework/strings'

export default function useStoRegistrations(): void {
  const [isRegistered, setIsRegistered] = useState<boolean>(false)
  const { STO_BASELINE_DEFAULTING } = useFeatureFlags()

  if (isRegistered) {
    return
  }

  if (STO_BASELINE_DEFAULTING) {
    DefaultSettingsFactory.registerCategory('STO', {
      icon: 'sto-grey',
      label: 'common.stoText',
      settingsAndGroupDisplayOrder: [SettingGroups.STO_DEFAULT_BASELINE_REGEX],
      modulesWhereCategoryWillBeDisplayed: ['sto']
    })
  }

  featureFactory.registerFeaturesByModule('sto', {
    features: [FeatureIdentifier.MAX_TOTAL_SCANS, FeatureIdentifier.MAX_SCANS_PER_MONTH, FeatureIdentifier.DEVELOPERS],
    renderMessage: (props, getString, additionalLicenseProps = {}) => {
      const {
        isFreeEdition: isSTOFree,
        isTeamEdition: isSTOTeam,
        isEnterpriseEdition: isSTOEnterprise
      } = additionalLicenseProps
      const isTeamOrEnterprise = isSTOEnterprise || isSTOTeam
      const featuresMap = props.features
      const maxTotalScansFeatureDetail = featuresMap.get(FeatureIdentifier.MAX_TOTAL_SCANS) // tested both
      const maxScansPerMonthFeatureDetail = featuresMap.get(FeatureIdentifier.MAX_SCANS_PER_MONTH)
      const activeDevelopersFeatureDetail = featuresMap.get(FeatureIdentifier.DEVELOPERS)

      // Check for limit breach
      const isMaxScansPerMonthBreached = isFeatureLimitBreachedIncludesExceeding(maxScansPerMonthFeatureDetail)
      let limitBreachMessageString = ''
      if (isMaxScansPerMonthBreached) {
        limitBreachMessageString = getString('pipeline.featureRestriction.maxScansPerMonth100PercentLimit')
      }

      if (limitBreachMessageString) {
        return {
          message: () => limitBreachMessageString,
          bannerType: BannerType.LEVEL_UP
        }
      }

      // Checking for limit overuse warning
      let overuseMessageString = ''
      const isActiveDevelopersOveruseActive = isFeatureOveruseActive(activeDevelopersFeatureDetail)

      if (isActiveDevelopersOveruseActive && isTeamOrEnterprise) {
        overuseMessageString = getString('pipeline.featureRestriction.subscriptionExceededLimit')
      }
      if (overuseMessageString) {
        return {
          message: () => overuseMessageString,
          bannerType: BannerType.OVERUSE
        }
      }

      // Checking for limit usage warning
      let warningMessageString = ''
      const isMaxScansPerMonthCountActive = isFeatureCountActive(maxScansPerMonthFeatureDetail)
      const isMaxTotalScansWarningActive = isFeatureWarningActive(maxTotalScansFeatureDetail)
      const isMaxTotalScansLimitMet = isFeatureLimitMet(maxTotalScansFeatureDetail)
      const isActiveDevelopersWarningActive = isFeatureWarningActiveIncludesLimit(activeDevelopersFeatureDetail)

      if (
        isSTOFree &&
        isMaxTotalScansLimitMet &&
        isMaxScansPerMonthCountActive &&
        typeof maxScansPerMonthFeatureDetail?.featureDetail?.count !== 'undefined'
      ) {
        warningMessageString = getString('pipeline.featureRestriction.numMonthlyBuilds', {
          count: maxScansPerMonthFeatureDetail.featureDetail.count,
          limit: maxScansPerMonthFeatureDetail.featureDetail.limit
        })
      } else if (
        isSTOFree &&
        isMaxTotalScansWarningActive &&
        maxTotalScansFeatureDetail?.featureDetail?.count &&
        maxTotalScansFeatureDetail.featureDetail.limit
      ) {
        const usagePercent = getActiveUsageNumber(maxTotalScansFeatureDetail)

        warningMessageString = getString('pipeline.featureRestriction.maxTotalBuilds90PercentLimit', {
          usagePercent
        })
      } else if (
        isActiveDevelopersWarningActive &&
        activeDevelopersFeatureDetail?.featureDetail?.count &&
        activeDevelopersFeatureDetail.featureDetail.limit &&
        isTeamOrEnterprise
      ) {
        const usagePercent = getPercentageNumber(maxTotalScansFeatureDetail)

        warningMessageString = getString('pipeline.featureRestriction.subscription90PercentLimit', { usagePercent })
      }

      if (warningMessageString) {
        return {
          message: () => warningMessageString,
          bannerType: BannerType.INFO
        }
      }

      // If neither of limit breach/ warning/ overuse needs to be shown, return with an empty string.
      // This will ensure no banner is shown
      return {
        message: () => '',
        bannerType: BannerType.LEVEL_UP
      }
    }
  })

  // RBAC

  RbacFactory.registerResourceCategory(ResourceCategory.STO, {
    icon: 'sto-color-filled',
    label: 'common.purpose.sto.continuous'
  })

  RbacFactory.registerResourceTypeHandler(ResourceType.STO_TESTTARGET, {
    icon: 'sto-color-filled',
    label: 'sto.targets.testTargets',
    labelSingular: 'common.singularLabels.testTarget',
    category: ResourceCategory.STO,
    permissionLabels: {
      [PermissionIdentifier.VIEW_STO_TESTTARGET]: <LocaleString stringID="rbac.permissionLabels.view" />,
      [PermissionIdentifier.EDIT_STO_TESTTARGET]: <LocaleString stringID="rbac.permissionLabels.createEdit" />
    }
  })
  RbacFactory.registerResourceTypeHandler(ResourceType.STO_EXEMPTION, {
    icon: 'sto-color-filled',
    label: 'sto.exemptions',
    labelSingular: 'sto.stoExemption',
    category: ResourceCategory.STO,
    permissionLabels: {
      [PermissionIdentifier.VIEW_STO_EXEMPTION]: <LocaleString stringID="rbac.permissionLabels.view" />,
      [PermissionIdentifier.CREATE_STO_EXEMPTION]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
      [PermissionIdentifier.APPROVE_STO_EXEMPTION]: <LocaleString stringID="rbac.permissionLabels.approveReject" />
    }
  })
  RbacFactory.registerResourceTypeHandler(ResourceType.STO_SCAN, {
    icon: 'sto-color-filled',
    label: 'sto.scans',
    labelSingular: 'common.singularLabels.scan',
    category: ResourceCategory.STO,
    permissionLabels: {
      [PermissionIdentifier.VIEW_STO_SCAN]: <LocaleString stringID="rbac.permissionLabels.view" />
    }
  })
  RbacFactory.registerResourceTypeHandler(ResourceType.STO_ISSUE, {
    icon: 'sto-color-filled',
    label: 'sto.issues',
    labelSingular: 'common.singularLabels.issue',
    category: ResourceCategory.STO,
    permissionLabels: {
      [PermissionIdentifier.VIEW_STO_ISSUE]: <LocaleString stringID="rbac.permissionLabels.view" />
    }
  })
  RbacFactory.registerResourceTypeHandler(ResourceType.TICKET, {
    icon: 'sto-color-filled',
    label: 'common.tickets.externalTickets',
    labelSingular: 'common.singularLabels.ticket',
    category: ResourceCategory.STO,
    permissionLabels: {
      [PermissionIdentifier.VIEW_STO_TICKET]: <LocaleString stringID="rbac.permissionLabels.view" />,
      [PermissionIdentifier.EDIT_STO_TICKET]: <LocaleString stringID="rbac.permissionLabels.createEdit" />,
      [PermissionIdentifier.DELETE_STO_TICKET]: <LocaleString stringID="rbac.permissionLabels.delete" />
    }
  })

  // Default Settings

  const validateRegEx: TestFunction = (value: string): boolean => {
    try {
      new RegExp(value)
      return true
    } catch (e) {
      return false
    }
  }

  DefaultSettingsFactory.registerGroupHandler(SettingGroups.STO_DEFAULT_BASELINE_REGEX, {
    groupName: 'sto.defaultBaselineRegExForTargets',
    settingCategory: 'STO',
    settingsDisplayOrder: [
      SettingType.STO_DEFAULT_BASELINE_REGEX_REPOSITORY,
      SettingType.STO_DEFAULT_BASELINE_REGEX_CONTAINER,
      SettingType.STO_DEFAULT_BASELINE_REGEX_INSTANCE,
      SettingType.STO_DEFAULT_BASELINE_REGEX_CONFIGURATION
    ]
  })

  DefaultSettingsFactory.registerSettingHandler(SettingType.STO_DEFAULT_BASELINE_REGEX_REPOSITORY, {
    label: 'sto.codeRepositories',
    settingCategory: 'STO',
    groupId: SettingGroups.STO_DEFAULT_BASELINE_REGEX,
    settingRenderer: props => {
      return <DefaultSettingTextbox {...props} placeholderKey="sto.re2RegularExpression" />
    },
    yupValidation: Yup.string()
      .test('re2', 'Value must be a RE2-compatible Regular Expression', validateRegEx)
      .nullable()
      .optional()
  })

  DefaultSettingsFactory.registerSettingHandler(SettingType.STO_DEFAULT_BASELINE_REGEX_CONTAINER, {
    label: 'sto.containerImages',
    settingCategory: 'STO',
    groupId: SettingGroups.STO_DEFAULT_BASELINE_REGEX,
    settingRenderer: props => {
      return <DefaultSettingTextbox {...props} placeholderKey="sto.re2RegularExpression" />
    },
    yupValidation: Yup.string()
      .test('re2', 'Value must be a RE2-compatible Regular Expression', validateRegEx)
      .nullable()
      .optional()
  })

  DefaultSettingsFactory.registerSettingHandler(SettingType.STO_DEFAULT_BASELINE_REGEX_INSTANCE, {
    label: 'sto.webOrApiInstances',
    settingCategory: 'STO',
    groupId: SettingGroups.STO_DEFAULT_BASELINE_REGEX,
    settingRenderer: props => {
      return <DefaultSettingTextbox {...props} placeholderKey="sto.re2RegularExpression" />
    },
    yupValidation: Yup.string()
      .test('re2', 'Value must be a RE2-compatible Regular Expression', validateRegEx)
      .nullable()
      .optional()
  })

  DefaultSettingsFactory.registerSettingHandler(SettingType.STO_DEFAULT_BASELINE_REGEX_CONFIGURATION, {
    label: 'sto.infrastructureConfigurations',
    settingCategory: 'STO',
    groupId: SettingGroups.STO_DEFAULT_BASELINE_REGEX,
    settingRenderer: props => {
      return <DefaultSettingTextbox {...props} placeholderKey="sto.re2RegularExpression" />
    },
    yupValidation: Yup.string()
      .test('re2', 'Value must be a RE2-compatible Regular Expression', validateRegEx)
      .nullable()
      .optional()
  })

  // Audit Trail

  AuditTrailFactory.registerResourceHandler('STO_TARGET', {
    moduleIcon: {
      name: 'sto-grey'
    },
    moduleLabel: 'common.module.sto',
    // Using existing "Target" string to avoid yamlStringsCheck error
    resourceLabel: 'pipelineSteps.targetLabel'
  })

  AuditTrailFactory.registerResourceHandler('STO_EXEMPTION', {
    moduleIcon: {
      name: 'sto-grey'
    },
    moduleLabel: 'common.module.sto',
    resourceLabel: 'sto.stoExemption'
  })

  // Execution cards

  executionFactory.registerCardInfo(StageType.SECURITY, {
    icon: 'sto-color-filled',
    component: STOExecutionCardSummary
  })

  setIsRegistered(true)
}
