/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { EntityGitDetails, EntityValidityDetails, CacheResponseMetadata } from 'services/pipeline-ng'
import { StoreMetadata } from '@common/constants/GitSyncTypes'
import { ErrorNodeSummary } from 'services/template-ng'
import { IDBPayload } from '@modules/10-common/components/IDBContext/IDBContext'

export type YamlVersion = '0' | '1' | undefined

export interface NGTemplateInfoConfigY1_Tmp {
  version: number
  kind: string
  spec: {
    type?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } & { [key: string]: any }
}

export interface TemplateMetadata_Tmp {
  name: string
  description?: string
  identifier: string
  versionLabel: string
  projectIdentifier?: string
  orgIdentifier?: string
  tags?: { [key: string]: string }
  icon?: string
}

export interface TemplatePayloadY1 extends IDBPayload {
  template?: NGTemplateInfoConfigY1_Tmp
  templateMetadata?: TemplateMetadata_Tmp
  originalTemplate?: NGTemplateInfoConfigY1_Tmp
  isUpdated: boolean
  isUpdatedMetadata: boolean
  versions?: string[]
  stableVersion?: string
  gitDetails?: EntityGitDetails
  storeMetadata?: StoreMetadata
  entityValidityDetails?: EntityValidityDetails
  cacheResponseMetadata?: CacheResponseMetadata
  templateYaml?: string
  lastPublishedVersion?: string
  templateInputsErrorNodeSummary?: ErrorNodeSummary
  connectorRef?: string
  storeType?: 'INLINE' | 'REMOTE'
  yamlVersion?: YamlVersion
}
