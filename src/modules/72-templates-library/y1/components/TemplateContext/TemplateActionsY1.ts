/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { GetDataError } from 'restful-react'
import stableStringify from 'fast-json-stable-stringify'
import type { Failure } from 'services/cd-ng'
import type {
  CacheResponseMetadata,
  EntityGitDetails,
  EntityValidityDetails,
  Error as TemplateError,
  ErrorNodeSummary
} from 'services/template-ng'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import {
  NGTemplateInfoConfigY1_Tmp,
  TemplateMetadata_Tmp
} from '@modules/72-templates-library/y1/components/TemplateContext/types'
import { TemplateReducerStateY1, TemplateViewDataY1 } from './TemplateReducerY1'

export enum TemplateActionsY1 {
  DBInitialize = 'DBInitialize',
  DBInitializationFail = 'DBInitializationFail',
  Initialize = 'Initialize',
  Fetching = 'Fetching',
  Loading = 'Loading',
  UpdateTemplateView = 'UpdateTemplateView',
  UpdateTemplate = 'UpdateTemplate',
  SetYamlHandler = 'SetYamlHandler',
  Success = 'Success',
  Error = 'Error',
  IntermittentLoading = 'IntermittentLoading'
}

export enum DrawerTypesY1 {
  TemplateVariables = 'TemplateVariables',
  TemplateInputs = 'TemplateInputs'
}

export const DrawerSizes: Record<DrawerTypesY1, React.CSSProperties['width']> = {
  [DrawerTypesY1.TemplateVariables]: 1147,
  [DrawerTypesY1.TemplateInputs]: 876
}

export interface ActionResponseY1 {
  error?: string
  isUpdated?: boolean
  isUpdatedMetadata?: boolean
  template?: NGTemplateInfoConfigY1_Tmp
  templateMetadata?: TemplateMetadata_Tmp
  yamlHandler?: YamlBuilderHandlerBinding
  originalTemplate?: NGTemplateInfoConfigY1_Tmp
  isBETemplateUpdated?: boolean
  templateView?: TemplateViewDataY1
  stableVersion?: string
  lastPublishedVersion?: string
  versions?: string[]
  isLoading?: boolean
  isIntermittentLoading?: boolean
  isDBInitializationFailed?: boolean
  gitDetails?: EntityGitDetails
  storeMetadata?: StoreMetadata
  entityValidityDetails?: EntityValidityDetails
  cacheResponseMetadata?: CacheResponseMetadata
  templateYaml?: string
  templateError?: GetDataError<Failure | Error> | null
  templateInputsErrorNodeSummary?: ErrorNodeSummary
  templateYamlError?: TemplateError
}

export interface ActionReturnTypeY1 {
  type: TemplateActionsY1
  response?: ActionResponseY1
}

const dbInitialized = (): ActionReturnTypeY1 => ({ type: TemplateActionsY1.DBInitialize })
const setDBInitializationFailed = (
  isDBInitializationFailed: TemplateReducerStateY1['isDBInitializationFailed']
): ActionReturnTypeY1 => ({
  type: TemplateActionsY1.DBInitializationFail,
  response: { isDBInitializationFailed }
})
const initialized = (): ActionReturnTypeY1 => ({ type: TemplateActionsY1.Initialize })
const updateTemplateView = (response: ActionResponseY1): ActionReturnTypeY1 => ({
  type: TemplateActionsY1.UpdateTemplateView,
  response
})
const setYamlHandler = (response: ActionResponseY1): ActionReturnTypeY1 => ({
  type: TemplateActionsY1.SetYamlHandler,
  response
})
const setLoading = (isLoading: TemplateReducerStateY1['isLoading']): ActionReturnTypeY1 => ({
  type: TemplateActionsY1.Loading,
  response: { isLoading }
})
const fetching = (): ActionReturnTypeY1 => ({ type: TemplateActionsY1.Fetching })
const success = (response: ActionResponseY1): ActionReturnTypeY1 => ({ type: TemplateActionsY1.Success, response })
const error = (response: ActionResponseY1): ActionReturnTypeY1 => ({ type: TemplateActionsY1.Error, response })
const setIntermittentLoading = (response: ActionResponseY1): ActionReturnTypeY1 => ({
  type: TemplateActionsY1.IntermittentLoading,
  response
})

export const TemplateContextActionsY1 = {
  dbInitialized,
  setDBInitializationFailed,
  initialized,
  setLoading,
  fetching,
  updateTemplateView,
  setYamlHandler,
  setIntermittentLoading,
  success,
  error
}

export function compareTemplates(
  template1: NGTemplateInfoConfigY1_Tmp | undefined,
  template2: NGTemplateInfoConfigY1_Tmp | undefined
): boolean {
  return stableStringify(template1) !== stableStringify(template2)
}
