/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { clone } from 'lodash-es'
import type { IDrawerProps } from '@blueprintjs/core'
import type { GetDataError } from 'restful-react'
import type { YamlSnippetMetaData } from 'services/cd-ng'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import type {
  EntityGitDetails,
  EntityValidityDetails,
  ErrorNodeSummary,
  Failure,
  YamlSchemaErrorWrapperDTO,
  PipelineInfoConfig,
  CacheResponseMetadata
} from 'services/pipeline-ng'
import type { DependencyElement } from 'services/ci'
import type { TemplateServiceDataType } from '@pipeline/utils/templateUtils'
import type { TemplateIcons } from '@pipeline/utils/types'
import type { NodeStateMetadata } from '@pipeline/components/PipelineDiagram/Nodes/NodeMetadataContext'
import {
  AdvancedPanels,
  StepOrStepGroupOrTemplateStepData
} from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { StepState } from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'

export enum PipelineActionsY1 {
  DBInitialize = 'DBInitialize',
  DBInitializationFail = 'DBInitializationFail',
  UpdateSelection = 'UpdateSelection',
  Initialize = 'Initialize',
  Fetching = 'Fetching',
  Loading = 'Loading',
  IntermittentLoading = 'IntermittentLoading',
  UpdatePipelineView = 'UpdatePipelineView',
  UpdateTemplateView = 'UpdateTemplateView',
  UpdatePipeline = 'UpdatePipeline',
  SetYamlHandler = 'SetYamlHandler',
  SetTemplateTypes = 'SetTemplateTypes',
  SetTemplateServiceData = 'SetTemplateServiceData',
  SetTemplateIcons = 'SetTemplateIcons',
  SetResolvedCustomDeploymentDetailsByRef = 'SetResolvedCustomDeploymentDetailsByRef',
  UpdateSchemaErrorsFlag = 'UpdateSchemaErrorsFlag',
  Success = 'Success',
  Error = 'Error',
  SetValidationUuid = 'SetValidationUuid',
  RouteStateChange = 'RouteStateChange'
}
export const DefaultNewPipelineId = '-1'

export enum DrawerTypesY1 {
  StepConfig = 'StepConfig',
  StepGroupConfig = 'StepGroupConfig',
  AddStep = 'AddCommand',
  PipelineVariables = 'PipelineVariables',
  Templates = 'Templates',
  ExecutionStrategy = 'ExecutionStrategy',
  AddService = 'AddService',
  ConfigureService = 'ConfigureService',
  PipelineNotifications = 'PipelineNotifications',
  FlowControl = 'FlowControl',
  AdvancedOptions = 'AdvancedOptions',
  PolicySets = 'PolicySets',
  ProvisionerStepConfig = 'ProvisionerStepConfig',
  AddProvisionerStep = 'AddProvisionerStep',
  TemplateInputs = 'TemplateInputs',
  ViewTemplateDetails = 'ViewTemplateDetails',
  RuntimeInputs = 'RuntimeInputs'
}

export const DrawerSizesY1: Record<DrawerTypesY1, React.CSSProperties['width']> = {
  [DrawerTypesY1.StepConfig]: 600,
  [DrawerTypesY1.AddStep]: 700,
  [DrawerTypesY1.ProvisionerStepConfig]: 600,
  [DrawerTypesY1.AddProvisionerStep]: 700,
  [DrawerTypesY1.PipelineVariables]: 1147,
  [DrawerTypesY1.StepGroupConfig]: 872,
  [DrawerTypesY1.Templates]: 450,
  [DrawerTypesY1.ExecutionStrategy]: 1136,
  [DrawerTypesY1.AddService]: 485,
  [DrawerTypesY1.ConfigureService]: 600,
  [DrawerTypesY1.PipelineNotifications]: 'calc(100% - 270px - 60px)', // has 60px more offset from right
  [DrawerTypesY1.FlowControl]: 600,
  [DrawerTypesY1.AdvancedOptions]: 840,
  [DrawerTypesY1.PolicySets]: 'calc(100% - 270px - 60px)',
  [DrawerTypesY1.TemplateInputs]: 876,
  [DrawerTypesY1.ViewTemplateDetails]: 600,
  [DrawerTypesY1.RuntimeInputs]: 1147
}

export enum SplitViewTypesY1 {
  Notifications = 'Notifications',
  StageView = 'StageView'
}
export interface DrawerDataY1 extends Omit<IDrawerProps, 'isOpen'> {
  type: DrawerTypesY1
  data?: {
    paletteData?: {
      isRollback: boolean
      isParallelNodeClicked: boolean
      onUpdate?: (stepOrGroup: StepOrStepGroupOrTemplateStepData | DependencyElement) => void
      entity: unknown
      stepsMap: Map<string, StepState>
      relativeBasePath?: string
      hiddenAdvancedPanels?: AdvancedPanels[]
    }
    stepConfig?: {
      node: StepOrStepGroupOrTemplateStepData | DependencyElement
      addOrEdit: 'add' | 'edit'
      isStepGroup: boolean
      stepsMap: Map<string, StepState>
      onUpdate?: (stepOrGroup: StepOrStepGroupOrTemplateStepData | DependencyElement) => void
      isUnderStepGroup?: boolean
      relativeBasePath?: string
      hiddenAdvancedPanels?: AdvancedPanels[]
      nodeStateMetadata?: NodeStateMetadata
      isAnyParentContainerStepGroup?: boolean
    }
  }
}

export interface PipelineViewDataY1 {
  isSplitViewOpen: boolean
  isYamlEditable: boolean
  splitViewData: {
    type?: SplitViewTypesY1
  }
  isDrawerOpened: boolean
  drawerData: DrawerDataY1
  isRollbackToggled?: boolean
}

export interface SelectionStateY1 {
  selectedStageId?: string
  selectedStepId?: string
  selectedSectionId?: string
}

export interface PipelineMetadata {
  name: string
  identifier: string
  description?: string
  orgIdentifier?: string
  projectIdentifier?: string
  tags?: {
    [key: string]: string
  }
}

export interface RouteStateY1 {
  accountIdentifier: string
  projectIdentifier: string
  orgIdentifier: string
  pipelineIdentifier?: string
  module?: string
  branch?: string
  repoIdentifier?: string
  repoName?: string
  connectorRef?: string
  storeType?: 'INLINE' | 'REMOTE' | undefined
}
export interface PipelineReducerStateY1 {
  pipeline: PipelineInfoConfig
  pipelineMetadata: PipelineMetadata
  yamlHandler?: YamlBuilderHandlerBinding
  originalPipeline: PipelineInfoConfig
  pipelineView: PipelineViewDataY1
  pipelineIdentifier: string
  error?: string
  schemaErrors: boolean
  templateTypes: { [key: string]: string }
  templateServiceData: TemplateServiceDataType
  templateIcons?: TemplateIcons
  resolvedCustomDeploymentDetailsByRef: { [key: string]: Record<string, string | string[]> }
  storeMetadata?: StoreMetadata
  gitDetails: EntityGitDetails
  entityValidityDetails: EntityValidityDetails
  isDBInitialized: boolean
  isDBInitializationFailed: boolean
  isLoading: boolean
  isIntermittentLoading: boolean
  isInitialized: boolean
  isBEPipelineUpdated: boolean
  isUpdated: boolean
  modules: string[]
  snippets?: YamlSnippetMetaData[]
  selectionState: SelectionStateY1
  templateError?: GetDataError<Failure | Error> | null
  remoteFetchError?: GetDataError<Failure | Error> | null
  yamlSchemaErrorWrapper?: YamlSchemaErrorWrapperDTO
  cacheResponse?: CacheResponseMetadata
  validationUuid?: string
  /** contains both path-params and query-params */
  routeState: RouteStateY1
}

export const DefaultPipeline: PipelineInfoConfig & { version: number } = {
  name: '',
  identifier: DefaultNewPipelineId,
  version: 1
}

export interface ActionResponse {
  error?: string
  schemaErrors?: boolean
  isUpdated?: boolean
  isLoading?: boolean
  isDBInitializationFailed?: boolean
  modules?: string[]
  storeMetadata?: StoreMetadata
  gitDetails?: EntityGitDetails
  entityValidityDetails?: EntityValidityDetails
  cacheResponse?: CacheResponseMetadata
  pipeline?: PipelineInfoConfig
  pipelineIdentifier?: string
  yamlHandler?: YamlBuilderHandlerBinding
  templateTypes?: { [key: string]: string }
  templateServiceData?: TemplateServiceDataType
  templateIcons?: TemplateIcons
  resolvedCustomDeploymentDetailsByRef?: { [key: string]: Record<string, string | string[]> }
  originalPipeline?: PipelineInfoConfig
  isIntermittentLoading?: boolean
  isBEPipelineUpdated?: boolean
  pipelineView?: PipelineViewDataY1
  selectionState?: SelectionStateY1
  templateError?: GetDataError<Failure | Error> | null
  remoteFetchError?: GetDataError<Failure | Error> | null
  templateInputsErrorNodeSummary?: ErrorNodeSummary
  yamlSchemaErrorWrapper?: YamlSchemaErrorWrapperDTO
  validationUuid?: string
  routeState?: RouteStateY1
  pipelineMetadata?: PipelineMetadata
}

export interface ActionReturnTypeY1 {
  type: PipelineActionsY1
  response?: ActionResponse
}

const dbInitialized = (): ActionReturnTypeY1 => ({ type: PipelineActionsY1.DBInitialize })
const setDBInitializationFailed = (
  isDBInitializationFailed: PipelineReducerStateY1['isDBInitializationFailed']
): ActionReturnTypeY1 => ({
  type: PipelineActionsY1.DBInitializationFail,
  response: { isDBInitializationFailed }
})
const initialized = (): ActionReturnTypeY1 => ({ type: PipelineActionsY1.Initialize })
const updatePipelineView = (response: ActionResponse): ActionReturnTypeY1 => ({
  type: PipelineActionsY1.UpdatePipelineView,
  response
})
const updateTemplateView = (response: ActionResponse): ActionReturnTypeY1 => ({
  type: PipelineActionsY1.UpdateTemplateView,
  response
})
const setYamlHandler = (response: ActionResponse): ActionReturnTypeY1 => ({
  type: PipelineActionsY1.SetYamlHandler,
  response
})
const setTemplateTypes = (response: ActionResponse): ActionReturnTypeY1 => ({
  type: PipelineActionsY1.SetTemplateTypes,
  response
})
const setTemplateServiceData = (response: ActionResponse): ActionReturnTypeY1 => ({
  type: PipelineActionsY1.SetTemplateServiceData,
  response
})
const setTemplateIcons = (response: ActionResponse): ActionReturnTypeY1 => ({
  type: PipelineActionsY1.SetTemplateIcons,
  response
})
const setResolvedCustomDeploymentDetailsByRef = (response: ActionResponse): ActionReturnTypeY1 => ({
  type: PipelineActionsY1.SetResolvedCustomDeploymentDetailsByRef,
  response
})
const setLoading = (isLoading: PipelineReducerStateY1['isLoading']): ActionReturnTypeY1 => ({
  type: PipelineActionsY1.Loading,
  response: { isLoading }
})
const fetching = (): ActionReturnTypeY1 => ({ type: PipelineActionsY1.Fetching })
const setIntermittentLoading = (response: ActionResponse): ActionReturnTypeY1 => ({
  type: PipelineActionsY1.IntermittentLoading,
  response
})
const setValidationUuid = (response: ActionResponse): ActionReturnTypeY1 => ({
  type: PipelineActionsY1.SetValidationUuid,
  response
})
const success = (response: ActionResponse): ActionReturnTypeY1 => ({ type: PipelineActionsY1.Success, response })
const error = (response: ActionResponse): ActionReturnTypeY1 => ({ type: PipelineActionsY1.Error, response })
const updateSchemaErrorsFlag = (response: ActionResponse): ActionReturnTypeY1 => ({
  type: PipelineActionsY1.UpdateSchemaErrorsFlag,
  response
})
const updateSelectionState = (response: ActionResponse): ActionReturnTypeY1 => ({
  type: PipelineActionsY1.UpdateSelection,
  response
})
const setRouteStateParams = (response: ActionResponse): ActionReturnTypeY1 => ({
  type: PipelineActionsY1.RouteStateChange,
  response
})
export const PipelineContextActionsY1 = {
  dbInitialized,
  setDBInitializationFailed,
  initialized,
  setLoading,
  fetching,
  updatePipelineView,
  updateTemplateView,
  setYamlHandler,
  setTemplateTypes,
  setTemplateServiceData,
  setTemplateIcons,
  setResolvedCustomDeploymentDetailsByRef,
  success,
  error,
  updateSchemaErrorsFlag,
  updateSelectionState,
  setIntermittentLoading,
  setValidationUuid,
  setRouteStateParams
}

export const initialState: PipelineReducerStateY1 = {
  pipeline: { ...DefaultPipeline },
  originalPipeline: { ...DefaultPipeline },
  pipelineIdentifier: DefaultNewPipelineId,
  pipelineView: {
    isSplitViewOpen: false,
    isDrawerOpened: false,
    isYamlEditable: true,
    splitViewData: {},
    drawerData: {
      type: DrawerTypesY1.AddStep
    }
  },
  schemaErrors: false,
  storeMetadata: {},
  gitDetails: {},
  entityValidityDetails: {},
  cacheResponse: {} as CacheResponseMetadata,
  templateTypes: {},
  templateIcons: {},
  templateServiceData: {},
  resolvedCustomDeploymentDetailsByRef: {},
  isLoading: false,
  isIntermittentLoading: false,
  isBEPipelineUpdated: false,
  isDBInitialized: false,
  isDBInitializationFailed: false,
  isUpdated: false,
  modules: [],
  isInitialized: false,
  selectionState: {
    selectedStageId: undefined,
    selectedStepId: undefined,
    selectedSectionId: undefined
  },
  routeState: {
    accountIdentifier: '',
    orgIdentifier: '',
    projectIdentifier: ''
  },
  pipelineMetadata: {
    name: '',
    identifier: ''
  } as PipelineMetadata
}

export const PipelineReducer = (state = initialState, data: ActionReturnTypeY1): PipelineReducerStateY1 => {
  const { type, response } = data
  switch (type) {
    case PipelineActionsY1.Initialize:
      return {
        ...state,
        isInitialized: true
      }
    case PipelineActionsY1.DBInitialize:
      return {
        ...state,
        isDBInitialized: true
      }
    case PipelineActionsY1.DBInitializationFail:
      return {
        ...state,
        isDBInitializationFailed: response?.isDBInitializationFailed ?? true
      }
    case PipelineActionsY1.UpdateSchemaErrorsFlag:
      return {
        ...state,
        schemaErrors: response?.schemaErrors ?? state.schemaErrors
      }
    case PipelineActionsY1.SetYamlHandler:
      return {
        ...state,
        yamlHandler: data.response?.yamlHandler
      }
    case PipelineActionsY1.SetTemplateTypes:
      return {
        ...state,
        templateTypes: data.response?.templateTypes || {}
      }
    case PipelineActionsY1.SetTemplateServiceData:
      return {
        ...state,
        templateServiceData: data.response?.templateServiceData || {}
      }
    case PipelineActionsY1.SetTemplateIcons:
      return {
        ...state,
        templateIcons: data.response?.templateIcons || {}
      }
    case PipelineActionsY1.SetResolvedCustomDeploymentDetailsByRef:
      return {
        ...state,
        resolvedCustomDeploymentDetailsByRef: data.response?.resolvedCustomDeploymentDetailsByRef || {}
      }
    case PipelineActionsY1.UpdatePipelineView:
      return {
        ...state,
        pipelineView: response?.pipelineView
          ? clone({ ...state.pipelineView, ...response?.pipelineView })
          : state.pipelineView
      }
    case PipelineActionsY1.UpdatePipeline:
      return {
        ...state,
        isUpdated: response?.isUpdated ?? true,
        pipeline: response?.pipeline ? clone(response?.pipeline) : state.pipeline
      }
    case PipelineActionsY1.Fetching:
      return {
        ...state,
        isLoading: true,
        isBEPipelineUpdated: false,
        isUpdated: false
      }
    case PipelineActionsY1.Loading:
      return {
        ...state,
        isLoading: response?.isLoading ?? true
      }
    case PipelineActionsY1.Success:
    case PipelineActionsY1.Error:
      return { ...state, isLoading: false, ...response }
    case PipelineActionsY1.UpdateSelection:
      return {
        ...state,
        selectionState: response?.selectionState || state.selectionState
      }
    case PipelineActionsY1.IntermittentLoading:
      return {
        ...state,
        isIntermittentLoading: !!response?.isIntermittentLoading
      }
    case PipelineActionsY1.SetValidationUuid:
      return {
        ...state,
        validationUuid: response?.validationUuid
      }
    case PipelineActionsY1.RouteStateChange:
      return {
        ...state,
        routeState: {
          ...response?.routeState,
          ...{
            accountIdentifier: response?.routeState?.accountIdentifier ?? '',
            orgIdentifier: response?.routeState?.orgIdentifier ?? '',
            projectIdentifier: response?.routeState?.projectIdentifier ?? ''
          }
        }
      }
    default:
      return state
  }
}
