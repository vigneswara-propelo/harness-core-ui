/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { merge } from 'lodash-es'
import { VisualYamlSelectedView as SelectedView } from '@harness/uicore'
import type { Color } from '@harness/design-system'
import { useLocation } from 'react-router-dom'
import type { GetPipelineQueryParams } from 'services/pipeline-ng'
import { useLocalStorage } from '@common/hooks'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { EntityGitDetails } from 'services/template-ng'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { usePermission } from '@rbac/hooks/usePermission'
import type { PermissionCheck } from 'services/rbac'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import type { PipelineContextInterface } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { getPipelineStages } from '@pipeline/components/PipelineStudio/PipelineStagesUtils'
import type { PipelineStagesProps } from '@pipeline/components/PipelineStages/PipelineStages'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import useNavModuleInfo from '@common/hooks/useNavModuleInfo'
import { LICENSE_STATE_VALUES } from 'framework/LicenseStore/licenseStoreUtil'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { isNewTemplate } from '@templates-library/components/TemplateStudio/TemplateStudioUtils'
import {
  NGTemplateInfoConfigY1_Tmp,
  TemplateMetadata_Tmp,
  TemplatePayloadY1
} from '@modules/72-templates-library/y1/components/TemplateContext/types'
import { TemplateMetadataForRouter } from '@templates-library/pages/TemplatesPage/views/NewTemplatePopover/useCreateTemplateModalY1'
import { useIDBContext } from '@modules/10-common/components/IDBContext/IDBContext'
import useThunkReducer from '@modules/10-common/hooks/useThunkReducer'
import { initialState, TemplateReducer, TemplateReducerStateY1, TemplateViewDataY1 } from './TemplateReducerY1'
import { TemplateContextActionsY1 } from './TemplateActionsY1'
import {
  deleteTemplateCacheAction,
  FetchTemplateUnboundProps,
  fetchTemplateV1Action,
  fetchTemplateV2Action,
  updateGitDetailsAction,
  updateStoreMetadataAction,
  updateTemplateAction,
  updateTemplateMetadataAction
} from './TemplateAsyncActionsY1'

export interface TemplateAttributes {
  type: string
  primaryColor: Color
  secondaryColor: Color
}
export interface TemplatesMap {
  [key: string]: TemplateAttributes
}

export interface TemplateContextInterfaceY1 {
  state: TemplateReducerStateY1
  view: string
  isReadonly: boolean
  setView: (view: SelectedView) => void
  fetchTemplate: (args: FetchTemplateUnboundProps) => Promise<void>
  setYamlHandler: (yamlHandler: YamlBuilderHandlerBinding) => void
  updateTemplate: (template: NGTemplateInfoConfigY1_Tmp) => Promise<void>
  updateTemplateMetadata: (templateMetadata: TemplateMetadata_Tmp) => Promise<void>
  updateTemplateView: (data: TemplateViewDataY1) => void
  deleteTemplateCache: (gitDetails?: EntityGitDetails) => Promise<void>
  updateGitDetails: (gitDetails: EntityGitDetails) => Promise<void>
  updateStoreMetadata: (storeMetadata: StoreMetadata, gitDetails?: EntityGitDetails) => Promise<void>
  renderPipelineStage?: PipelineContextInterface['renderPipelineStage']
  /** Useful for setting any intermittent loading state. Eg. any API call loading, any custom loading, etc */
  setIntermittentLoading: (isIntermittentLoading: boolean) => void
}

export const TemplateContextY1 = React.createContext<TemplateContextInterfaceY1>({
  state: initialState,
  isReadonly: false,
  view: SelectedView.VISUAL,
  setView: /* istanbul ignore next */ () => void 0,
  fetchTemplate: /* istanbul ignore next */ () => new Promise<void>(() => undefined),
  updateTemplateView: /* istanbul ignore next */ () => undefined,
  setYamlHandler: /* istanbul ignore next */ () => undefined,
  updateTemplate: /* istanbul ignore next */ () => new Promise<void>(() => undefined),
  updateTemplateMetadata: /* istanbul ignore next */ () => new Promise<void>(() => undefined),
  deleteTemplateCache: /* istanbul ignore next */ () => new Promise<void>(() => undefined),
  updateGitDetails: /* istanbul ignore next */ () => new Promise<void>(() => undefined),
  updateStoreMetadata: /* istanbul ignore next */ () => new Promise<void>(() => undefined),
  renderPipelineStage: () => <div />,
  /** Useful for setting any intermittent loading state. Eg. any API call loading, any custom loading, etc */
  setIntermittentLoading: () => undefined
})

export const TemplateProviderY1: React.FC<{
  queryParams: GetPipelineQueryParams
  module: Module
  templateIdentifier: string
  versionLabel?: string
  templateType: string
}> = ({ queryParams, module, templateIdentifier, versionLabel, templateType, children }) => {
  const { repoIdentifier, branch } = queryParams
  const { supportingTemplatesGitx } = useAppStore()
  const { FF_LICENSE_STATE, licenseInformation } = useLicenseStore()
  const { IACM_ENABLED } = useFeatureFlags()
  const { getString } = useStrings()
  const { state: routerState } = useLocation<Optional<TemplateMetadataForRouter>>()

  const {
    idb,
    initializationFailed: idbInitializationFailed,
    initialized: idbInitialized
  } = useIDBContext<TemplatePayloadY1>()

  const [state, dispatch] = useThunkReducer(
    TemplateReducer,
    merge(
      {
        //template: {
        // projectIdentifier: queryParams.projectIdentifier,
        // orgIdentifier: queryParams.orgIdentifier
        //},
        //originalTemplate: {
        // projectIdentifier: queryParams.projectIdentifier,
        // orgIdentifier: queryParams.orgIdentifier
      },
      { ...initialState, template: { ...initialState.template } } //identifier: templateIdentifier
    )
  )

  const [view, setView] = useLocalStorage<SelectedView>(
    'pipeline_studio_view',
    state.entityValidityDetails.valid === false ? SelectedView.YAML : SelectedView.VISUAL
  )

  // state.templateIdentifier = templateIdentifier

  const fetchTemplate = useCallback(
    async (fetchProps: FetchTemplateUnboundProps) => {
      return supportingTemplatesGitx
        ? dispatch(
            fetchTemplateV2Action(
              {
                queryParams,
                templateIdentifier,
                versionLabel,
                gitDetails: {
                  branch
                },
                templateType,
                isGitCacheEnabled: true,
                isDBInitializationFailed: state.isDBInitialized ? false : state.isDBInitializationFailed
              },
              fetchProps,
              { idb }
            )
          )
        : dispatch(
            fetchTemplateV1Action(
              {
                queryParams,
                templateIdentifier,
                versionLabel,
                gitDetails: {
                  repoIdentifier,
                  branch
                },
                templateType,
                isGitCacheEnabled: true,
                isDBInitializationFailed: state.isDBInitialized ? false : state.isDBInitializationFailed
              },
              fetchProps,
              { idb }
            )
          )
    },
    [
      dispatch,
      idb,
      supportingTemplatesGitx,
      queryParams,
      templateIdentifier,
      versionLabel,
      templateType,
      state.isDBInitialized,
      state.isDBInitializationFailed,
      branch,
      repoIdentifier
    ]
  )

  const updateTemplate = useCallback(
    async (
      templateArg: NGTemplateInfoConfigY1_Tmp | ((p: NGTemplateInfoConfigY1_Tmp) => NGTemplateInfoConfigY1_Tmp)
    ) => {
      return dispatch(
        updateTemplateAction({
          templateArg,
          params: {
            queryParams,
            identifier: templateIdentifier,
            versionLabel: versionLabel
          },
          utils: { idb }
        })
      )
    },
    [dispatch, queryParams, templateIdentifier, versionLabel, idb]
  )

  const updateTemplateMetadata = useCallback(
    async (templateMetadata: TemplateMetadata_Tmp) => {
      return dispatch(
        updateTemplateMetadataAction({
          templateMetadata,
          params: {
            queryParams,
            identifier: templateIdentifier,
            versionLabel: versionLabel
          },
          utils: { idb }
        })
      )
    },
    [dispatch, queryParams, templateIdentifier, versionLabel, idb]
  )

  const updateGitDetails = useCallback(
    async (gitDetails: EntityGitDetails) => {
      return dispatch(
        updateGitDetailsAction({
          gitDetails,
          params: {
            queryParams,
            identifier: templateIdentifier,
            versionLabel: versionLabel
          },
          utils: { idb }
        })
      )
    },
    [dispatch, templateIdentifier, versionLabel, queryParams]
  )

  const updateStoreMetadata = useCallback(
    async (storeMetadata: StoreMetadata, gitDetails?: EntityGitDetails) => {
      return dispatch(
        updateStoreMetadataAction({
          args: {
            queryParams,
            identifier: templateIdentifier,
            versionLabel: versionLabel
          },
          storeMetadata,
          gitDetails,
          utils: { idb }
        })
      )
    },
    [dispatch, templateIdentifier, versionLabel, queryParams]
  )

  const deleteTemplateCache = useCallback(async (): Promise<void> => {
    return dispatch(
      deleteTemplateCacheAction({ queryParams, identifier: templateIdentifier, versionLabel, utils: { idb } })
    )
  }, [dispatch, queryParams, templateIdentifier, versionLabel])

  const [isEdit] = usePermission(
    {
      resourceScope: {
        accountIdentifier: queryParams.accountIdentifier,
        orgIdentifier: queryParams.orgIdentifier,
        projectIdentifier: queryParams.projectIdentifier
      },
      resource: {
        resourceType: ResourceType.TEMPLATE,
        resourceIdentifier: templateIdentifier
      },
      permissions: [PermissionIdentifier.EDIT_TEMPLATE],
      options: {
        skipCache: true,
        skipCondition: (permissionCheck: PermissionCheck) => {
          /* istanbul ignore next */
          return permissionCheck.resourceIdentifier === '-1'
        }
      }
    },
    [queryParams.accountIdentifier, queryParams.orgIdentifier, queryParams.projectIdentifier, templateIdentifier]
  )

  const isReadonly = !isEdit

  const setYamlHandler = React.useCallback(
    (yamlHandler: YamlBuilderHandlerBinding) => {
      dispatch(TemplateContextActionsY1.setYamlHandler({ yamlHandler }))
    },
    [dispatch]
  )

  const updateTemplateView = React.useCallback(
    (data: TemplateViewDataY1) => {
      dispatch(TemplateContextActionsY1.updateTemplateView({ templateView: data }))
    },
    [dispatch]
  )

  const setIntermittentLoading = React.useCallback(
    (isIntermittentLoading: boolean) => {
      dispatch(TemplateContextActionsY1.setIntermittentLoading({ isIntermittentLoading }))
    },
    [dispatch]
  )

  const { shouldVisible } = useNavModuleInfo(ModuleName.CD)

  const renderPipelineStage = (args: Omit<PipelineStagesProps, 'children'>): React.ReactElement<PipelineStagesProps> =>
    getPipelineStages({
      args,
      getString,
      module,
      isCIEnabled: licenseInformation['CI']?.status === LICENSE_STATE_VALUES.ACTIVE,
      isCDEnabled: shouldVisible,
      isCFEnabled: licenseInformation['CF'] && FF_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE,
      isSTOEnabled: licenseInformation['STO']?.status === LICENSE_STATE_VALUES.ACTIVE,
      isApprovalStageEnabled: true,
      isIACMEnabled: IACM_ENABLED
    })

  React.useEffect(() => {
    // avoid initial call by checking isInitialized
    if (state.isInitialized) {
      fetchTemplate({ forceFetch: true, forceUpdate: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateIdentifier, versionLabel])

  React.useEffect(() => {
    // avoid initial call by checking isInitialized
    if (state.isInitialized) {
      if (!isNewTemplate(templateIdentifier)) {
        fetchTemplate({ forceFetch: true, forceUpdate: true })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoIdentifier, branch])

  const abortControllerRef = React.useRef<AbortController | null>(null)
  React.useEffect(() => {
    if (idbInitialized || idbInitializationFailed) {
      if (!routerState?.data) {
        /* istanbul ignore next */
        abortControllerRef.current = new AbortController()

        /* istanbul ignore next */
        fetchTemplate({ forceFetch: true, signal: abortControllerRef.current?.signal })
      } else {
        dispatch(TemplateContextActionsY1.initialized())
      }
    }

    return () => {
      if (abortControllerRef.current) {
        /* istanbul ignore next */
        abortControllerRef.current.abort()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idbInitializationFailed, idbInitialized])

  return (
    <TemplateContextY1.Provider
      value={{
        state,
        view,
        setView,
        isReadonly,
        fetchTemplate,
        updateTemplate,
        updateTemplateMetadata,
        updateTemplateView,
        deleteTemplateCache,
        setYamlHandler,
        updateGitDetails,
        updateStoreMetadata,
        renderPipelineStage,
        setIntermittentLoading
      }}
    >
      {children}
    </TemplateContextY1.Provider>
  )
}
