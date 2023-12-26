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
import type { GetPipelineQueryParams } from 'services/pipeline-ng'
import { useLocalStorage } from '@common/hooks'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { EntityGitDetails, NGTemplateInfoConfig } from 'services/template-ng'
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
import { isFreePlan, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import useNavModuleInfo from '@common/hooks/useNavModuleInfo'
import { LICENSE_STATE_VALUES } from 'framework/LicenseStore/licenseStoreUtil'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import useThunkReducer from '@modules/10-common/hooks/useThunkReducer'
import { useIDBContext } from '@modules/10-common/components/IDBContext/IDBContext'
import { initialState, TemplateReducer, TemplateReducerState, TemplateViewData } from './TemplateReducer'
import { TemplateContextActions } from './TemplateActions'
import { isNewTemplate } from '../TemplateStudioUtils'
import {
  deleteTemplateCacheAction,
  FetchTemplateUnboundProps,
  fetchTemplateV1Action,
  fetchTemplateV2Action,
  updateGitDetailsAction,
  updateStoreMetadataAction,
  updateTemplateAction
} from './TemplateAsyncActions'
import { TemplatePayload } from './types'

export interface TemplateAttributes {
  type: string
  primaryColor: Color
  secondaryColor: Color
}
export interface TemplatesMap {
  [key: string]: TemplateAttributes
}

export interface TemplateContextInterface {
  state: TemplateReducerState
  view: string
  isReadonly: boolean
  setView: (view: SelectedView) => void
  fetchTemplate: (args: FetchTemplateUnboundProps) => Promise<void>
  setYamlHandler: (yamlHandler: YamlBuilderHandlerBinding) => void
  updateTemplate: (template: NGTemplateInfoConfig) => Promise<void>
  updateTemplateView: (data: TemplateViewData) => void
  deleteTemplateCache: (gitDetails?: EntityGitDetails) => Promise<void>
  updateGitDetails: (gitDetails: EntityGitDetails) => Promise<void>
  updateStoreMetadata: (storeMetadata: StoreMetadata, gitDetails?: EntityGitDetails) => Promise<void>
  renderPipelineStage?: PipelineContextInterface['renderPipelineStage']
  /** Useful for setting any intermittent loading state. Eg. any API call loading, any custom loading, etc */
  setIntermittentLoading: (isIntermittentLoading: boolean) => void
}

export const TemplateContext = React.createContext<TemplateContextInterface>({
  state: initialState,
  isReadonly: false,
  view: SelectedView.VISUAL,
  setView: /* istanbul ignore next */ () => void 0,
  fetchTemplate: /* istanbul ignore next */ () => new Promise<void>(() => undefined),
  updateTemplateView: /* istanbul ignore next */ () => undefined,
  setYamlHandler: /* istanbul ignore next */ () => undefined,
  updateTemplate: /* istanbul ignore next */ () => new Promise<void>(() => undefined),
  deleteTemplateCache: /* istanbul ignore next */ () => new Promise<void>(() => undefined),
  updateGitDetails: /* istanbul ignore next */ () => new Promise<void>(() => undefined),
  updateStoreMetadata: /* istanbul ignore next */ () => new Promise<void>(() => undefined),
  renderPipelineStage: () => <div />,
  /** Useful for setting any intermittent loading state. Eg. any API call loading, any custom loading, etc */
  setIntermittentLoading: () => undefined
})

export const TemplateProvider: React.FC<{
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

  const {
    idb,
    initializationFailed: idbInitializationFailed,
    initialized: idbInitialized
  } = useIDBContext<TemplatePayload>()

  const [state, dispatch] = useThunkReducer(
    TemplateReducer,
    merge(
      {
        template: {
          projectIdentifier: queryParams.projectIdentifier,
          orgIdentifier: queryParams.orgIdentifier
        },
        originalTemplate: {
          projectIdentifier: queryParams.projectIdentifier,
          orgIdentifier: queryParams.orgIdentifier
        }
      },
      { ...initialState, template: { ...initialState.template, identifier: templateIdentifier } }
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
    async (templateArg: NGTemplateInfoConfig | ((p: NGTemplateInfoConfig) => NGTemplateInfoConfig)) => {
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
    [dispatch, templateIdentifier, versionLabel, queryParams, idb]
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
    [dispatch, templateIdentifier, versionLabel, queryParams, idb]
  )

  const deleteTemplateCache = useCallback(async (): Promise<void> => {
    return dispatch(
      deleteTemplateCacheAction({ queryParams, identifier: templateIdentifier, versionLabel, utils: { idb } })
    )
  }, [dispatch, queryParams, templateIdentifier, versionLabel, idb])

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
      dispatch(TemplateContextActions.setYamlHandler({ yamlHandler }))
    },
    [dispatch]
  )

  const updateTemplateView = React.useCallback(
    (data: TemplateViewData) => {
      dispatch(TemplateContextActions.updateTemplateView({ templateView: data }))
    },
    [dispatch]
  )

  const setIntermittentLoading = React.useCallback(
    (isIntermittentLoading: boolean) => {
      dispatch(TemplateContextActions.setIntermittentLoading({ isIntermittentLoading }))
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
      isSTOEnabled:
        licenseInformation['STO']?.status === LICENSE_STATE_VALUES.ACTIVE ||
        (licenseInformation['CI']?.status === LICENSE_STATE_VALUES.ACTIVE &&
          isFreePlan(licenseInformation, ModuleName.CI)),
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
      /* istanbul ignore next */
      abortControllerRef.current = new AbortController()

      /* istanbul ignore next */
      fetchTemplate({ forceFetch: true, signal: abortControllerRef.current?.signal })
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
    <TemplateContext.Provider
      value={{
        state,
        view,
        setView,
        isReadonly,
        fetchTemplate,
        updateTemplate,
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
    </TemplateContext.Provider>
  )
}
