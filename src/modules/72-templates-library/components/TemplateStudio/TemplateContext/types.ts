import { IDBPayload } from '@modules/10-common/components/IDBContext/IDBContext'
import { StoreMetadata } from '@modules/10-common/constants/GitSyncTypes'
import { YamlVersion } from '@modules/70-pipeline/common/hooks/useYamlVersion'
import {
  EntityGitDetails,
  NGTemplateInfoConfig,
  EntityValidityDetails,
  ErrorNodeSummary,
  CacheResponseMetadata
} from 'services/template-ng'

export interface TemplatePayload extends IDBPayload {
  template?: NGTemplateInfoConfig
  //templateMetadata?: TemplateMetadata
  originalTemplate?: NGTemplateInfoConfig
  isUpdated: boolean
  //isUpdatedMetadata: boolean
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
