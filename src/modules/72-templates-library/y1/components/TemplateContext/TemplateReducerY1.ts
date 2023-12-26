/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { clone } from 'lodash-es'
import type { IDrawerProps } from '@blueprintjs/core'
import type { GetDataError } from 'restful-react'
import type {
  CacheResponseMetadata,
  EntityGitDetails,
  EntityValidityDetails,
  Error as TemplateError,
  ErrorNodeSummary
} from 'services/template-ng'
import type { Failure } from 'services/cd-ng'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { DefaultNewTemplateId, DefaultNewVersionLabel } from 'framework/Templates/templates'
import type { StepData } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import {
  NGTemplateInfoConfigY1_Tmp,
  TemplateMetadata_Tmp
} from '@modules/72-templates-library/y1/components/TemplateContext/types'
import {
  DefaultTemplateMetadataY1,
  DefaultTemplateY1
} from '@templates-library/common/components/TemplateStudio/TemplateLoaderContext/utils'
import { ActionReturnTypeY1, DrawerTypesY1, TemplateActionsY1 } from './TemplateActionsY1'

export interface DrawerDataY1 extends Omit<IDrawerProps, 'isOpen'> {
  type: DrawerTypesY1
  data?: {
    paletteData?: {
      onSelection?: (step: StepData) => void
    }
  }
}

export interface TemplateViewDataY1 {
  isYamlEditable: boolean
  isDrawerOpened: boolean
  drawerData: DrawerDataY1
}

export interface TemplateReducerStateY1 {
  template: NGTemplateInfoConfigY1_Tmp
  templateMetadata: TemplateMetadata_Tmp
  yamlHandler?: YamlBuilderHandlerBinding
  originalTemplate: NGTemplateInfoConfigY1_Tmp
  stableVersion: string
  lastPublishedVersion: string
  versions: string[]
  templateView: TemplateViewDataY1
  templateIdentifier: string
  isDBInitialized: boolean
  isDBInitializationFailed: boolean
  isLoading: boolean
  isIntermittentLoading: boolean
  isInitialized: boolean
  isBETemplateUpdated: boolean
  isUpdated: boolean
  isUpdatedMetadata: boolean
  gitDetails: EntityGitDetails
  storeMetadata?: StoreMetadata
  entityValidityDetails: EntityValidityDetails
  cacheResponseMetadata: CacheResponseMetadata
  templateYaml: string
  templateError?: GetDataError<Failure | Error> | null
  templateInputsErrorNodeSummary?: ErrorNodeSummary
  templateYamlError?: TemplateError
}

export const initialState: TemplateReducerStateY1 = {
  template: { ...DefaultTemplateY1 },
  templateMetadata: { ...DefaultTemplateMetadataY1 },
  originalTemplate: { ...DefaultTemplateY1 },
  stableVersion: DefaultNewVersionLabel,
  versions: [DefaultNewVersionLabel],
  lastPublishedVersion: '',
  templateIdentifier: DefaultNewTemplateId,
  templateView: {
    isDrawerOpened: false,
    isYamlEditable: false,
    drawerData: {
      type: DrawerTypesY1.TemplateVariables
    }
  },
  isLoading: false,
  isIntermittentLoading: false,
  isBETemplateUpdated: false,
  isDBInitialized: false,
  isDBInitializationFailed: false,
  isUpdated: false,
  isUpdatedMetadata: false,
  isInitialized: false,
  gitDetails: {},
  storeMetadata: {},
  entityValidityDetails: {},
  cacheResponseMetadata: {} as CacheResponseMetadata,
  templateYaml: ''
}

export const TemplateReducer = (state: TemplateReducerStateY1, data: ActionReturnTypeY1): TemplateReducerStateY1 => {
  const { type, response } = data
  switch (type) {
    case TemplateActionsY1.Initialize:
      return {
        ...state,
        isInitialized: true
      }
    case TemplateActionsY1.DBInitialize:
      return {
        ...state,
        isDBInitialized: true
      }
    case TemplateActionsY1.DBInitializationFail:
      return {
        ...state,
        isDBInitializationFailed: response?.isDBInitializationFailed ?? true
      }
    case TemplateActionsY1.SetYamlHandler:
      return {
        ...state,
        yamlHandler: data.response?.yamlHandler
      }
    case TemplateActionsY1.UpdateTemplateView:
      return {
        ...state,
        templateView: response?.templateView
          ? clone({ ...state.templateView, ...response?.templateView })
          : state.templateView
      }
    case TemplateActionsY1.UpdateTemplate:
      return {
        ...state,
        isUpdated: response?.isUpdated ?? true,
        template: response?.template ? clone(response?.template) : state.template
      }
    case TemplateActionsY1.Fetching:
      return {
        ...state,
        isLoading: true,
        isBETemplateUpdated: false,
        isUpdated: false
      }
    case TemplateActionsY1.Loading:
      return {
        ...state,
        isLoading: response?.isLoading ?? true
      }
    case TemplateActionsY1.Success:
    case TemplateActionsY1.Error:
      return { ...state, isLoading: false, ...response }
    case TemplateActionsY1.IntermittentLoading:
      return {
        ...state,
        isIntermittentLoading: !!response?.isIntermittentLoading
      }
    default:
      return state
  }
}
