/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { Color } from '@harness/design-system'
import { RouteWithLayout } from '@common/router'
import SettingsList from '@default-settings/pages/SettingsList'
import routes from '@common/RouteDefinitions'

import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { AccountSideNavProps } from '@common/RouteDestinations'
import type { ModulePathParams } from '@common/interfaces/RouteInterfaces'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import type { LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import AuditTrailFactory, { ResourceScope } from 'framework/AuditTrail/AuditTrailFactory'
import type { ResourceDTO } from 'services/audit'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import { String, useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/helper'
import { SettingType } from '@common/constants/Utils'
import DefaultSettingsFactory from './factories/DefaultSettingsFactory'
import { SettingGroups } from './interfaces/SettingType.types'
import {
  DefaultSettingCheckBoxWithTrueAndFalse,
  DefaultSettingDurationField,
  DefaultSettingNumberTextbox,
  DefaultSettingRadioBtnWithTrueAndFalse,
  DefaultSettingStringDropDown,
  DefaultSettingTextbox,
  DefaultSettingsTagInput,
  DefaultSettingsToggle
} from './components/ReusableHandlers'
import { AIDASettingsRenderer } from './components/EULAComponents'

DefaultSettingsFactory.registerCategory('CORE', {
  icon: 'cog',
  label: 'common.settingCategory.general',
  modulesWhereCategoryWillBeDisplayed: ['cd', 'ce', 'cf', 'chaos', 'ci', 'cv', 'code', 'sto', 'ssca']
})

DefaultSettingsFactory.registerCategory('CONNECTORS', {
  icon: 'cog',
  label: 'connectorsLabel',
  modulesWhereCategoryWillBeDisplayed: ['cd', 'ce', 'cf', 'chaos', 'ci', 'cv', 'code', 'sto', 'ssca']
})

DefaultSettingsFactory.registerCategory('CD', {
  icon: 'cd',
  label: 'common.purpose.cd.fullText',
  modulesWhereCategoryWillBeDisplayed: ['cd', 'ce', 'cf', 'chaos', 'ci', 'cv', 'code', 'sto', 'ssca'],
  settingsAndGroupDisplayOrder: [
    SettingType.EMAIL_TO_NON_HARNESS_USERS,
    SettingType.ENABLE_SERVICE_OVERRIDE_V2,
    SettingType.PROJECT_SCOPED_RESOURCE_CONSTRAINT_QUEUE
  ]
})

DefaultSettingsFactory.registerCategory('GIT_EXPERIENCE', {
  icon: 'git-experience-setting',
  iconProps: { color: Color.GREY_900, size: 16 },
  label: 'platform.authSettings.cdCommunityPlan.communityPlanStrings.item5',
  modulesWhereCategoryWillBeDisplayed: ['cd', 'ce', 'cf', 'chaos', 'ci', 'cv', 'code', 'sto', 'ssca']
})

DefaultSettingsFactory.registerCategory('PMS', {
  icon: 'cog',
  label: 'common.pipeline',
  modulesWhereCategoryWillBeDisplayed: ['cd', 'ci']
})

DefaultSettingsFactory.registerCategory('EULA', {
  icon: 'cog',
  label: 'platform.defaultSettings.eula',
  modulesWhereCategoryWillBeDisplayed: [
    'ci',
    'cd',
    'cf',
    'cv',
    'ce',
    'sto',
    'chaos',
    'code',
    'iacm',
    'ssca',
    'idp',
    'cet',
    'dashboards',
    'idp-admin',
    'cet'
  ]
})

DefaultSettingsFactory.registerCategory('NOTIFICATIONS', {
  icon: 'cog',
  label: 'rbac.notifications.name',
  modulesWhereCategoryWillBeDisplayed: [
    'ci',
    'cd',
    'cf',
    'cv',
    'ce',
    'sto',
    'chaos',
    'code',
    'iacm',
    'ssca',
    'idp',
    'cet',
    'dashboards',
    'idp-admin',
    'cet'
  ]
})

DefaultSettingsFactory.registerSettingHandler(SettingType.AIDA, {
  label: 'platform.defaultSettings.aida.aida',
  settingRenderer: props => {
    return <AIDASettingsRenderer {...props} />
  },
  yupValidation: Yup.boolean(),
  settingCategory: 'EULA'
})

DefaultSettingsFactory.registerCategory('CE', {
  icon: 'ccm-solid',
  label: 'common.purpose.ce.continuous',
  modulesWhereCategoryWillBeDisplayed: ['ce']
})

DefaultSettingsFactory.registerGroupHandler(SettingGroups.ENABLED_NOTIFICATION_CHANNELS_GROUP, {
  groupName: 'platform.defaultSettings.toggleNotificationChannel',
  settingCategory: 'NOTIFICATIONS',
  settingsDisplayOrder: [
    SettingType.ENABLE_SLACK_NOTIFICATION,
    SettingType.ENABLE_MSTEAMS_NOTIFICATION,
    SettingType.ENABLE_PAGERDUTY_NOTIFICATION,
    SettingType.ENABLE_WEBHOOK_NOTIFICATION
  ]
})
DefaultSettingsFactory.registerSettingHandler(SettingType.ENABLE_WEBHOOK_NOTIFICATION, {
  label: 'execution.triggerType.WEBHOOK',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'NOTIFICATIONS',
  groupId: SettingGroups.ENABLED_NOTIFICATION_CHANNELS_GROUP
})
DefaultSettingsFactory.registerSettingHandler(SettingType.ENABLE_SLACK_NOTIFICATION, {
  label: 'common.slack',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'NOTIFICATIONS',
  groupId: SettingGroups.ENABLED_NOTIFICATION_CHANNELS_GROUP
})
DefaultSettingsFactory.registerSettingHandler(SettingType.ENABLE_MSTEAMS_NOTIFICATION, {
  label: 'platform.defaultSettings.notifications.msTeam',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'NOTIFICATIONS',
  groupId: SettingGroups.ENABLED_NOTIFICATION_CHANNELS_GROUP
})
DefaultSettingsFactory.registerSettingHandler(SettingType.ENABLE_PAGERDUTY_NOTIFICATION, {
  label: 'platform.defaultSettings.notifications.pagerDuty',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'NOTIFICATIONS',
  groupId: SettingGroups.ENABLED_NOTIFICATION_CHANNELS_GROUP
})

DefaultSettingsFactory.registerGroupHandler(SettingGroups.TICKETING_PREFERENCES, {
  groupName: 'platform.defaultSettings.ticketingPreferences',
  settingCategory: 'CE',
  settingsDisplayOrder: [SettingType.TICKETING_TOOL, SettingType.TICKETING_TOOL_CONNECTOR]
})

DefaultSettingsFactory.registerGroupHandler(SettingGroups.PERSPECTIVES_PREFERENCES, {
  groupName: 'platform.defaultSettings.perspectivePreferences',
  settingCategory: 'CE',
  settingsDisplayOrder: [
    SettingType.SHOW_ANOMALIES,
    SettingType.SHOW_OTHERS,
    SettingType.SHOW_UNALLOCATED_CUSTER_COST,
    SettingType.INCLUDE_AWS_DISCOUNTS,
    SettingType.INCLUDE_AWS_CREDIT,
    SettingType.INCLUDE_AWS_REFUNDS,
    SettingType.INCLUDE_AWS_TAXES,
    SettingType.SHOW_AWS_COST_AS,
    SettingType.INCLUDE_AZURE_REFUNDS,
    SettingType.SHOW_AZURE_COST_AS,
    SettingType.INCLUDE_GCP_DISCOUNTS,
    SettingType.SHOW_GCP_COST_AS
  ]
})

DefaultSettingsFactory.registerSettingHandler(SettingType.EMAIL_TO_NON_HARNESS_USERS, {
  label: 'platform.defaultSettings.emailToNonHarnessUsers',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />,
  settingCategory: 'CD'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.ENABLE_SERVICE_OVERRIDE_V2, {
  label: 'platform.defaultSettings.enableServiceOverrideV2',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />,
  settingCategory: 'CD'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.PROJECT_SCOPED_RESOURCE_CONSTRAINT_QUEUE, {
  label: 'platform.defaultSettings.projectScopedResourceConstraintQueue',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />,
  settingCategory: 'CD'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.SHOW_ANOMALIES, {
  label: 'platform.defaultSettings.showAnomalies',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.SHOW_OTHERS, {
  label: 'platform.defaultSettings.showOthers',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.SHOW_UNALLOCATED_CUSTER_COST, {
  label: 'platform.defaultSettings.showUnallocatedClusterCost',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.INCLUDE_AWS_DISCOUNTS, {
  label: 'platform.defaultSettings.awsIncludeDiscounts',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.INCLUDE_AWS_CREDIT, {
  label: 'platform.defaultSettings.awsIncludeCredit',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.INCLUDE_AWS_REFUNDS, {
  label: 'platform.defaultSettings.awsIncludeRefunds',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.INCLUDE_AWS_TAXES, {
  label: 'platform.defaultSettings.awsIncludeTaxes',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.SHOW_AWS_COST_AS, {
  label: 'platform.defaultSettings.showAwsCostAs',
  settingRenderer: props => <DefaultSettingStringDropDown {...props} />,
  yupValidation: Yup.string(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.INCLUDE_AZURE_REFUNDS, {
  label: 'platform.defaultSettings.azureIncludeRefunds',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.SHOW_AZURE_COST_AS, {
  label: 'platform.defaultSettings.showAzureCostAs',
  settingRenderer: props => <DefaultSettingStringDropDown {...props} />,
  yupValidation: Yup.string(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.INCLUDE_GCP_DISCOUNTS, {
  label: 'platform.defaultSettings.gcpIncludeDiscounts',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.INCLUDE_GCP_TAXES, {
  label: 'platform.defaultSettings.gcpIncludeTaxes',
  settingRenderer: props => <DefaultSettingsToggle {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.SHOW_GCP_COST_AS, {
  label: 'platform.defaultSettings.showGcpCostAs',
  settingRenderer: props => <DefaultSettingStringDropDown {...props} />,
  yupValidation: Yup.string(),
  settingCategory: 'CE',
  groupId: SettingGroups.PERSPECTIVES_PREFERENCES
})

DefaultSettingsFactory.registerSettingHandler(SettingType.DISABLE_HARNESS_BUILT_IN_SECRET_MANAGER, {
  label: 'common.accountSetting.connector.disableBISMHeading',
  settingRenderer: props => <DefaultSettingCheckBoxWithTrueAndFalse {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'CONNECTORS'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.MANDATE_CUSTOM_WEBHOOK_AUTHORIZATION, {
  label: 'platform.defaultSettings.mandateAuthorizationForCustomWebhookTriggers',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />,
  settingCategory: 'PMS'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.ENABLE_NODE_EXECUTION_AUDIT_EVENTS, {
  label: 'platform.defaultSettings.enablePipelineExecutionAuditEvents',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'PMS'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.ALLOW_USER_TO_MARK_STEP_AS_FAILED_EXPLICITLY, {
  label: 'platform.defaultSettings.allowUserToMarkStepAsFailedExplicitly',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />,
  settingCategory: 'PMS'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.EXPORT_SERVICE_VARIABLES_AS_ENV_VARIABLES, {
  label: 'platform.defaultSettings.exportServiceVariablesAsEnvVariables',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />,
  settingCategory: 'PMS'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.ENABLE_GIT_COMMANDS, {
  label: 'platform.defaultSettings.enableGitCommands',
  settingRenderer: props => <DefaultSettingCheckBoxWithTrueAndFalse {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'GIT_EXPERIENCE'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.ALLOW_DIFFERENT_REPO_FOR_INPUT_SETS, {
  label: 'platform.defaultSettings.allowDifferentRepoForInputSets',
  settingRenderer: props => <DefaultSettingCheckBoxWithTrueAndFalse {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'GIT_EXPERIENCE'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.ENFORCE_GIT_EXPERIENCE, {
  label: 'platform.defaultSettings.enforceGitExperience',
  settingRenderer: props => <DefaultSettingCheckBoxWithTrueAndFalse {...props} />,
  yupValidation: Yup.boolean(),
  settingCategory: 'GIT_EXPERIENCE'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.DEFAULT_STORE_TYPE_FOR_ENTITIES, {
  label: 'platform.defaultSettings.defaultStoreType',
  settingRenderer: props => <DefaultSettingStringDropDown {...props} />,
  settingCategory: 'GIT_EXPERIENCE'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.DEFAULT_REPO_FOR_GIT_EXPERIENCE, {
  label: 'platform.defaultSettings.defaultGitExperienceRepo',
  settingRenderer: props => (
    <DefaultSettingTextbox {...props} placeholderKey={'platform.defaultSettings.defaultGitExperienceRepoPlaceholder'} />
  ),
  settingCategory: 'GIT_EXPERIENCE'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.GIT_EXPERIENCE_REPO_ALLOWLIST, {
  label: 'platform.defaultSettings.allowedRepositories',
  settingRenderer: props => {
    const separator = ','
    const { onSettingSelectionChange, settingValue, getString } = props

    return (
      <DefaultSettingsTagInput
        {...props}
        tagInputProps={{
          tagsProps: {
            separator,
            onChange: values => onSettingSelectionChange(values.filter(Boolean).join(',')),
            values: settingValue?.value?.split(separator) ?? [],
            placeholder: getString('platform.defaultSettings.allowedRepositoriesPlaceholder'),
            disabled: !settingValue?.isSettingEditable
          }
        }}
      />
    )
  },
  yupValidation: Yup.string().nullable().optional(),
  settingCategory: 'GIT_EXPERIENCE'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.ENABLE_MATRIX_FIELD_NAME_SETTING, {
  label: 'platform.defaultSettings.enableMatrixFieldNames',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />,
  settingCategory: 'PMS'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.ENABLE_EXPRESSION_ENGINE_V2, {
  label: 'platform.defaultSettings.enableExpressionsJsonSupport',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />,
  settingCategory: 'PMS'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.DEFAULT_IMAGE_PULL_POLICY_FOR_ADD_ON_CONTAINER, {
  label: 'platform.defaultSettings.defaultImagePullPolicyForAddOnContainer',
  settingRenderer: props => <DefaultSettingStringDropDown {...props} />,
  yupValidation: Yup.string(),
  settingCategory: 'PMS'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.TICKETING_TOOL, {
  label: 'platform.defaultSettings.ticketingToolLabel',
  settingRenderer: props => <DefaultSettingStringDropDown {...props} />,
  yupValidation: Yup.string(),
  settingCategory: 'CE',
  groupId: SettingGroups.TICKETING_PREFERENCES
})

AuditTrailFactory.registerResourceHandler('SETTING', {
  moduleIcon: {
    name: 'nav-settings'
  },
  moduleLabel: 'common.defaultSettings',
  resourceLabel: 'common.defaultSettings',
  resourceUrl: (_resource_: ResourceDTO, resourceScope: ResourceScope) => {
    const { orgIdentifier, accountIdentifier, projectIdentifier } = resourceScope
    return routes.toDefaultSettings({
      orgIdentifier,
      accountId: accountIdentifier,
      projectIdentifier
    })
  }
})

RbacFactory.registerResourceTypeHandler(ResourceType.SETTING, {
  icon: 'nav-settings',
  label: 'common.defaultSettings',
  labelSingular: 'common.singularLabels.defaultSetting',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.EDIT_CORE_SETTING]: <String stringID="rbac.permissionLabels.createEdit" />
  }
})

DefaultSettingsFactory.registerSettingHandler(SettingType.WEBHOOK_GITHUB_TRIGGERS_AUTHENTICATION, {
  label: 'platform.defaultSettings.mandateWebhookSecretsGithubTriggers',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />,
  settingCategory: 'PMS'
})

DefaultSettingsFactory.registerSettingHandler(SettingType.TRIGGER_FOR_ALL_ARTIFACTS_OR_MANIFESTS, {
  label: 'platform.defaultSettings.executeTriggersWithAllCollectedArtifactsOrManifests',
  settingRenderer: props => <DefaultSettingRadioBtnWithTrueAndFalse {...props} />,
  settingCategory: 'PMS'
})

export default function DefaultSettingsRoutes(): React.ReactElement {
  const { PIE_PIPELINE_SETTINGS_ENFORCEMENT_LIMIT, PIE_GIT_BI_DIRECTIONAL_SYNC } = useFeatureFlags()
  const { getString } = useStrings()

  DefaultSettingsFactory.registerSettingHandler(SettingType.ENABLE_FORCE_DELETE, {
    label: 'platform.defaultSettings.enableForceDelete',
    settingRenderer: props => <DefaultSettingCheckBoxWithTrueAndFalse {...props} />,
    yupValidation: Yup.boolean(),
    settingCategory: 'CORE'
  })

  if (PIE_PIPELINE_SETTINGS_ENFORCEMENT_LIMIT) {
    DefaultSettingsFactory.registerSettingHandler(SettingType.PIPELINE_TIMEOUT, {
      label: 'platform.defaultSettings.pipelineTimeout',
      settingRenderer: props => <DefaultSettingDurationField {...props} />,
      yupValidation: getDurationValidationSchema().required(getString('validation.timeout10SecMinimum')),
      settingCategory: 'PMS'
    })

    DefaultSettingsFactory.registerSettingHandler(SettingType.STAGE_TIMEOUT, {
      label: 'platform.defaultSettings.stageTimeout',
      settingRenderer: props => <DefaultSettingDurationField {...props} />,
      yupValidation: getDurationValidationSchema().required(getString('validation.timeout10SecMinimum')),
      settingCategory: 'PMS'
    })

    DefaultSettingsFactory.registerSettingHandler(SettingType.STEP_TIMEOUT, {
      label: 'platform.defaultSettings.stepTimeout',
      settingRenderer: props => <DefaultSettingDurationField {...props} />,
      yupValidation: getDurationValidationSchema().required(getString('validation.timeout10SecMinimum')),
      settingCategory: 'PMS'
    })

    DefaultSettingsFactory.registerSettingHandler(SettingType.CONCURRENT_ACTIVE_PIPELINE_EXECUTIONS, {
      label: 'platform.defaultSettings.concurrentActivePipelineExecutions',
      settingRenderer: props => <DefaultSettingNumberTextbox {...props} />,
      settingCategory: 'PMS'
    })
  }

  if (PIE_GIT_BI_DIRECTIONAL_SYNC) {
    DefaultSettingsFactory.registerSettingHandler(SettingType.ENABLE_BI_DIRECTIONAL_SYNC, {
      label: 'platform.defaultSettings.enableBiDirectionalSync',
      settingRenderer: props => <DefaultSettingCheckBoxWithTrueAndFalse {...props} />,
      yupValidation: Yup.boolean(),
      settingCategory: 'GIT_EXPERIENCE'
    })
  }
  return (
    <>
      <RouteWithLayout
        sidebarProps={AccountSideNavProps}
        path={routes.toDefaultSettings({ ...accountPathProps })}
        exact
      >
        <SettingsList />
      </RouteWithLayout>
    </>
  )
}
export const DefaultSettingsRouteDestinations: React.FC<{
  moduleParams: ModulePathParams
  licenseRedirectData?: LicenseRedirectProps
  sidebarProps?: SidebarContext
}> = ({ moduleParams, licenseRedirectData, sidebarProps }) => (
  <>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={routes.toDefaultSettings({
        ...accountPathProps,
        ...projectPathProps,
        ...moduleParams
      })}
    >
      <SettingsList />
    </RouteWithLayout>
  </>
)
