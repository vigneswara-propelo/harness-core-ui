/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/uicore'
import { parse } from 'yaml'
import { capitalize } from 'lodash-es'
import type { AddDrawerMapInterface, CategoryInterface } from '@common/components/AddDrawer/AddDrawer'
import type { StringKeys, UseStringsReturn } from 'framework/strings'
import {
  manifestTypeIcons,
  ManifestDataType,
  manifestTypeLabels
} from '@pipeline/components/ManifestSelection/Manifesthelper'
import {
  ArtifactIconByType,
  ArtifactTitleIdByType,
  ENABLED_ARTIFACT_TYPES
} from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import type { NGTriggerDetailsResponse, TriggerCatalogItem, WebhookTriggerConfigV2 } from 'services/pipeline-ng'
import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import type {
  TriggerType,
  TriggerBaseType,
  SourceRepo,
  TriggerArtifactType,
  ManifestType,
  ScheduleType
} from '@triggers/components/Triggers/TriggerInterface'
import { AZURE_REPO, GitSourceProviders } from '@modules/72-triggers/components/Triggers/utils'

export type TriggerCatalogType = Required<TriggerCatalogItem>['triggerCatalogType'][number]

export interface ItemInterface {
  itemLabel: string
  iconName: IconName
  value: string
  visible?: boolean
  disabled?: boolean
  categoryValue?: string
}

export interface TriggerDataInterface {
  triggerType: TriggerBaseType
  sourceRepo?: SourceRepo
  manifestType?: ManifestType
  artifactType?: TriggerArtifactType
  scheduleType?: ScheduleType
}

const TriggerTypeIcons: Record<'SCHEDULE' | 'NEW_ARTIFACT', IconName> = {
  SCHEDULE: 'trigger-schedule',
  NEW_ARTIFACT: 'new-artifact'
}
export const getTriggerIcon = ({
  type,
  webhookSourceRepo,
  buildType
}: {
  type: NGTriggerDetailsResponse['type']
  webhookSourceRepo?: string // string temporary until backend
  buildType?: string
}): IconName => {
  if (type === 'Webhook' && webhookSourceRepo) {
    if (webhookSourceRepo === AZURE_REPO) {
      return GitSourceProviders.AzureRepo.iconName
    } else {
      const sourceRepo = capitalize(webhookSourceRepo) as Required<WebhookTriggerConfigV2>['type']

      return GitSourceProviders[sourceRepo]?.iconName
    }
  } else if (type === 'Scheduled') {
    return TriggerTypeIcons.SCHEDULE as IconName
  } else if (type === 'Manifest' && buildType) {
    if (buildType === ManifestDataType.HelmChart) {
      return manifestTypeIcons.HelmChart
    }
  } else if ((type === 'Artifact' || type === 'MultiRegionArtifact') && buildType) {
    return ArtifactIconByType[buildType as ArtifactType]
  }
  return 'yaml-builder-trigger'
}

export const getEnabledStatusTriggerValues = ({
  data,
  enabled,
  getString
}: {
  data: any
  enabled: boolean
  getString: (key: StringKeys) => string
}): { values?: any; error?: string } => {
  try {
    const triggerResponseJson = parse(data?.yaml || '')
    triggerResponseJson.trigger.enabled = enabled
    return { values: triggerResponseJson.trigger }
  } catch (e) {
    return { error: getString('triggers.cannotParseTriggersData') }
  }
}

export const getTriggerLabel = (triggerType: TriggerCatalogType, getString: UseStringsReturn['getString']): string => {
  const [itemLabel] = getTriggerLabelAndIcon(triggerType)

  if (itemLabel) {
    getString(itemLabel)
  }

  return ''
}

export const getTriggerCategoryDrawerMapFromTriggerCatalogItem = (
  getString: UseStringsReturn['getString'],
  triggerCatalogItems: TriggerCatalogItem[]
): AddDrawerMapInterface => {
  const categories = triggerCatalogItems.map(catalog => {
    const { category, triggerCatalogType } = catalog
    const triggerCategoryLabel = getTriggerCategoryLabel(category)
    if (triggerCategoryLabel) {
      const categoryItems = triggerCatalogType.map(item => {
        const [itemLabel, iconName] = getTriggerLabelAndIcon(item)

        if (itemLabel && iconName) {
          return {
            itemLabel: getString(itemLabel),
            value: item,
            iconName: iconName
          }
        }
      })

      return {
        categoryLabel: getString(triggerCategoryLabel),
        categoryValue: category,
        // Filter out empty values from categoryItems
        items: categoryItems.filter(categoryItem => Boolean(categoryItem))
      } as CategoryInterface
    }
  })

  return {
    drawerLabel: getString('common.triggersLabel'),
    showAllLabel: getString('triggers.showAllTriggers'),
    // Filter out empty categories
    categories: categories.filter(category => Boolean(category)) as CategoryInterface[]
  }
}

export const getTriggerBaseType = (triggerType?: TriggerType): TriggerBaseType | undefined =>
  triggerType === 'MultiRegionArtifact' ? 'Artifact' : triggerType

const getTriggerCategoryLabel = (triggerCategory: TriggerCatalogItem['category']): StringKeys | undefined => {
  // Using function instead of object, to prevent the page break when new triggerCategory is added to API and UI does add that triggerCategory to object
  switch (triggerCategory) {
    case 'Webhook':
      return 'execution.triggerType.WEBHOOK'
    case 'Artifact':
      return 'pipeline.artifactTriggerConfigPanel.artifact'
    case 'MultiRegionArtifact':
      return 'pipeline.artifactTriggerConfigPanel.artifact'
    case 'Manifest':
      return 'manifestsText'
    case 'Scheduled':
      return 'triggers.scheduledLabel'
    default:
      return
  }
}

const getTriggerLabelAndIcon = (triggerType: TriggerCatalogType): [itemLabel?: StringKeys, iconName?: IconName] => {
  // Using function instead of object, to prevent the page break when new triggerType is added to API and UI does add that triggerType to object
  switch (triggerType) {
    case 'Github':
      return ['common.repo_provider.githubLabel', GitSourceProviders.Github.iconName]
    case 'Gitlab':
      return ['common.repo_provider.gitlabLabel', GitSourceProviders.Gitlab.iconName]
    case 'Bitbucket':
      return ['common.repo_provider.bitbucketLabel', GitSourceProviders.Bitbucket.iconName]
    case 'AzureRepo':
      return ['common.repo_provider.azureRepos', GitSourceProviders.AzureRepo.iconName]
    case 'Harness':
      return ['harness', GitSourceProviders.Harness.iconName]
    case 'Custom':
      return [ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.CustomArtifact], GitSourceProviders.Custom.iconName]
    case 'Gcr':
      return [ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.Gcr], ArtifactIconByType.Gcr]
    case 'Ecr':
      return [ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.Ecr], ArtifactIconByType.Ecr]
    case 'DockerRegistry':
      return [ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.DockerRegistry], ArtifactIconByType.DockerRegistry]
    case 'ArtifactoryRegistry':
      return [ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry], ArtifactIconByType.ArtifactoryRegistry]
    case 'Acr':
      return [ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.Acr], ArtifactIconByType.Acr]
    case 'AmazonS3':
      return [ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.AmazonS3], ArtifactIconByType.AmazonS3]
    case 'GoogleArtifactRegistry':
      return [
        ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.GoogleArtifactRegistry],
        ArtifactIconByType.GoogleArtifactRegistry
      ]
    case 'CustomArtifact':
      return [ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.CustomArtifact], ArtifactIconByType.CustomArtifact]
    case 'GithubPackageRegistry':
      return [
        ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.GithubPackageRegistry],
        ArtifactIconByType.GithubPackageRegistry
      ]
    case 'Nexus3Registry':
      return [ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.Nexus3Registry], ArtifactIconByType.Nexus3Registry]
    case 'Jenkins':
      return [ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.Jenkins], ArtifactIconByType.Jenkins]
    case 'AzureArtifacts':
      return [ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.AzureArtifacts], ArtifactIconByType.AzureArtifacts]
    case 'AmazonMachineImage':
      return [ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.AmazonMachineImage], ArtifactIconByType.AmazonMachineImage]
    case 'GoogleCloudStorage':
      return [ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.GoogleCloudStorage], ArtifactIconByType.GoogleCloudStorage]
    case 'Bamboo':
      return [ArtifactTitleIdByType[ENABLED_ARTIFACT_TYPES.Bamboo], ArtifactIconByType.Bamboo]
    case 'HelmChart':
      return [manifestTypeLabels.HelmChart, manifestTypeIcons.HelmChart]
    case 'Cron':
      return ['triggers.cronLabel', TriggerTypeIcons.SCHEDULE]
    default:
      return [undefined, undefined]
  }
}
